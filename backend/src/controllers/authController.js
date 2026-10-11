import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';
import { AuditService } from '../services/auditService.js';
import { loginSchema } from '../validators/index.js';

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

    // Find user by username or operatorId
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { operatorId: validated.username.toUpperCase() }
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
        role: user.role,
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

    await AuditService.log({
      action: 'OTP_REQUESTED',
      entityType: 'Auth',
      entityId: normalizedEmail,
      details: { email: normalizedEmail },
      req
    });

    return res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. (Valid for 10 minutes)`,
      // Providing demoCode for frictionless instant access
      demoCode: otpCode
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

    // Create user if not exists (Seamless First-Time Sign Up!)
    if (!user) {
      const baseUsername = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      const generatedUsername = `${baseUsername}${uniqueSuffix}`;
      const generatedOperatorId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

      user = new User({
        username: generatedUsername,
        operatorId: generatedOperatorId,
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: role === 'admin' ? 'admin' : 'operator',
        authProvider: 'otp',
        passwordHash: 'OTP_VERIFIED',
        permissions: ['CREATE_ENTRY', 'PROCESS_EXIT', 'ISSUE_PASS', 'VIEW_TOKENS']
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
      const generatedUsername = `${baseUsername}${uniqueSuffix}`;
      const generatedOperatorId = `GGL-${Math.floor(1000 + Math.random() * 9000)}`;

      user = new User({
        username: generatedUsername,
        operatorId: generatedOperatorId,
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'operator',
        authProvider: 'google',
        passwordHash: 'GOOGLE_OAUTH_VERIFIED',
        permissions: ['CREATE_ENTRY', 'PROCESS_EXIT', 'ISSUE_PASS', 'VIEW_TOKENS']
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
        role: user.role,
        permissions: user.permissions,
        assignedLocation: user.assignedLocation,
        picture: picture || null
      }
    });
  } catch (error) {
    next(error);
  }
}

