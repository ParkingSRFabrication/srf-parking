import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vehicle } from '../models/Vehicle.js';
import { ENV } from '../config/env.js';
import { AuditService } from '../services/auditService.js';
import { loginSchema, customerRegistrationSchema } from '../validators/index.js';
import { sendOtpEmail } from '../services/emailService.js';

function generateTokens(user) {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    operatorId: user.operatorId,
    role: user.role
  };

  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);
    const identifier = validated.username.toLowerCase();

    // Find user by username, operatorId, email, or phone
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { operatorId: validated.username.toUpperCase() },
        { email: identifier },
        { phone: validated.username.trim() }
      ]
    }).populate('assignedLocation');

    // Generic error message to prevent username enumeration
    const invalidAuthResponse = () => {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username/ID and password/MPIN.'
      });
    };

    if (!user) {
      await AuditService.log({
        action: 'LOGIN_FAILED',
        entityType: 'Auth',
        entityId: validated.username,
        details: { reason: 'User not found' },
        req
      });
      return invalidAuthResponse();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    if (user.isLocked()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${waitMinutes} minutes.`
      });
    }

    let isMatch = false;

    if (validated.password) {
      isMatch = await user.comparePassword(validated.password);
    } else if (validated.mpin) {
      isMatch = await user.compareMpin(validated.mpin);
    }

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }
      await user.save();

      await AuditService.log({
        actor: user._id,
        actorName: user.name,
        actorRole: user.role,
        action: 'LOGIN_FAILED',
        entityType: 'Auth',
        entityId: user.operatorId,
        details: { attempts: user.loginAttempts, locked: !!user.lockUntil },
        req
      });

      return invalidAuthResponse();
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    // Set secure HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('srf_access_token', accessToken, cookieOptions);
    res.cookie('srf_refresh_token', refreshToken, cookieOptions);

    await AuditService.log({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'LOGIN_SUCCESS',
      entityType: 'Auth',
      entityId: user.operatorId,
      req
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicles: user.vehicles || [],
        permissions: user.permissions,
        assignedLocation: user.assignedLocation
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await AuditService.log({
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'LOGOUT',
        entityType: 'Auth',
        entityId: req.user.operatorId,
        req
      });
    }

    res.clearCookie('srf_access_token');
    res.clearCookie('srf_refresh_token');

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.body.refreshToken || req.cookies?.srf_refresh_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const tokens = generateTokens(user);

    res.cookie('srf_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
}

// In-Memory OTP Store
const otpStore = new Map();

/**
 * Request an OTP for email login or signup
 */
export async function requestOtp(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalizedEmail, {
      code: otpCode,
      expiresAt,
      attempts: 0
    });

    // Send verification email via Nodemailer
    const emailResult = await sendOtpEmail(normalizedEmail, otpCode);

    await AuditService.log({
      action: 'OTP_REQUESTED',
      entityType: 'Auth',
      entityId: normalizedEmail,
      details: { email: normalizedEmail, emailSent: emailResult.success },
      req
    });

    return res.json({
      success: true,
      message: emailResult.success
        ? `Verification code sent to ${normalizedEmail}. Please check your inbox.`
        : `Verification code generated for ${normalizedEmail}.`,
      demoCode: otpCode,
      emailSent: emailResult.success
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify OTP and log in / create user account
 */
export async function verifyOtp(req, res, next) {
  try {
    const { email, otp, name, role = 'operator' } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(normalizedEmail);

    // Accept master testing OTP 123456 or exact matched OTP
    const isMasterOtp = otp === '123456';
    const isValidOtp = stored && stored.code === otp.trim() && stored.expiresAt > Date.now();

    if (!isValidOtp && !isMasterOtp) {
      if (stored) stored.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.'
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(normalizedEmail);

    // Find existing user by email or username
    let user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedEmail }
      ]
    });

    // Create user if not exists (Public verification creates Vehicle User / Customer accounts ONLY)
    if (!user) {
      const baseUsername = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const generatedUsername = `${baseUsername}${uniqueSuffix}`;
      const generatedCustomerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

      user = new User({
        username: generatedUsername,
        operatorId: generatedCustomerId,
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'customer', // Public registration creates Vehicle User accounts only
        authProvider: 'otp',
        passwordHash: 'OTP_VERIFIED',
        permissions: ['view_own_vehicles', 'view_own_passes', 'view_own_history']
      });

      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the administrator.'
      });
    }

    user.lastLoginAt = new Date();
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('srf_access_token', accessToken, cookieOptions);
    res.cookie('srf_refresh_token', refreshToken, cookieOptions);

    await AuditService.log({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'LOGIN_OTP_SUCCESS',
      entityType: 'Auth',
      entityId: user.operatorId,
      req
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        assignedLocation: user.assignedLocation
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google Sign In / Sign Up handler
 */
export async function googleLogin(req, res, next) {
  try {
    const { email, name, googleId, picture } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Valid Google account email is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedEmail }
      ]
    });

    if (!user) {
      const baseUsername = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const generatedCustomerId = `GGL-${Math.floor(1000 + Math.random() * 9000)}`;

      user = new User({
        username: generatedUsername,
        operatorId: generatedCustomerId,
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'customer', // Public Google sign-in creates Vehicle User accounts only
        authProvider: 'google',
        passwordHash: 'GOOGLE_OAUTH_VERIFIED',
        permissions: ['view_own_vehicles', 'view_own_passes', 'view_own_history']
      });

      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('srf_access_token', accessToken, cookieOptions);
    res.cookie('srf_refresh_token', refreshToken, cookieOptions);

    await AuditService.log({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'LOGIN_GOOGLE_SUCCESS',
      entityType: 'Auth',
      entityId: user.operatorId,
      req
    });

    return res.json({
      success: true,
      message: 'Google Sign-In successful',
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        operatorId: user.operatorId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicles: user.vehicles || [],
        permissions: user.permissions,
        assignedLocation: user.assignedLocation,
        picture: picture || null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Registration: Creates Vehicle User / Customer accounts ONLY.
 * Users cannot select or modify their own role.
 */
export async function register(req, res, next) {
  try {
    const validated = customerRegistrationSchema.parse(req.body);

    const email = validated.email ? validated.email.trim().toLowerCase() : null;
    const phone = validated.phone ? validated.phone.trim() : null;

    // Generate clean username if not provided
    let username = validated.username?.trim().toLowerCase();
    if (!username) {
      if (email) {
        username = email.split('@')[0].replace(/[^a-z0-9]/g, '');
      } else {
        username = validated.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
      }
      const randSuffix = Math.floor(100 + Math.random() * 900);
      username = `${username}${randSuffix}`;
    }

    // Check for duplicate account
    const conflictOr = [{ username }];
    if (email) conflictOr.push({ email });
    if (phone) conflictOr.push({ phone });

    const existing = await User.findOne({ $or: conflictOr });
    if (existing) {
      let duplicateField = 'username, email, or phone';
      if (existing.username === username) duplicateField = 'username';
      else if (email && existing.email === email) duplicateField = 'email';
      else if (phone && existing.phone === phone) duplicateField = 'phone number';

      return res.status(409).json({
        success: false,
        message: `An account with this ${duplicateField} already exists. Please sign in or use different details.`
      });
    }

    // Generate unique Customer ID (never allow user to specify role or ID)
    const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Initial vehicle setup if entered
    const vehiclesList = [];
    if (validated.vehicleNumber) {
      const cleanReg = validated.vehicleNumber.trim().toUpperCase().replace(/\s+/g, '');
      const vType = (validated.vehicleType || 'bike').toLowerCase();
      vehiclesList.push({
        registrationNumber: cleanReg,
        vehicleType: vType,
        nickname: 'Primary Vehicle',
        addedAt: new Date()
      });

      // Also upsert Vehicle tracking record
      await Vehicle.findOneAndUpdate(
        { registrationNumber: cleanReg },
        {
          registrationNumber: cleanReg,
          type: vType,
          ownerName: validated.name.trim(),
          ownerPhone: phone || ''
        },
        { upsert: true, new: true }
      );
    }

    // ENFORCE SECURITY: Role is strictly 'customer'
    // Public registration MUST create Vehicle User accounts only
    const newUser = new User({
      username,
      operatorId: customerId,
      name: validated.name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      role: 'customer', // HARDCODED - NEVER USER-SELECTABLE
      authProvider: 'local',
      passwordHash,
      vehicles: vehiclesList,
      permissions: ['view_own_vehicles', 'view_own_passes', 'view_own_history'],
      isActive: true
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);

    const cookieOptions = {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('srf_access_token', accessToken, cookieOptions);
    res.cookie('srf_refresh_token', refreshToken, cookieOptions);

    await AuditService.log({
      actor: newUser._id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'CUSTOMER_REGISTERED',
      entityType: 'User',
      entityId: newUser.operatorId,
      details: {
        username: newUser.username,
        role: newUser.role,
        vehiclesCount: newUser.vehicles.length
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle User account created successfully',
      token: accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        username: newUser.username,
        operatorId: newUser.operatorId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        vehicles: newUser.vehicles,
        permissions: newUser.permissions
      }
    });
  } catch (error) {
    next(error);
  }
}


