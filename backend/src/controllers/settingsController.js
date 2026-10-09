import { BusinessSettings } from '../models/index.js';
import { AuditService } from '../services/auditService.js';
import { settingsSchema } from '../validators/index.js';

export async function getSettings(req, res, next) {
  try {
    let settings = await BusinessSettings.findOne();

    if (!settings) {
      settings = await BusinessSettings.create({
        businessName: 'SR FABRICATION',
        tagline: 'Railway Station Vehicle Parking Management System',
        locationName: 'Railway Station Parking Plaza',
        stationCode: 'SRF-MAIN',
        tokenPrefix: 'SRF',
        passPrefix: 'SRF-PASS',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        currencySymbol: '₹',
        categories: [
          { id: 'bike', name: 'Two Wheeler (Bike/Scooter)', enabled: true, isVehicle: true },
          { id: 'car', name: 'Four Wheeler (Car/Jeep)', enabled: true, isVehicle: true },
          { id: 'auto', name: 'Auto Rickshaw', enabled: true, isVehicle: true },
          { id: 'cycle', name: 'Bicycle', enabled: true, isVehicle: true },
          { id: 'bus', name: 'Bus / Van', enabled: true, isVehicle: true },
          { id: 'truck', name: 'Truck', enabled: true, isVehicle: true },
          { id: 'tempo', name: 'Tempo / Goods Carrier', enabled: true, isVehicle: true },
          { id: 'other', name: 'Other Vehicles', enabled: true, isVehicle: true },
          { id: 'helmet', name: 'Helmet Deposit', enabled: true, isVehicle: false },
          { id: 'locker', name: 'Luggage / Locker', enabled: true, isVehicle: false }
        ]
      });
    }

    return res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const validated = settingsSchema.parse(req.body);

    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = new BusinessSettings(validated);
    } else {
      Object.assign(settings, validated);
    }

    await settings.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'SETTINGS_UPDATED',
      entityType: 'Settings',
      entityId: settings._id.toString(),
      details: validated,
      req
    });

    return res.json({
      success: true,
      message: 'Business settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
}
