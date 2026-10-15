import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username or Operator ID is required').trim(),
  password: z.string().optional(),
  mpin: z.string().regex(/^\d{4}$/, 'MPIN must be exactly 4 digits').optional()
}).refine(data => data.password || data.mpin, {
  message: 'Either password or 4-digit MPIN must be provided',
  path: ['password']
});

export const entryTokenSchema = z.object({
  vehicleNumber: z.string()
    .min(2, 'Vehicle number must be at least 2 characters')
    .max(20, 'Vehicle number cannot exceed 20 characters')
    .trim()
    .transform(v => v.toUpperCase().replace(/\s+/g, '')),
  vehicleType: z.string().min(1, 'Vehicle type is required').trim().toLowerCase(),
  customerPhone: z.string().max(15).optional().default(''),
  notes: z.string().max(250).optional().default(''),
  locationCode: z.string().optional()
});

export const exitTokenSchema = z.object({
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'OTHER', 'PASS']),
  paymentReference: z.string().max(100).optional().default(''),
  idempotencyKey: z.string().max(100).optional()
});

export const cancelTokenSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required').max(300)
});

export const createPassSchema = z.object({
  vehicleNumber: z.string()
    .min(2, 'Vehicle number must be at least 2 characters')
    .max(20)
    .trim()
    .transform(v => v.toUpperCase().replace(/\s+/g, '')),
  vehicleType: z.string().min(1, 'Vehicle type is required').trim().toLowerCase(),
  customerName: z.string().min(2, 'Customer name is required').trim(),
  customerPhone: z.string().max(15).optional().default(''),
  durationMonths: z.coerce.number().refine(val => [1, 6, 12].includes(val), {
    message: 'Pass duration must be 1, 6, or 12 months'
  }),
  startDate: z.string().or(z.date()),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'OTHER']).default('CASH'),
  paymentReference: z.string().max(100).optional().default(''),
  notes: z.string().max(250).optional().default('')
});

export const renewPassSchema = z.object({
  durationMonths: z.coerce.number().refine(val => [1, 6, 12].includes(val), {
    message: 'Pass duration must be 1, 6, or 12 months'
  }),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'OTHER']).default('CASH'),
  paymentReference: z.string().max(100).optional().default('')
});

export const tariffSchema = z.object({
  category: z.string().min(1, 'Category is required').trim().toLowerCase(),
  name: z.string().min(2, 'Tariff name is required').trim(),
  billingMethod: z.enum(['24_hour_daily', 'hourly', 'fixed']).default('24_hour_daily'),
  firstSlabAmount: z.coerce.number().min(0, 'First slab amount must be non-negative'),
  additionalDayAmount: z.coerce.number().min(0).default(0),
  hourlyAmount: z.coerce.number().min(0).default(0),
  monthlyAmount: z.coerce.number().min(0).default(0),
  freeGraceMinutes: z.coerce.number().min(0).default(0),
  effectiveFrom: z.string().or(z.date()).optional(),
  isActive: z.boolean().default(true)
});

export const operatorSchema = z.object({
  username: z.string().min(3).trim().toLowerCase(),
  operatorId: z.string().min(2).trim().toUpperCase(),
  name: z.string().min(2).trim(),
  role: z.enum(['admin', 'operator']).default('operator'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  mpin: z.string().regex(/^\d{4}$/, 'MPIN must be 4 digits').optional(),
  permissions: z.array(z.string()).optional(),
  assignedLocation: z.string().optional()
});

export const settingsSchema = z.object({
  businessName: z.string().min(2).optional(),
  tagline: z.string().optional(),
  locationName: z.string().optional(),
  stationCode: z.string().optional(),
  tokenPrefix: z.string().max(10).optional(),
  passPrefix: z.string().max(15).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
  passExpiringSoonDays: z.coerce.number().min(1).max(30).optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    isVehicle: z.boolean()
  })).optional()
});

export const customerRegistrationSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase().optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, 'Please enter a valid phone number').trim().optional().or(z.literal('')),
  username: z.string().min(3, 'Username must be at least 3 characters').trim().toLowerCase().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  vehicleNumber: z.string().max(20).optional().default(''),
  vehicleType: z.string().optional().default('bike')
});

export const customerVehicleSchema = z.object({
  registrationNumber: z.string()
    .min(2, 'Vehicle registration number is required')
    .max(20, 'Vehicle number cannot exceed 20 characters')
    .trim()
    .transform(v => v.toUpperCase().replace(/\s+/g, '')),
  vehicleType: z.string().min(1, 'Vehicle category is required').trim().toLowerCase().default('bike'),
  nickname: z.string().max(50).optional().default('')
});

