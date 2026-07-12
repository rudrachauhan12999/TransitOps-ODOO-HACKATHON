import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// AUTHENTICATION APIs
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `token-${user.role}-${user.id}`;
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      phone: user.phone,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, companyName, phone } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const exists = db.getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const newUser = {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email,
    passwordHash: password,
    name,
    role,
    companyName,
    phone,
  };

  db.addUser(newUser);

  res.json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      companyName: newUser.companyName,
      phone: newUser.phone,
    },
  });
});

app.post('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split('-');
  if (parts.length < 3) {
    return res.status(401).json({ error: 'Invalid token structure' });
  }

  const userId = parts.slice(2).join('-');
  const user = db.getUsers().find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    phone: user.phone,
  });
});

// -------------------------------------------------------------
// FLEET / VEHICLES APIs
// -------------------------------------------------------------
app.get('/api/vehicles', (req, res) => {
  res.json(db.getVehicles());
});

app.post('/api/vehicles', (req, res) => {
  try {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, fuelEfficiency, fuelType, nextMaintenanceOdometer, location } = req.body;
    
    // Indian registration format validation (regex)
    const indianRegRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/i;
    const cleanReg = (registrationNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!indianRegRegex.test(cleanReg)) {
      return res.status(400).json({ error: 'Invalid vehicle registration format. Must match standard Indian layout (e.g., GJ05AB1234).' });
    }

    const odo = Number(odometer) || 0;
    const newVehicle = {
      id: `v-${Math.random().toString(36).substr(2, 9)}`,
      registrationNumber: cleanReg.substring(0,2) + ' ' + cleanReg.substring(2,4) + ' ' + cleanReg.substring(4, cleanReg.length - 4) + ' ' + cleanReg.substring(cleanReg.length - 4),
      name,
      type,
      maxLoadCapacity: Number(maxLoadCapacity) || 0,
      odometer: odo,
      acquisitionCost: Number(acquisitionCost) || 0,
      status: 'Available' as const,
      fuelEfficiency: Number(fuelEfficiency) || 5.0,
      fuelType: fuelType || 'Diesel',
      nextMaintenanceOdometer: Number(nextMaintenanceOdometer) || (odo + 10000),
      location: location || 'Surat',
    };
    db.addVehicle(newVehicle);
    res.json(newVehicle);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id', (req, res) => {
  db.updateVehicle(req.params.id, req.body);
  res.json({ success: true });
});

app.delete('/api/vehicles/:id', (req, res) => {
  db.deleteVehicle(req.params.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// DRIVERS APIs
// -------------------------------------------------------------
app.get('/api/drivers', (req, res) => {
  res.json(db.getDrivers());
});

app.post('/api/drivers', (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, emergencyContactNumber, safetyScore } = req.body;

    // Driver License format validation (very basic check)
    if (!licenseNumber || licenseNumber.trim().length < 6) {
      return res.status(400).json({ error: 'Invalid driver license number.' });
    }

    const expiryDate = new Date(licenseExpiryDate);
    if (isNaN(expiryDate.getTime())) {
      return res.status(400).json({ error: 'Invalid license expiry date.' });
    }

    const newDriver = {
      id: `d-${Math.random().toString(36).substr(2, 9)}`,
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory: licenseCategory || 'HEAVY VEHICLE (HMV)',
      licenseExpiryDate,
      contactNumber,
      emergencyContactNumber: emergencyContactNumber || '+91 99999 88888',
      safetyScore: Number(safetyScore) || 90,
      status: 'Available' as const,
    };
    db.addDriver(newDriver);
    res.json(newDriver);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/drivers/:id', (req, res) => {
  db.updateDriver(req.params.id, req.body);
  res.json({ success: true });
});

app.delete('/api/drivers/:id', (req, res) => {
  db.deleteDriver(req.params.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// SHIPMENTS APIs
// -------------------------------------------------------------
app.get('/api/shipments', (req, res) => {
  res.json(db.getShipments());
});

app.post('/api/shipments', (req, res) => {
  const { customerName, clientId, source, destination, cargoWeight, priority, eta } = req.body;

  const randId = Math.floor(1000 + Math.random() * 9000);
  const shipmentId = `CO-${randId}`;

  const newShipment = {
    id: `s-${Math.random().toString(36).substr(2, 9)}`,
    shipmentId,
    customerName: customerName || 'Chauhan Textiles',
    clientId: clientId || 'user-client',
    source: source || 'Surat Textile Hub',
    destination: destination || 'Mumbai Port Terminal 2',
    status: 'Booked' as const,
    cargoWeight: Number(cargoWeight) || 5000,
    priority: priority || 'Medium',
    eta: eta || 'Tomorrow, 5:00 PM',
    progressPercentage: 5,
    routeSummary: `${source} → NH-48 Express → ${destination}`,
    creationDate: new Date().toISOString(),
    invoiceId: `INV-2026-${randId}`,
    lorryReceiptId: `LR-${randId}`,
    activityFeed: [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Booked',
        message: 'Shipment created and awaiting dispatcher approval.',
      },
    ],
  };

  db.addShipment(newShipment);
  res.json(newShipment);
});

// Approve shipment endpoint
app.post('/api/shipments/:id/approve', (req, res) => {
  const { driverId, vehicleId, departureTime } = req.body;
  const shipment = db.getShipments().find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const driver = db.getDrivers().find(d => d.id === driverId);
  const vehicle = db.getVehicles().find(v => v.id === vehicleId);

  if (!driver) {
    return res.status(400).json({ error: 'Selected driver does not exist.' });
  }
  if (!vehicle) {
    return res.status(400).json({ error: 'Selected vehicle does not exist.' });
  }

  // Enforce business rules
  if (driver.status === 'Suspended' || driver.safetyScore < 70) {
    return res.status(400).json({ error: `Driver ${driver.name} is suspended or has low safety score.` });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (new Date(driver.licenseExpiryDate) < new Date(todayStr)) {
    return res.status(400).json({ error: `Driver ${driver.name} has an expired license.` });
  }

  if (driver.status === 'On Trip') {
    return res.status(400).json({ error: `Driver ${driver.name} is already on an active trip.` });
  }

  if (vehicle.status === 'In Shop') {
    return res.status(400).json({ error: `Vehicle ${vehicle.registrationNumber} is currently undergoing maintenance.` });
  }

  if (vehicle.status === 'On Trip') {
    return res.status(400).json({ error: `Vehicle ${vehicle.registrationNumber} is already on an active trip.` });
  }

  if (shipment.cargoWeight > vehicle.maxLoadCapacity) {
    return res.status(400).json({ error: `Cargo weight (${shipment.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg).` });
  }

  // Update Shipment Status
  shipment.status = 'Confirmed';
  shipment.driverId = driver.id;
  shipment.driverName = driver.name;
  shipment.vehicleId = vehicle.id;
  shipment.vehicleNumber = vehicle.registrationNumber;
  shipment.progressPercentage = 15;
  shipment.activityFeed.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Confirmed',
    message: `Approved and pre-allocated to Driver ${driver.name} with vehicle ${vehicle.registrationNumber}. Departure: ${departureTime || 'Immediate'}.`
  });

  // Create standard Trip
  const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTrip = {
    id: `trip-${Math.random().toString(36).substr(2, 9)}`,
    tripId,
    source: shipment.source,
    destination: shipment.destination,
    status: 'Draft' as const,
    cargoWeight: shipment.cargoWeight,
    plannedDistance: 280,
    driverId: driver.id,
    vehicleId: vehicle.id,
    startDate: new Date().toISOString()
  };

  db.addTrip(newTrip);

  // Bind driver and vehicle
  driver.status = 'On Trip';
  driver.activeTripId = newTrip.id;
  vehicle.status = 'On Trip';
  vehicle.activeTripId = newTrip.id;

  db.updateShipment(shipment.id, shipment);
  db.updateDriver(driver.id, driver);
  db.updateVehicle(vehicle.id, vehicle);

  // Add client notification
  db.addNotification({
    id: `n-${Math.random().toString(36).substr(2, 9)}`,
    userId: shipment.clientId,
    role: 'client',
    message: `Your shipment ${shipment.shipmentId} has been approved and assigned to driver ${driver.name}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, shipment, trip: newTrip });
});

// Reject shipment endpoint
app.post('/api/shipments/:id/reject', (req, res) => {
  const { reason } = req.body;
  const shipment = db.getShipments().find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  // Delete driver and vehicle bindings if any
  shipment.status = 'Booked'; // Keep it booked but with a rejection tag
  shipment.activityFeed.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Rejected',
    message: `Shipment rejected by Dispatcher. Reason: ${reason || 'N/A'}`
  });

  db.updateShipment(shipment.id, shipment);

  db.addNotification({
    id: `n-${Math.random().toString(36).substr(2, 9)}`,
    userId: shipment.clientId,
    role: 'client',
    message: `Your shipment request ${shipment.shipmentId} was rejected. Reason: ${reason}`,
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, shipment });
});

// Custom shipment PUT endpoint
app.put('/api/shipments/:id', (req, res) => {
  const shipment = db.getShipments().find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const oldStatus = shipment.status;
  Object.assign(shipment, req.body);

  // Handle Driver state flow triggers when progress status changes
  if (shipment.status !== oldStatus) {
    shipment.activityFeed.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: shipment.status,
      message: `Status updated to ${shipment.status}.`
    });

    // If completed / delivered, free driver and vehicle
    if (shipment.status === 'Delivered') {
      shipment.progressPercentage = 100;
      
      if (shipment.driverId) {
        const driver = db.getDrivers().find(d => d.id === shipment.driverId);
        if (driver) {
          driver.status = 'Available';
          delete driver.activeTripId;
          db.updateDriver(driver.id, driver);
        }
      }

      if (shipment.vehicleId) {
        const vehicle = db.getVehicles().find(v => v.id === shipment.vehicleId);
        if (vehicle) {
          vehicle.status = 'Available';
          delete vehicle.activeTripId;
          db.updateVehicle(vehicle.id, vehicle);
        }
      }

      // Complete associated trips
      const trip = db.getTrips().find(t => t.driverId === shipment.driverId && t.status !== 'Completed');
      if (trip) {
        db.updateTripStatus(trip.id, 'Completed', undefined, undefined);
      }
    }
  }

  db.updateShipment(shipment.id, shipment);
  res.json(shipment);
});

// -------------------------------------------------------------
// TRIPS APIs
// -------------------------------------------------------------
app.get('/api/trips', (req, res) => {
  res.json(db.getTrips());
});

app.post('/api/trips', (req, res) => {
  try {
    const { source, destination, cargoWeight, plannedDistance, driverId, vehicleId } = req.body;
    const newTrip = {
      id: `trip-${Math.random().toString(36).substr(2, 9)}`,
      tripId: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
      source,
      destination,
      status: 'Draft' as const,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      driverId,
      vehicleId,
    };

    db.addTrip(newTrip);
    res.json(newTrip);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/trips/:id/dispatch', (req, res) => {
  db.updateTripStatus(req.params.id, 'Dispatched');
  res.json({ success: true });
});

app.post('/api/trips/:id/complete', (req, res) => {
  const { finalOdometer, fuelConsumed } = req.body;
  db.updateTripStatus(req.params.id, 'Completed', Number(finalOdometer), Number(fuelConsumed));
  res.json({ success: true });
});

app.post('/api/trips/:id/cancel', (req, res) => {
  db.updateTripStatus(req.params.id, 'Cancelled');
  res.json({ success: true });
});

// -------------------------------------------------------------
// MAINTENANCE & EXPENSES
// -------------------------------------------------------------
app.get('/api/maintenance', (req, res) => {
  res.json(db.getMaintenanceLogs());
});

app.post('/api/maintenance', (req, res) => {
  const { vehicleId, description, cost, date, status, odometerReading } = req.body;
  const v = db.getVehicles().find(item => item.id === vehicleId);

  const newLog = {
    id: `m-log-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId,
    vehicleName: v?.name || 'Unknown Vehicle',
    description,
    cost: Number(cost),
    date: date || new Date().toISOString().split('T')[0],
    status: (status as 'Active' | 'Completed') || 'Active',
    odometerReading: Number(odometerReading) || (v?.odometer || 0),
  };

  db.addMaintenanceLog(newLog);
  res.json(newLog);
});

app.post('/api/maintenance/:id/complete', (req, res) => {
  const { cost } = req.body;
  db.completeMaintenanceLog(req.params.id, Number(cost));
  res.json({ success: true });
});

app.get('/api/fuel', (req, res) => {
  res.json(db.getFuelLogs());
});

app.post('/api/fuel', (req, res) => {
  const { vehicleId, liters, cost, date, odometerReading } = req.body;
  const v = db.getVehicles().find(item => item.id === vehicleId);

  const newFuel = {
    id: `f-log-${Math.random().toString(36).substr(2, 9)}`,
    vehicleId,
    vehicleName: v?.name || 'Unknown',
    liters: Number(liters),
    cost: Number(cost),
    date: date || new Date().toISOString().split('T')[0],
    odometerReading: Number(odometerReading) || (v?.odometer || 0),
  };

  db.addFuelLog(newFuel);
  res.json(newFuel);
});

app.get('/api/expenses', (req, res) => {
  res.json(db.getExpenses());
});

app.post('/api/expenses', (req, res) => {
  try {
    const { vehicleId, amount, type, description } = req.body;
    const v = db.getVehicles().find(item => item.id === vehicleId);
    const newExpense = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId,
      vehicleName: v?.name || 'Unknown Vehicle',
      amount: Number(amount) || 0,
      type: type || 'Other',
      date: new Date().toISOString().split('T')[0],
      description: description || 'Operational Expense',
    };
    db.addExpense(newExpense);
    res.json(newExpense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/geofences', (req, res) => {
  res.json(db.getGeofences());
});

// -------------------------------------------------------------
// EMERGENCIES APIs
// -------------------------------------------------------------
app.get('/api/emergencies', (req, res) => {
  res.json(db.getEmergencies());
});

app.post('/api/emergencies', (req, res) => {
  try {
    const { driverId, driverName, tripId, message } = req.body;
    const newAlert = db.addEmergency({
      driverId,
      driverName,
      tripId: tripId || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message
    });

    // Also add to dispatcher notifications
    db.addNotification({
      id: `n-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'user-dispatcher',
      role: 'dispatcher',
      message: `🚨 EMERGENCY TRANSMISSION: Driver ${driverName} reported: ${message}`,
      type: 'alert',
      timestamp: new Date().toISOString(),
      read: false
    });

    res.json(newAlert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/emergencies/:id/acknowledge', (req, res) => {
  db.acknowledgeEmergency(req.params.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.post('/api/notifications', (req, res) => {
  try {
    const { userId, role, message, type } = req.body;
    const newNotification = {
      id: `n-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || 'user-admin',
      role: role || 'admin',
      message,
      type: type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
    };
    db.addNotification(newNotification);
    res.json(newNotification);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/notifications/read', (req, res) => {
  const { userId } = req.body;
  db.markNotificationsAsRead(userId);
  res.json({ success: true });
});

// Clean Operational Logistics Insights endpoint
app.get(['/api/logistics/insights', '/api/ai/insights', '/api/ai/audit'], (req, res) => {
  // Return simulated professional operational logs and trends
  res.json({
    insights: [
      {
        id: 'ins-1',
        type: 'warning',
        title: 'Fuel Efficiency Deviation',
        message: 'Truck MH-04-GP-3921 fuel efficiency has decreased slightly over the last 15 days. Inspect tire calibration.',
        impact: 'High',
      },
      {
        id: 'ins-2',
        type: 'alert',
        title: 'License Validity Limit approaching',
        message: 'Driver Amit Patel license HMV requires renewal soon.',
        impact: 'Critical',
      },
      {
        id: 'ins-3',
        type: 'info',
        title: 'Scheduled Preventive Service Recommended',
        message: 'BharatBenz 2823R is approaching its 50,000 km service interval. Pre-booking in progress.',
        impact: 'Medium',
      },
      {
        id: 'ins-4',
        type: 'success',
        title: 'Optimal Fleet Utilization Standard',
        message: 'Surat to Mumbai lane margins have stabilized at 18% over standard dispatch ratios.',
        impact: 'High',
      },
    ],
    aiPowered: false,
  });
});

// -------------------------------------------------------------
// VITE CLIENT DEV AND PRODUCTION BUNDLING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarryOn Operating System booted on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
