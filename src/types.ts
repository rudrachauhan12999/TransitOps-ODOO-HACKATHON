export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
}

export interface StructuredAddress {
  line1: string;
  line2?: string;
  landmark?: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface VehicleDocument {
  id: string;
  type: 'RC Book' | 'Insurance' | 'PUC' | 'Fitness Certificate' | 'Permit' | 'Road Tax';
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  status: 'Active' | 'Expiring' | 'Expired';
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: 'Heavy Truck' | 'Medium Truck' | 'Light Van' | 'Electric Container';
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  fuelEfficiency: number;
  fuelType: 'Diesel' | 'Electric' | 'Petrol';
  nextMaintenanceOdometer: number;
  location: string;
  activeTripId?: string;
  documents?: VehicleDocument[];
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  emergencyContactNumber?: string;
  safetyScore: number;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  activeTripId?: string;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  customerName: string;
  clientId: string;
  source: string;
  destination: string;
  sourceAddress?: StructuredAddress;
  destinationAddress?: StructuredAddress;
  status: 'Booked' | 'Confirmed' | 'Picked Up' | 'In Transit' | 'At Hub' | 'Out For Delivery' | 'Delivered';
  cargoWeight: number;
  priority: 'High' | 'Medium' | 'Low';
  eta: string;
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
  tripId: string;
  source: string;
  destination: string;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number;
  driverId: string;
  vehicleId: string;
  fuelConsumed?: number;
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
  role: 'admin' | 'dispatcher' | 'driver' | 'all';
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
}
