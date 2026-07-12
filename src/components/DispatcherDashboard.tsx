import React, { useState, useEffect } from 'react';
import { User, Vehicle, Driver, Shipment } from '../types';
import MapWidget from './MapWidget';
import { 
  ShieldAlert, Calendar, CheckCircle2, AlertTriangle, 
  UserCheck, Navigation, Plus, MapPin, Search, Eye, X, Info, RefreshCw, Sun, Moon, Truck, ShieldCheck
} from 'lucide-react';

interface DispatcherDashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function DispatcherDashboard({ user, onLogout, theme, toggleTheme }: DispatcherDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assignment Modal specifically for approving "Booked" shipments
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [departureTime, setDepartureTime] = useState('Immediate');
  
  // Rejection input
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Interactive calendar selection
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(new Date().getDate());

  // Search filter
  const [shipmentSearch, setShipmentSearch] = useState('');

  const fetchDispatcherData = async () => {
    try {
      const vRes = await fetch('/api/vehicles');
      const dRes = await fetch('/api/drivers');
      const sRes = await fetch('/api/shipments');
      const eRes = await fetch('/api/emergencies');

      if (vRes.ok && dRes.ok && sRes.ok) {
        const vData: Vehicle[] = await vRes.json();
        const dData: Driver[] = await dRes.json();
        const sData: Shipment[] = await sRes.json();
        const eData = eRes.ok ? await eRes.json() : [];

        setVehicles(vData);
        setDrivers(dData);
        setShipments(sData);
        setEmergencies(eData);

        // Pre-select first available driver/vehicle if not already set
        const availDrivers = dData.filter(d => d.status === 'Available');
        if (availDrivers.length > 0 && !assignDriverId) {
          setAssignDriverId(availDrivers[0].id);
        }
        const availVehicles = vData.filter(v => v.status === 'Available');
        if (availVehicles.length > 0 && !assignVehicleId) {
          setAssignVehicleId(availVehicles[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching dispatcher logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatcherData();
    const interval = setInterval(fetchDispatcherData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDispatcherData();
    setTimeout(() => setRefreshing(false), 600);
  };

  // Open Approval Modal
  const openApprovalFlow = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowRejectInput(false);
    setRejectionReason('');
    setErrorMsg(null);
    setSuccessMsg(null);
    
    // Choose available assets by default
    const firstAvailDriver = drivers.find(d => d.status === 'Available' && d.safetyScore >= 70);
    if (firstAvailDriver) setAssignDriverId(firstAvailDriver.id);
    else setAssignDriverId('');

    const firstAvailVehicle = vehicles.find(v => v.status === 'Available' && v.maxLoadCapacity >= shipment.cargoWeight);
    if (firstAvailVehicle) setAssignVehicleId(firstAvailVehicle.id);
    else setAssignVehicleId('');

    setShowApprovalModal(true);
  };

  // Confirm Shipment Approval API Call
  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!assignDriverId) {
      setErrorMsg('Please select a driver partner to approve shipment.');
      return;
    }
    if (!assignVehicleId) {
      setErrorMsg('Please select a container vehicle to approve shipment.');
      return;
    }

    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: assignDriverId,
          vehicleId: assignVehicleId,
          departureTime: departureTime
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Approval processing failed');
      }

      setSuccessMsg(`Approved consignment ${selectedShipment.shipmentId} & pre-allocated resources successfully.`);
      setShowApprovalModal(false);
      setSelectedShipment(null);
      fetchDispatcherData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing approval pipeline');
    }
  };

  // Confirm Shipment Rejection API Call
  const handleConfirmRejection = async () => {
    if (!selectedShipment) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!rejectionReason.trim()) {
      setErrorMsg('Please provide a descriptive reason for rejecting this consignment request.');
      return;
    }

    try {
      const res = await fetch(`/api/shipments/${selectedShipment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      setSuccessMsg(`Consignment request ${selectedShipment.shipmentId} rejected.`);
      setShowApprovalModal(false);
      setSelectedShipment(null);
      fetchDispatcherData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error rejecting request');
    }
  };

  // Calendar logic (31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Compute stats for current calendar date
  const getCalendarDetail = (day: number): {
    status: 'completed' | 'delayed' | 'active' | 'future';
    score: string;
    trips: string;
    driver: string;
    cost: string;
    alerts: string;
  } => {
    // Hardcoded demo audits for beautiful calendar interaction
    if (day === 4) {
      return {
        status: 'delayed',
        score: '40%',
        trips: 'TRIP-4081 (Navsari Hub)',
        driver: 'Rajesh Kumar (Suspended)',
        cost: '₹ 15,200',
        alerts: 'Driver License validity threshold alert triggered. Trip suspended pending license update.'
      };
    }

    if (day > 15) {
      return {
        status: 'future',
        score: '--',
        trips: 'Awaiting consignments schedule',
        driver: 'Awaiting driver roster',
        cost: '--',
        alerts: 'Unallocated calendar index.'
      };
    }

    return {
      status: 'completed',
      score: '100%',
      trips: `TRIP-228${day}: Domestic lane completed`,
      driver: 'Vikram Singh',
      cost: '₹ 34,000',
      alerts: 'Zero exceptions reported.'
    };
  };

  const activeCount = shipments.filter(s => s.status === 'In Transit' || s.status === 'Picked Up' || s.status === 'Out For Delivery').length;
  const pendingCount = shipments.filter(s => s.status === 'Booked').length;
  const standbyDrivers = drivers.filter(d => d.status === 'Available').length;
  const standbyVehicles = vehicles.filter(v => v.status === 'Available').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xs transition-colors">
        <div className="flex items-center space-x-3">
          <div className="bg-brand/10 p-2.5 rounded-xl border border-brand/20">
            <UserCheck className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Carry<span className="text-brand">On</span>
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">OPERATIONS CONTROLLER DESK</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="text-right flex flex-col items-end">
            <div className="text-xs font-bold text-slate-950 dark:text-white">{user.name}</div>
            <div className="text-[9px] text-brand font-mono font-bold">Logistics Dispatcher</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Phone: {user.phone || '+91 98765 43211'}</div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 font-bold cursor-pointer transition"
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* Global alert feedback */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40 px-6 py-3 flex justify-between items-center text-emerald-700 dark:text-emerald-450 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[10px] text-emerald-500 hover:underline uppercase font-bold cursor-pointer">DISMISS</button>
        </div>
      )}

      {errorMsg && !showApprovalModal && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/40 px-6 py-3 flex justify-between items-center text-red-700 dark:text-red-400 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[10px] text-red-500 hover:underline uppercase font-bold cursor-pointer">DISMISS</button>
        </div>
      )}

      {/* ACTIVE EMERGENCY BANNER */}
      {emergencies.filter(e => e.status === 'Active').length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/40 px-4 py-4 animate-fadeIn">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="bg-brand text-white p-2 rounded-xl animate-pulse flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-red-900 dark:text-red-450 uppercase tracking-wide">CRITICAL SOS FLEET ALERTS ({emergencies.filter(e => e.status === 'Active').length})</h4>
                <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">Urgent coordinator response requested on NH-48 Express Lanes.</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl space-y-2">
              {emergencies.filter(e => e.status === 'Active').map(e => (
                <div key={e.id} className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 dark:text-white">{e.driverName}</span>
                      <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-mono font-bold px-1.5 py-0.5 rounded">Consignment: {e.tripId}</span>
                      <span className="text-slate-400 font-mono text-[9px]">{e.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">{e.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/emergencies/${e.id}/acknowledge`, { method: 'POST' });
                        fetchDispatcherData();
                      }}
                      className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer uppercase font-mono"
                    >
                      Acknowledge
                    </button>
                    <a
                      href={`mailto:${e.driverId}@carryon.in?subject=Emergency dispatch details`}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Email Driver
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Bento Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Stats, Standby Roster & geofences (Span 1) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Operations Metrics Overview */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-4">Operations Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-750 p-4 rounded-2xl">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">ACTIVE LORRIES</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeCount}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-750 p-4 rounded-2xl">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">PENDING APPROVAL</div>
                <div className="text-2xl font-black text-brand mt-1">{pendingCount}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-750 p-4 rounded-2xl">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">STANDBY DRIVERS</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{standbyDrivers}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-750 p-4 rounded-2xl">
                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase font-mono">VEHICLES STANDBY</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{standbyVehicles}</div>
              </div>
            </div>
          </div>

          {/* Standby Operator Roster list */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Roster Standby Drivers</h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {drivers.length === 0 ? (
                <div className="text-xs text-slate-400">Roster stands empty.</div>
              ) : (
                drivers.map(d => {
                  const isSuspended = d.status === 'Suspended' || d.safetyScore < 70;
                  const isLicenseExpired = new Date(d.licenseExpiryDate) < new Date();
                  return (
                    <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 rounded-xl flex justify-between items-center text-left">
                      <div>
                        <div className="text-xs font-bold text-slate-950 dark:text-white">{d.name}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">License: {d.licenseCategory}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] font-bold ${isSuspended ? 'text-red-500' : 'text-brand'}`}>
                          Score: {d.safetyScore}/100
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase border font-mono ${
                          isSuspended 
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400' 
                            : isLicenseExpired 
                              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-450'
                              : d.status === 'Available'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-450'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {isSuspended ? 'Suspended' : isLicenseExpired ? 'Expired License' : d.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Geofence Alert Log */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-3">Geofence Entry Log</h3>
            <div className="space-y-3 text-left">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 rounded-xl flex items-start space-x-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0 animate-pulse" />
                <div>
                  <div className="font-bold text-slate-950 dark:text-white">Valsad Geofence Log</div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">Tesla Container Truck verified crossing Gujarat/MH toll lane NH-48 Expressway.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Center & Right Column: Operational Lane Maps, Shipments Console & Calendars (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map center widget */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Active Fleet Dispatch Map</span>
            <div className="h-[280px]">
              {(() => {
                const activeShipment = shipments.find(s => ['In Transit', 'Picked Up', 'At Hub', 'Out For Delivery', 'Confirmed'].includes(s.status)) || shipments[0] || null;
                return (
                  <MapWidget 
                    progress={activeShipment ? activeShipment.progressPercentage : 72}
                    source={activeShipment ? activeShipment.source : 'Surat Textile Hub'}
                    destination={activeShipment ? activeShipment.destination : 'Mumbai Port Terminal 2'}
                    sourceAddress={activeShipment ? activeShipment.sourceAddress : undefined}
                    destinationAddress={activeShipment ? activeShipment.destinationAddress : undefined}
                    activeVehicleReg={activeShipment?.vehicleNumber || 'GJ-05-BY-1204'}
                  />
                );
              })()}
            </div>
          </div>

          {/* Shipment Manifests console list */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-md md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <span>Shipment Manifests Console</span>
                  <span className="text-[10px] bg-brand/10 text-brand px-2.5 py-0.5 rounded-full font-bold">
                    {shipments.length} logged
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time tracking ledger for active client consignments</p>
              </div>
              <div className="mt-3 md:mt-0 relative flex-1 md:w-64 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search consignor client, ID..."
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Shipments List */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-xs text-slate-400 font-bold py-8 text-center">Syncing operations manifests...</div>
              ) : shipments.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  No active client consignment requests logged.
                </div>
              ) : (
                shipments
                  .filter(s => {
                    const term = shipmentSearch.toLowerCase();
                    return (
                      s.shipmentId?.toLowerCase().includes(term) ||
                      s.customerName?.toLowerCase().includes(term) ||
                      s.source?.toLowerCase().includes(term) ||
                      s.destination?.toLowerCase().includes(term)
                    );
                  })
                  .map((s) => {
                    let statusLabel = s.status;
                    let colorClass = 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';

                    if (s.status === 'Booked') {
                      statusLabel = 'Pending Approval';
                      colorClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-900/30';
                    } else if (s.status === 'Confirmed') {
                      statusLabel = 'Assigned';
                      colorClass = 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-red-400 border-brand/20';
                    } else if (s.status === 'Delivered') {
                      statusLabel = 'Completed';
                      colorClass = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/30';
                    } else if (s.status === 'In Transit' || s.status === 'Picked Up' || s.status === 'Out For Delivery') {
                      colorClass = 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-red-400 border-brand/20';
                    }

                    return (
                      <div key={s.id} className="bg-white dark:bg-slate-800/80 border border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl p-4.5 transition-all text-left">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2.5 md:space-y-0">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{s.shipmentId}</span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${colorClass}`}>
                                {statusLabel}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">| {s.priority} SLA</span>
                            </div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                              Consignor: <span className="text-slate-900 dark:text-slate-200">{s.customerName}</span>
                            </div>
                          </div>
                          
                          <div className="text-left md:text-right text-xs">
                            <div className="text-slate-500 dark:text-slate-450">Payload: <span className="text-slate-900 dark:text-slate-200 font-bold">{s.cargoWeight.toLocaleString()} kg</span></div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">ETA: {s.eta}</div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 mt-3 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 text-xs">
                          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-brand" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{s.source}</span>
                            <span>&rarr;</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{s.destination}</span>
                          </div>

                          <div className="flex items-center space-x-3.5">
                            {s.driverName ? (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                Driver: <span className="font-bold text-slate-800 dark:text-slate-200">{s.driverName}</span> {s.vehicleNumber && `(${s.vehicleNumber})`}
                              </div>
                            ) : (
                              <span className="text-[10px] text-yellow-600 font-mono font-bold">Unassigned Operator</span>
                            )}

                            {s.status === 'Booked' && (
                              <button
                                type="button"
                                onClick={() => openApprovalFlow(s)}
                                className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-[10px] font-bold cursor-pointer transition shadow-sm"
                              >
                                APPROVE & DISPATCH
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Control Calendar audits */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
              <div>
                <h3 className="text-md md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Operations Audits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily SLA audits and safety exceptions</p>
              </div>
              <div className="mt-3 md:mt-0 bg-brand/5 border border-brand/10 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-brand">
                Jul 2026 Success: <span className="text-green-600 font-bold">96.8%</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="font-mono text-slate-400 font-bold py-1">{d}</div>
              ))}

              {daysInMonth.map((day) => {
                const details = getCalendarDetail(day);
                let colorClass = 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-750 hover:border-brand';
                
                if (details.status === 'completed') {
                  colorClass = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold';
                } else if (details.status === 'delayed') {
                  colorClass = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 font-bold animate-pulse';
                } else if (details.status === 'active') {
                  colorClass = 'bg-yellow-50 dark:bg-amber-950/20 border-yellow-200 dark:border-amber-900/30 text-yellow-700 dark:text-amber-450 font-bold';
                }

                const isSelected = selectedCalendarDate === day;

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setSelectedCalendarDate(day)}
                    className={`aspect-square rounded-lg border flex flex-col justify-between p-1 cursor-pointer transition-all ${colorClass} ${
                      isSelected ? 'ring-2 ring-brand border-white dark:border-slate-800 shadow-xs' : ''
                    }`}
                  >
                    <span className="text-[9px] font-mono">{day}</span>
                    <span className="text-[7px] font-bold uppercase tracking-tighter">
                      {details.status === 'completed' && 'OK'}
                      {details.status === 'delayed' && 'FAIL'}
                      {details.status === 'active' && 'LIVE'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Calendar audit details */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-750 rounded-2xl p-4 text-left">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2.5">
                Audit Log - July {selectedCalendarDate}, 2026
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">Scheduled Dispatch:</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{getCalendarDetail(selectedCalendarDate).trips}</div>
                </div>
                <div>
                  <div className="text-slate-400">Assigned Driver:</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{getCalendarDetail(selectedCalendarDate).driver}</div>
                </div>
                <div>
                  <div className="text-slate-400">Success Score:</div>
                  <div className="font-bold text-brand mt-0.5 font-mono">{getCalendarDetail(selectedCalendarDate).score}</div>
                </div>
              </div>

              {getCalendarDetail(selectedCalendarDate).alerts && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-750 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-brand font-bold font-mono text-[9px] uppercase tracking-wider block mb-1">Audit Alert Flags</span>
                  {getCalendarDetail(selectedCalendarDate).alerts}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* APPROVAL & ALLOCATION FLOW MODAL */}
      {showApprovalModal && selectedShipment && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-lg w-full rounded-[24px] p-5 md:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl text-left animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <div>
                <h3 className="text-md md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Approve & Dispatch Manifest</h3>
                <p className="text-[11px] text-brand font-bold font-mono uppercase tracking-wider mt-0.5">Consignment: {selectedShipment.shipmentId} | Weight: {selectedShipment.cargoWeight.toLocaleString()} kg</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!showRejectInput ? (
              <form onSubmit={handleConfirmApproval} className="space-y-4">
                
                {/* Driver Roster Selection */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">1. ALLOCATE SAFETY-COMPLIANT DRIVER</label>
                  <select
                    required
                    value={assignDriverId}
                    onChange={(e) => setAssignDriverId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-805 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Choose standby operator --</option>
                    {drivers.map(d => {
                      const isSuspended = d.status === 'Suspended' || d.safetyScore < 70;
                      const isLicenseExpired = new Date(d.licenseExpiryDate) < new Date();
                      const isOnTrip = d.status === 'On Trip';
                      const isDisabled = isSuspended || isLicenseExpired || isOnTrip;

                      let reason = d.status;
                      if (isSuspended) reason = 'Suspended / Poor Safety';
                      else if (isLicenseExpired) reason = 'Expired License';
                      else if (isOnTrip) reason = 'On Trip';

                      return (
                        <option 
                          key={d.id} 
                          value={d.id} 
                          disabled={isDisabled}
                        >
                          {d.name} ({reason}) - Score: {d.safetyScore}/100
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">2. ASSIGN VEHICLE CONTAINER</label>
                  <select
                    required
                    value={assignVehicleId}
                    onChange={(e) => setAssignVehicleId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-805 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Choose container --</option>
                    {vehicles.map(v => {
                      const isInMaintenance = v.status === 'In Shop';
                      const isOnTrip = v.status === 'On Trip';
                      const isCapacityInsufficient = v.maxLoadCapacity < selectedShipment.cargoWeight;
                      const isDisabled = isInMaintenance || isOnTrip || isCapacityInsufficient;

                      let reason = v.status;
                      if (isInMaintenance) reason = 'Maintenance Shop';
                      else if (isOnTrip) reason = 'On Trip';
                      else if (isCapacityInsufficient) reason = `Insufficient Capacity (Max ${v.maxLoadCapacity}kg)`;

                      return (
                        <option 
                          key={v.id} 
                          value={v.id} 
                          disabled={isDisabled}
                        >
                          {v.name} ({v.registrationNumber}) - Capacity: {v.maxLoadCapacity.toLocaleString()} kg | {reason}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">3. PLANNED DEPARTURE SLT</label>
                  <select
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-805 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Immediate">Immediate dispatch</option>
                    <option value="In 30 Minutes">30 mins buffer</option>
                    <option value="In 1 Hour">1 hr buffer</option>
                    <option value="Tonight Schedule">Tonight Shift</option>
                    <option value="Tomorrow Morning">Tomorrow Shift</option>
                  </select>
                </div>

                <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-slate-700/60 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 rounded-xl transition cursor-pointer"
                  >
                    REJECT REQUEST
                  </button>
                  <div className="flex-1 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-xs font-bold text-white rounded-xl cursor-pointer transition shadow-sm"
                    >
                      DISPATCH TRIP
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-yellow-50 dark:bg-amber-950/20 border border-yellow-200 dark:border-amber-900/30 rounded-xl text-yellow-700 dark:text-amber-450 text-xs flex items-start space-x-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Rejecting consignment request {selectedShipment.shipmentId}. The client will be auto-notified with your reason.</span>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">REJECTION REASON DESCRIPTION</label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide description (e.g. Current standby trucks are fully utilized)..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none h-24"
                  />
                </div>

                <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRejection}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                  >
                    CONFIRM REJECTION
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
