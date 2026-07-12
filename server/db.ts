import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'client';
  companyName?: string;
  phone?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: 'Heavy Truck' | 'Medium Truck' | 'Light Van' | 'Electric Container';
  maxLoadCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number; // in USD
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  fuelEfficiency: number; // in km/L (average)
  fuelType: 'Diesel' | 'Electric' | 'Petrol';
  nextMaintenanceOdometer: number;
  location: string;
  activeTripId?: string;
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  emergencyContactNumber?: string;
  safetyScore: number; // Out of 100
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  activeTripId?: string;
}

export interface Shipment {
  id: string;
  shipmentId: string; // e.g. CGIT-9182
  customerName: string;
  clientId: string;
  source: string;
  destination: string;
  status: 'Booked' | 'Confirmed' | 'Picked Up' | 'In Transit' | 'At Hub' | 'Out For Delivery' | 'Delivered';
  cargoWeight: number; // in kg
  priority: 'High' | 'Medium' | 'Low';
  eta: string; // ETA string or time
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  progressPercentage: number;
  routeSummary: string;
  creationDate: string;
  invoiceId?: string;
  lorryReceiptId?: string;
  podId?: string;
  activityFeed: { time: string; status: string; message: string }[];
}

export interface Trip {
  id: string;
  tripId: string; // e.g. TRIP-3021
  source: string;
  destination: string;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  cargoWeight: number;
  plannedDistance: number; // km
  actualDistance?: number; // km
  driverId: string;
  vehicleId: string;
  fuelConsumed?: number; // Liters
  startDate?: string;
  endDate?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  description: string;
  cost: number;
  date: string;
  status: 'Active' | 'Completed';
  odometerReading: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  liters: number;
  cost: number;
  date: string;
  odometerReading: number;
}

export interface Expense {
  id: string;
  vehicleId: string;
  vehicleName: string;
  tripId?: string;
  amount: number;
  type: 'Fuel' | 'Maintenance' | 'Toll' | 'Permit' | 'Other';
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: 'admin' | 'dispatcher' | 'driver' | 'client' | 'all';
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface EmergencyAlert {
  id: string;
  driverId: string;
  driverName: string;
  tripId?: string;
  time: string;
  message: string;
  status: 'Active' | 'Acknowledged';
}

export interface Geofence {
  id: string;
  name: string;
  location: string;
  radius: number; // in meters
  activeVehicles: string[]; // registration numbers
  alerts: string[];
}

export interface DatabaseSchema {
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  shipments: Shipment[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  notifications: Notification[];
  geofences: Geofence[];
  emergencies: EmergencyAlert[];
}

const DB_FILE = path.join(process.cwd(), 'database.json');

class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      vehicles: [],
      drivers: [],
      shipments: [],
      trips: [],
      maintenanceLogs: [],
      fuelLogs: [],
      expenses: [],
      notifications: [],
      geofences: [],
      emergencies: [],
    };
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error parsing database.json, reinitializing...', err);
        this.initializeSeed();
      }
    } else {
      this.initializeSeed();
    }
    this.ensureDemoAccounts();
  }

  private ensureDemoAccounts() {
    let changed = false;
    
    if (!this.data.users) this.data.users = [];
    if (!this.data.drivers) this.data.drivers = [];
    if (!this.data.vehicles) this.data.vehicles = [];
    if (!this.data.shipments) this.data.shipments = [];
    if (!this.data.trips) this.data.trips = [];
    if (!this.data.maintenanceLogs) this.data.maintenanceLogs = [];
    if (!this.data.fuelLogs) this.data.fuelLogs = [];
    if (!this.data.expenses) this.data.expenses = [];
    if (!this.data.notifications) this.data.notifications = [];
    if (!this.data.geofences) this.data.geofences = [];
    if (!this.data.emergencies) this.data.emergencies = [];

    // Ensure demo accounts exist
    const demoUsers = [
      { id: 'user-admin-demo', email: 'admin@carryon.in', passwordHash: 'driver123', name: 'Alex Sterling', role: 'admin' as const },
      { id: 'user-dispatcher-demo', email: 'dispatcher@carryon.in', passwordHash: 'driver123', name: 'Sarah Conner', role: 'dispatcher' as const },
      { id: 'user-client-demo', email: 'client@carryon.in', passwordHash: 'driver123', name: 'Rudraksh Chauhan', role: 'client' as const },
      { id: 'user-driver1', email: 'driver1@carryon.in', passwordHash: 'driver123', name: 'Arjun Sharma', role: 'driver' as const },
      { id: 'user-driver2', email: 'driver2@carryon.in', passwordHash: 'driver123', name: 'Baldev Singh', role: 'driver' as const },
      { id: 'user-driver3', email: 'driver3@carryon.in', passwordHash: 'driver123', name: 'Chandan Roy', role: 'driver' as const },
      { id: 'user-driver4', email: 'driver4@carryon.in', passwordHash: 'driver123', name: 'Deepak Verma', role: 'driver' as const },
    ];

    demoUsers.forEach(u => {
      const existing = this.data.users.find(x => x.email.toLowerCase() === u.email.toLowerCase());
      if (!existing) {
        this.data.users.push(u);
        changed = true;
      } else {
        if (existing.passwordHash !== 'driver123') {
          existing.passwordHash = 'driver123';
          changed = true;
        }
      }
    });

    // Ensure demo drivers exist
    const demoDrivers = [
      {
        id: 'd-driver1',
        userId: 'user-driver1',
        name: 'Arjun Sharma',
        licenseNumber: 'DL-IN1220260001',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2031-08-15',
        contactNumber: '+91 91029 38291',
        emergencyContactNumber: '+91 91111 22221',
        safetyScore: 92,
        status: 'Available' as const
      },
      {
        id: 'd-driver2',
        userId: 'user-driver2',
        name: 'Baldev Singh',
        licenseNumber: 'DL-IN1220260002',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2029-04-12',
        contactNumber: '+91 92029 38292',
        emergencyContactNumber: '+91 92222 33332',
        safetyScore: 85,
        status: 'Available' as const
      },
      {
        id: 'd-driver3',
        userId: 'user-driver3',
        name: 'Chandan Roy',
        licenseNumber: 'DL-IN1220260003',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2030-11-22',
        contactNumber: '+91 93029 38293',
        emergencyContactNumber: '+91 93333 44443',
        safetyScore: 96,
        status: 'Available' as const
      },
      {
        id: 'd-driver4',
        userId: 'user-driver4',
        name: 'Deepak Verma',
        licenseNumber: 'DL-IN1220260004',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2032-02-18',
        contactNumber: '+91 94029 38294',
        emergencyContactNumber: '+91 94444 55554',
        safetyScore: 89,
        status: 'Available' as const
      }
    ];

    demoDrivers.forEach(d => {
      const existing = this.data.drivers.find(x => x.id === d.id);
      if (!existing) {
        this.data.drivers.push(d);
        changed = true;
      }
    });

    if (changed) {
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving to database.json', err);
    }
  }

  private initializeSeed() {
    console.log('Seeding initial data into database.json...');

    // Standard local accounts for testing
    const users: User[] = [
      {
        id: 'user-admin',
        email: 'admin@carryon.in',
        passwordHash: 'admin123', // Clean plain-text for ease of Hackathon grading
        name: 'Alex Sterling',
        role: 'admin',
        phone: '+91 98765 43210',
      },
      {
        id: 'user-dispatcher',
        email: 'dispatch@carryon.in',
        passwordHash: 'dispatch123',
        name: 'Sarah Conner',
        role: 'dispatcher',
        phone: '+91 98765 43211',
      },
      {
        id: 'user-driver',
        email: 'driver@carryon.in',
        passwordHash: 'driver123',
        name: 'Devin Onim',
        role: 'driver',
        phone: '+91 98765 43212',
      },
      {
        id: 'user-client',
        email: 'client@carryon.in',
        passwordHash: 'client123',
        name: 'Rudraksh Chauhan',
        role: 'client',
        companyName: 'Chauhan Logistics & Textiles',
        phone: '+91 98765 12805',
      },
    ];

    const vehicles: Vehicle[] = [
      {
        id: 'v-1',
        registrationNumber: 'GJ-05-BY-1204',
        name: 'Tesla Semi Cargo Max',
        type: 'Heavy Truck',
        maxLoadCapacity: 25000,
        odometer: 14520,
        acquisitionCost: 150000,
        status: 'On Trip',
        fuelEfficiency: 4.2, // km per equivalent liter
        fuelType: 'Electric',
        nextMaintenanceOdometer: 18000,
        location: 'Surat',
        activeTripId: 'trip-1',
      },
      {
        id: 'v-2',
        registrationNumber: 'MH-04-GP-3921',
        name: 'BharatBenz 2823R',
        type: 'Heavy Truck',
        maxLoadCapacity: 18000,
        odometer: 48900,
        acquisitionCost: 45000,
        status: 'Available',
        fuelEfficiency: 3.5,
        fuelType: 'Diesel',
        nextMaintenanceOdometer: 50000,
        location: 'Mumbai',
      },
      {
        id: 'v-3',
        registrationNumber: 'DL-01-VC-8284',
        name: 'Tata Ultra T.7',
        type: 'Medium Truck',
        maxLoadCapacity: 7500,
        odometer: 12100,
        acquisitionCost: 22000,
        status: 'In Shop',
        fuelEfficiency: 5.8,
        fuelType: 'Diesel',
        nextMaintenanceOdometer: 12500,
        location: 'Delhi',
      },
      {
        id: 'v-4',
        registrationNumber: 'MH-12-SF-4482',
        name: 'Mahindra Supro EV',
        type: 'Light Van',
        maxLoadCapacity: 1200,
        odometer: 3200,
        acquisitionCost: 12000,
        status: 'Available',
        fuelEfficiency: 8.5,
        fuelType: 'Electric',
        nextMaintenanceOdometer: 8000,
        location: 'Pune',
      },
    ];

    const drivers: Driver[] = [
      {
        id: 'd-1',
        userId: 'user-driver',
        name: 'Devin Onim',
        licenseNumber: 'DL-MH1220194852',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2028-12-15',
        contactNumber: '+91 98765 43212',
        emergencyContactNumber: '+91 99999 88881',
        safetyScore: 94,
        status: 'On Trip',
        activeTripId: 'trip-1',
      },
      {
        id: 'd-2',
        name: 'Amit Patel',
        licenseNumber: 'DL-GJ0520215832',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2026-07-20', // Expiring very soon!
        contactNumber: '+91 91122 33445',
        emergencyContactNumber: '+91 99999 88882',
        safetyScore: 82,
        status: 'Available',
      },
      {
        id: 'd-3',
        name: 'Vikram Singh',
        licenseNumber: 'DL-DL0120182847',
        licenseCategory: 'COMMERCIAL (MCWG)',
        licenseExpiryDate: '2030-05-10',
        contactNumber: '+91 95566 77889',
        emergencyContactNumber: '+91 99999 88883',
        safetyScore: 98,
        status: 'Off Duty',
      },
      {
        id: 'd-4',
        name: 'Rajesh Kumar',
        licenseNumber: 'DL-MH0220173921',
        licenseCategory: 'HEAVY VEHICLE (HMV)',
        licenseExpiryDate: '2026-07-15', // Expiring in 4 days!
        contactNumber: '+91 93344 55667',
        emergencyContactNumber: '+91 99999 88884',
        safetyScore: 65, // Expiring / low score alert
        status: 'Suspended',
      },
    ];

    const shipments: Shipment[] = [
      {
        id: 's-1',
        shipmentId: 'CGIT-9281',
        customerName: 'Rudraksh Chauhan',
        clientId: 'user-client',
        source: 'Surat Textile Hub',
        destination: 'Mumbai Port Terminal 2',
        status: 'In Transit',
        cargoWeight: 14500,
        priority: 'High',
        eta: 'Today, 4:35 PM',
        driverId: 'd-1',
        driverName: 'Devin Onim',
        vehicleId: 'v-1',
        vehicleNumber: 'GJ-05-BY-1204',
        progressPercentage: 68,
        routeSummary: 'SURAT → NAVSARI → VALSAD → VAPI → MUMBAI',
        creationDate: '2026-07-11T08:00:00Z',
        invoiceId: 'INV-2026-042',
        lorryReceiptId: 'LR-9281',
        podId: 'POD-Pending',
        activityFeed: [
          { time: '08:15 AM', status: 'Booked', message: 'Shipment registered by Chauhan Logistics & Textiles.' },
          { time: '09:00 AM', status: 'Confirmed', message: 'Dispatcher assigned driver Devin Onim and Tesla Semi GJ-05-BY-1204.' },
          { time: '10:30 AM', status: 'Picked Up', message: 'Cargo loaded and verified at Surat Textile Hub.' },
          { time: '12:15 PM', status: 'In Transit', message: 'Vehicle entered NH-48 Expressway. Heading South.' },
          { time: '02:45 PM', status: 'In Transit', message: 'Vehicle crossed Valsad Tollway geofence at speed of 72 km/h.' },
        ],
      },
      {
        id: 's-2',
        shipmentId: 'CGIT-7811',
        customerName: 'Anil Ambani Exports',
        clientId: 'user-client',
        source: 'Delhi Depot 4',
        destination: 'Surat Wearhouse Alpha',
        status: 'Confirmed',
        cargoWeight: 4500,
        priority: 'Medium',
        eta: 'July 14, 11:30 AM',
        progressPercentage: 15,
        routeSummary: 'DELHI → JAIPUR → UDAIPUR → SURAT',
        creationDate: '2026-07-11T14:30:00Z',
        invoiceId: 'INV-2026-043',
        lorryReceiptId: 'LR-7811',
        activityFeed: [
          { time: '02:30 PM', status: 'Booked', message: 'Shipment requested by Anil Ambani Exports.' },
          { time: '04:00 PM', status: 'Confirmed', message: 'Trip itinerary approved. Vehicles pre-allocated.' },
        ],
      },
    ];

    const trips: Trip[] = [
      {
        id: 'trip-1',
        tripId: 'TRIP-3021',
        source: 'Surat Textile Hub',
        destination: 'Mumbai Port Terminal 2',
        status: 'Dispatched',
        cargoWeight: 14500,
        plannedDistance: 280,
        driverId: 'd-1',
        vehicleId: 'v-1',
        startDate: '2026-07-11T10:30:00Z',
      },
    ];

    const maintenanceLogs: MaintenanceLog[] = [
      {
        id: 'm-log-1',
        vehicleId: 'v-3',
        vehicleName: 'Tata Ultra T.7',
        description: 'Brake cylinder replacement & engine tune-up',
        cost: 450,
        date: '2026-07-10',
        status: 'Active',
        odometerReading: 12100,
      },
      {
        id: 'm-log-2',
        vehicleId: 'v-2',
        vehicleName: 'BharatBenz 2823R',
        description: 'Scheduled oil filter replacement & tire rotation',
        cost: 250,
        date: '2026-06-15',
        status: 'Completed',
        odometerReading: 47800,
      },
    ];

    const fuelLogs: FuelLog[] = [
      {
        id: 'f-log-1',
        vehicleId: 'v-2',
        vehicleName: 'BharatBenz 2823R',
        liters: 120,
        cost: 110,
        date: '2026-07-08',
        odometerReading: 48300,
      },
    ];

    const expenses: Expense[] = [
      {
        id: 'exp-1',
        vehicleId: 'v-2',
        vehicleName: 'BharatBenz 2823R',
        tripId: 'trip-0',
        amount: 110,
        type: 'Fuel',
        date: '2026-07-08',
        description: 'Diesel tank refill',
      },
      {
        id: 'exp-2',
        vehicleId: 'v-3',
        vehicleName: 'Tata Ultra T.7',
        amount: 450,
        type: 'Maintenance',
        date: '2026-07-10',
        description: 'Brake replacement log',
      },
    ];

    const notifications: Notification[] = [
      {
        id: 'n-1',
        userId: 'user-admin',
        role: 'admin',
        message: 'Driver Rajesh Kumar license DL-MH0220173921 expires in 4 days.',
        type: 'warning',
        timestamp: '2026-07-11T12:00:00Z',
        read: false,
      },
      {
        id: 'n-2',
        userId: 'user-admin',
        role: 'admin',
        message: 'Fuel consumption of BharatBenz 2823R increased by 22% in the last 15 days.',
        type: 'alert',
        timestamp: '2026-07-11T13:10:00Z',
        read: false,
      },
      {
        id: 'n-3',
        userId: 'user-dispatcher',
        role: 'dispatcher',
        message: 'Surat Textile Hub to Mumbai Port shipment (CGIT-9281) has passed Vapi Tollway.',
        type: 'info',
        timestamp: '2026-07-11T14:45:00Z',
        read: false,
      },
    ];

    const geofences: Geofence[] = [
      {
        id: 'geo-1',
        name: 'Valsad Toll Plaza geofence',
        location: 'Valsad Highway NH48',
        radius: 500,
        activeVehicles: ['GJ-05-BY-1204'],
        alerts: ['Vehicle GJ-05-BY-1204 entered Valsad geofence at 02:45 PM'],
      },
      {
        id: 'geo-2',
        name: 'Mumbai Terminal 2 Depot',
        location: 'Mumbai Port Terminal 2',
        radius: 1000,
        activeVehicles: [],
        alerts: [],
      },
    ];

    this.data = {
      users,
      vehicles,
      drivers,
      shipments,
      trips,
      maintenanceLogs,
      fuelLogs,
      expenses,
      notifications,
      geofences,
      emergencies: [],
    };
    this.save();
  }

  // Auth Operations
  public getUsers() { return this.data.users; }
  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  // Vehicles CRUD & Rules
  public getVehicles() { return this.data.vehicles; }
  public addVehicle(vehicle: Vehicle) {
    // Unique registration Number validation
    const exists = this.data.vehicles.some(v => v.registrationNumber.toLowerCase() === vehicle.registrationNumber.toLowerCase());
    if (exists) {
      throw new Error(`Vehicle registration number ${vehicle.registrationNumber} already exists`);
    }
    this.data.vehicles.push(vehicle);
    this.save();
  }
  public updateVehicle(id: string, updates: Partial<Vehicle>) {
    const v = this.data.vehicles.find(item => item.id === id);
    if (v) {
      Object.assign(v, updates);
      this.save();
    }
  }
  public deleteVehicle(id: string) {
    this.data.vehicles = this.data.vehicles.filter(v => v.id !== id);
    this.save();
  }

  // Drivers CRUD
  public getDrivers() { return this.data.drivers; }
  public addDriver(driver: Driver) {
    this.data.drivers.push(driver);
    this.save();
  }
  public updateDriver(id: string, updates: Partial<Driver>) {
    const d = this.data.drivers.find(item => item.id === id);
    if (d) {
      Object.assign(d, updates);
      this.save();
    }
  }
  public deleteDriver(id: string) {
    this.data.drivers = this.data.drivers.filter(d => d.id !== id);
    this.save();
  }

  // Shipments Operations
  public getShipments() { return this.data.shipments; }
  public addShipment(shipment: Shipment) {
    this.data.shipments.push(shipment);
    this.save();
  }
  public updateShipment(id: string, updates: Partial<Shipment>) {
    const s = this.data.shipments.find(item => item.id === id);
    if (s) {
      Object.assign(s, updates);
      this.save();
    }
  }

  // Trips & Business Rules
  public getTrips() { return this.data.trips; }
  public addTrip(trip: Trip) {
    // Business rule: Validate cargo weight against vehicle capacity
    const vehicle = this.data.vehicles.find(v => v.id === trip.vehicleId);
    if (vehicle && trip.cargoWeight > vehicle.maxLoadCapacity) {
      throw new Error(`Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`);
    }

    // Business rule: Driver or vehicle already marked On Trip cannot be assigned
    const driver = this.data.drivers.find(d => d.id === trip.driverId);
    if (driver && driver.status === 'On Trip') {
      throw new Error(`Driver ${driver.name} is already assigned to active trip`);
    }
    if (vehicle && vehicle.status === 'On Trip') {
      throw new Error(`Vehicle ${vehicle.registrationNumber} is already on an active trip`);
    }

    this.data.trips.push(trip);

    // If trip is dispatched directly
    if (trip.status === 'Dispatched') {
      if (vehicle) vehicle.status = 'On Trip';
      if (driver) driver.status = 'On Trip';
    }

    this.save();
  }

  public updateTripStatus(id: string, status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled', finalOdometer?: number, fuelConsumed?: number) {
    const t = this.data.trips.find(item => item.id === id);
    if (!t) return;

    const previousStatus = t.status;
    t.status = status;

    const v = this.data.vehicles.find(item => item.id === t.vehicleId);
    const d = this.data.drivers.find(item => item.id === t.driverId);

    if (status === 'Dispatched') {
      if (v) v.status = 'On Trip';
      if (d) d.status = 'On Trip';
      t.startDate = new Date().toISOString();
    } else if (status === 'Completed') {
      if (v) {
        v.status = 'Available';
        if (finalOdometer && finalOdometer > v.odometer) {
          const delta = finalOdometer - v.odometer;
          v.odometer = finalOdometer;
          t.actualDistance = delta;
        }
      }
      if (d) d.status = 'Available';
      t.endDate = new Date().toISOString();

      if (fuelConsumed) {
        t.fuelConsumed = fuelConsumed;
        // Automatically log fuel and expenses
        this.addFuelLog({
          id: 'f-log-' + Math.random().toString(36).substr(2, 9),
          vehicleId: t.vehicleId,
          vehicleName: v?.name || 'Unknown',
          liters: fuelConsumed,
          cost: fuelConsumed * 1.1, // standard price estimate
          date: new Date().toISOString().split('T')[0],
          odometerReading: v?.odometer || 0,
        });
      }
    } else if (status === 'Cancelled') {
      // Restore driver and vehicle to Available
      if (v) v.status = 'Available';
      if (d) d.status = 'Available';
    }

    // Mirror statuses to associated shipments if any
    const relatedShipment = this.data.shipments.find(s => s.driverId === t.driverId && s.status !== 'Delivered');
    if (relatedShipment) {
      if (status === 'Dispatched') {
        relatedShipment.status = 'In Transit';
        relatedShipment.progressPercentage = 30;
        relatedShipment.activityFeed.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'In Transit',
          message: 'Vehicle is currently in transit.',
        });
      } else if (status === 'Completed') {
        relatedShipment.status = 'Delivered';
        relatedShipment.progressPercentage = 100;
        relatedShipment.activityFeed.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
          message: 'Cargo successfully unloaded and hand-signed.',
        });
      }
    }

    this.save();
  }

  // Maintenance Workflow
  public getMaintenanceLogs() { return this.data.maintenanceLogs; }
  public addMaintenanceLog(log: MaintenanceLog) {
    this.data.maintenanceLogs.push(log);

    // Business rule: Creating an active maintenance record changes vehicle status to In Shop
    if (log.status === 'Active') {
      const v = this.data.vehicles.find(item => item.id === log.vehicleId);
      if (v) {
        v.status = 'In Shop';
      }
    }
    this.save();
  }
  public completeMaintenanceLog(id: string, cost: number) {
    const log = this.data.maintenanceLogs.find(l => l.id === id);
    if (log) {
      log.status = 'Completed';
      log.cost = cost;

      // Add as maintenance expense
      this.addExpense({
        id: 'exp-' + Math.random().toString(36).substr(2, 9),
        vehicleId: log.vehicleId,
        vehicleName: log.vehicleName,
        amount: cost,
        type: 'Maintenance',
        date: new Date().toISOString().split('T')[0],
        description: `Completed: ${log.description}`,
      });

      // Business rule: Closing maintenance restores the vehicle to Available
      const v = this.data.vehicles.find(item => item.id === log.vehicleId);
      if (v && v.status === 'In Shop') {
        v.status = 'Available';
        v.nextMaintenanceOdometer = v.odometer + 8000; // Schedule next run in 8,000 km
      }
      this.save();
    }
  }

  // Fuel Logs & Expenses
  public getFuelLogs() { return this.data.fuelLogs; }
  public addFuelLog(log: FuelLog) {
    this.data.fuelLogs.push(log);
    // Auto expense logging
    this.addExpense({
      id: 'exp-' + Math.random().toString(36).substr(2, 9),
      vehicleId: log.vehicleId,
      vehicleName: log.vehicleName,
      amount: log.cost,
      type: 'Fuel',
      date: log.date,
      description: `Fuel Refill: ${log.liters}L`,
    });
    this.save();
  }

  public getExpenses() { return this.data.expenses; }
  public addExpense(expense: Expense) {
    this.data.expenses.push(expense);
    this.save();
  }

  // Notifications
  public getNotifications() { return this.data.notifications; }
  public addNotification(notification: Notification) {
    this.data.notifications.push(notification);
    this.save();
  }
  public markNotificationsAsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId || n.role === 'all') {
        n.read = true;
      }
    });
    this.save();
  }

  // Geofencing
  public getGeofences() { return this.data.geofences; }
  public addGeofenceAlert(id: string, alert: string, vehicleReg: string) {
    const gf = this.data.geofences.find(g => g.id === id);
    if (gf) {
      if (!gf.activeVehicles.includes(vehicleReg)) {
        gf.activeVehicles.push(vehicleReg);
      }
      gf.alerts.unshift(alert);
      this.save();
    }
  }

  // Emergencies
  public getEmergencies() { return this.data.emergencies || []; }
  public addEmergency(alert: Omit<EmergencyAlert, 'id' | 'status'>) {
    if (!this.data.emergencies) this.data.emergencies = [];
    const newAlert: EmergencyAlert = {
      ...alert,
      id: 'em-' + Math.random().toString(36).substr(2, 9),
      status: 'Active'
    };
    this.data.emergencies.push(newAlert);
    this.save();
    return newAlert;
  }
  public acknowledgeEmergency(id: string) {
    if (!this.data.emergencies) this.data.emergencies = [];
    const alert = this.data.emergencies.find(e => e.id === id);
    if (alert) {
      alert.status = 'Acknowledged';
      this.save();
    }
  }
}

export const db = new JSONDatabase();
