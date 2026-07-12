import React, { useState, useEffect } from 'react';
import { User, Vehicle, Driver, Shipment } from '../types';
import { 
  Truck, Navigation, AlertTriangle, CheckSquare, Sun, Moon, Languages,
  Battery, Droplet, CheckCircle2, History, AlertOctagon, RefreshCw, Upload, FileCheck, Smartphone, UserCheck
} from 'lucide-react';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const translations = {
  en: {
    title: 'Driver Console',
    online: 'ONLINE NODE',
    logout: 'LOG OUT',
    emergencyIncidentPanel: 'Emergency SOS Broadcast',
    mechanicalFail: 'Mechanical Fail',
    accidentSos: 'Accident SOS',
    heavyJam: 'Heavy Jam',
    activeCargoTask: 'Active Cargo Task',
    assigned: 'Assigned',
    transitProgress: 'Assignment Transit Progress:',
    summary: 'Current Assignment Summary',
    consignor: 'Consignor Client',
    container: 'Assigned Lorry',
    route: 'Route Lane',
    payload: 'Cargo Payload',
    requestedEta: 'Requested ETA',
    milestones: 'Milestone Progress Steps',
    preTripCheck: 'Pre-Trip Safety Inspection',
    preTripCheckDesc: 'Inspect tires, brakes, lights, and coolant parameters.',
    completeSafety: 'Complete Safety Inspection',
    cargoLoaded: 'Cargo Loaded & Locked',
    cargoLoadedDesc: 'Verify container doors are sealed and payload is secured.',
    confirmLoaded: 'Confirm Cargo Loaded',
    departing: 'Departing / Picked Up',
    departingDesc: 'Departing pick-up hub onto NH-48 Express highway.',
    markDeparted: 'Mark as Departed',
    enRoute: 'En Route (In Transit)',
    enRouteDesc: 'En route with live GPS tracking actively broadcasting.',
    setInTransit: 'Set In Transit',
    reachedDestination: 'Reached Destination',
    reachedDestinationDesc: 'Reached consignee unloading terminal warehouse.',
    markReached: 'Mark as Arrived',
    proofValidation: 'Delivery Proof Validation',
    proofValidationDesc: 'Collect recipient signature and photo of unloaded container to close.',
    podForm: 'Proof of Delivery Form',
    recipientName: 'RECIPIENT FULL NAME',
    signatureText: 'SIGNATURE CERTIFICATE TEXT',
    cargoPhoto: 'CARGO DISCHARGE PHOTO',
    simulatePhoto: 'Simulate Photo Capture',
    finalizePod: 'Finalize Delivery & Sign (POD)',
    telemetry: 'Truck Telemetry Metrics',
    refuel: '+ Fuel Refuel',
    fuelCap: 'FUEL CAPACITY',
    batteryLife: 'BATTERY HEALTH',
    tireCalib: 'TIRE PRESSURE',
    engineThermal: 'ENGINE THERMAL',
    allDispatchesCleared: 'All dispatches cleared',
    waitingApproval: 'Waiting for operations dispatcher to approve and assign your next consignment schedule.',
    completedDeliveries: 'Completed deliveries log',
    noPreviousDeliveries: 'No previous deliveries completed in this session.',
    dieselRefuel: 'Log Diesel Refuel',
    refilledAmount: 'REFILLED AMOUNT (LITERS)',
    totalCost: 'TOTAL COST (INR)',
    confirmLog: 'Confirm Log',
    cancel: 'Cancel',
    emergencyActiveMsg: 'Emergency signal broadcast to dispatch center. Expect callback.'
  },
  hi: {
    title: 'चालक कंसोल',
    online: 'ONLINE NODE',
    logout: 'लॉग आउट',
    emergencyIncidentPanel: 'आपातकालीन SOS ब्रॉडकास्ट',
    mechanicalFail: 'Mechanical Fail',
    accidentSos: 'दुर्घटना SOS',
    heavyJam: 'Heavy Jam',
    activeCargoTask: 'सक्रिय कार्गो कार्य',
    assigned: 'Assigned',
    transitProgress: 'कार्य पारगमन प्रगति:',
    summary: 'वर्तमान कार्य सारांश',
    consignor: 'प्रेषक ग्राहक',
    container: 'सौंपी गई गाड़ी',
    route: 'मार्ग लेन',
    payload: 'कार्गो पेलोड',
    requestedEta: 'अनुरोधित ETA',
    milestones: 'मील का पत्थर प्रगति चरण',
    preTripCheck: 'यात्रा-पूर्व सुरक्षा निरीक्षण',
    preTripCheckDesc: 'टायर, ब्रेक, लाइट और कूलेंट मापदंडों का निरीक्षण करें।',
    completeSafety: 'सुरक्षा निरीक्षण पूरा करें',
    cargoLoaded: 'कार्गो लोड और लॉक',
    cargoLoadedDesc: 'सत्यापित करें कि कंटेनर के दरवाजे सील हैं और पेलोड सुरक्षित है।',
    confirmLoaded: 'कार्गो लोड होने की पुष्टि करें',
    departing: 'प्रस्थान / उठाया गया',
    departingDesc: 'पिक-अप हब से NH-48 एक्सप्रेस हाईवे पर प्रस्थान।',
    markDeparted: 'प्रस्थान चिह्नित करें',
    enRoute: 'मार्ग में (पारगमन)',
    enRouteDesc: 'सक्रिय रूप से GPS ट्रैकिंग प्रसारण के साथ मार्ग में।',
    setInTransit: 'पारगमन सेट करें',
    reachedDestination: 'गंतव्य पर पहुंचे',
    reachedDestinationDesc: 'प्राप्तकर्ता अनलोडिंग टर्मिनल गोदाम पर पहुंचे।',
    markReached: 'आगमन चिह्नित करें',
    proofValidation: 'वितरण प्रमाण सत्यापन',
    proofValidationDesc: 'शिपमेंट बंद करने के लिए प्राप्तकर्ता के हस्ताक्षर और अनलोडेड कंटेनर की फोटो एकत्र करें।',
    podForm: 'डिलिवरी फॉर्म का प्रमाण (POD Form)',
    recipientName: 'प्राप्तकर्ता का पूरा नाम',
    signatureText: 'हस्ताक्षर प्रमाण पत्र पाठ',
    cargoPhoto: 'कार्गो डिस्चार्ज फोटो',
    simulatePhoto: 'फोटो कैप्चर का अनुकरण करें',
    finalizePod: 'वितरण अंतिम करें और हस्ताक्षर करें (POD)',
    telemetry: 'ट्रक टेलीमेट्री मेट्रिक्स',
    refuel: '+ ईंधन भरें',
    fuelCap: 'ईंधन क्षमता',
    batteryLife: 'बैटरी स्वास्थ्य',
    tireCalib: 'टायर दबाव',
    engineThermal: 'इंजन तापमान',
    allDispatchesCleared: 'सभी प्रेषण स्पष्ट',
    waitingApproval: 'ऑपरेशन्स डिस्पैचर द्वारा आपके अगले शिपमेंट कार्यक्रम को स्वीकृत और सौंपने की प्रतीक्षा की जा रही है।',
    completedDeliveries: 'पूरे किए गए वितरण लॉग',
    noPreviousDeliveries: 'इस सत्र में कोई पिछला वितरण पूरा नहीं हुआ।',
    dieselRefuel: 'डीजल रिफ्यूल लॉग करें',
    refilledAmount: 'भरी गई मात्रा (लीटर)',
    totalCost: 'कुल लागत (INR)',
    confirmLog: 'लॉग की पुष्टि करें',
    cancel: 'Cancel',
    emergencyActiveMsg: 'आपातकालीन संकेत नियंत्रण केंद्र को प्रसारित किया गया। वापस कॉल की प्रतीक्षा करें।'
  }
};

export default function DriverDashboard({ user, onLogout, theme, toggleTheme }: DriverDashboardProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = translations[lang];

  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [completedShipments, setCompletedShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Digital proof state
  const [recipientName, setRecipientName] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [proofPhotoSimulated, setProofPhotoSimulated] = useState(false);

  // Emergency trigger
  const [emergencyActive, setEmergencyActive] = useState<string | null>(null);

  // Fuel logging form modal
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelLiters, setFuelLiters] = useState('85');
  const [fuelCost, setFuelCost] = useState('6800');

  const fetchDriverDashboardData = async () => {
    try {
      const dRes = await fetch('/api/drivers');
      const vRes = await fetch('/api/vehicles');
      const sRes = await fetch('/api/shipments');

      if (dRes.ok && vRes.ok && sRes.ok) {
        const driversList: Driver[] = await dRes.json();
        const vehiclesList: Vehicle[] = await vRes.json();
        const shipmentsList: Shipment[] = await sRes.json();

        // Match driver profile based on user
        const currentDriver = driversList.find(d => d.userId === user.id || d.name === user.name) || driversList[0];
        setDriverProfile(currentDriver);

        if (currentDriver) {
          // Find active shipment allocated to this driver
          const active = shipmentsList.find(s => s.driverId === currentDriver.id && s.status !== 'Delivered');
          setActiveShipment(active || null);

          // Find historical shipments completed by this driver
          const completed = shipmentsList.filter(s => s.driverId === currentDriver.id && s.status === 'Delivered');
          setCompletedShipments(completed);

          if (active && active.vehicleId) {
            const activeVeh = vehiclesList.find(v => v.id === active.vehicleId);
            setVehicle(activeVeh || null);
          } else {
            setVehicle(null);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching driver dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDriverDashboardData();
    setTimeout(() => setRefreshing(false), 550);
  };

  const advanceWorkflowStep = async (nextStatus: string, nextProgress: number, logMessage: string) => {
    if (!activeShipment) return;
    try {
      const updatedActivity = [
        ...(activeShipment.activityFeed || []),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: nextStatus,
          message: logMessage
        }
      ];

      const res = await fetch(`/api/shipments/${activeShipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          progressPercentage: nextProgress,
          activityFeed: updatedActivity
        })
      });

      if (res.ok) {
        fetchDriverDashboardData();
      }
    } catch (err) {
      console.error('Error advancing driver workflow step:', err);
    }
  };

  const handleCompleteDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment) return;

    if (!recipientName.trim() || !signatureText.trim()) {
      alert('Please fill out all required POD validation inputs.');
      return;
    }

    try {
      const updatedActivity = [
        ...(activeShipment.activityFeed || []),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
          message: `Delivery finalized and verified. Recipient: ${recipientName.trim()}. Digital Sign HASH verified.`
        }
      ];

      const res = await fetch(`/api/shipments/${activeShipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Delivered',
          progressPercentage: 100,
          podId: `POD-${Math.floor(100000 + Math.random() * 900000)}`,
          activityFeed: updatedActivity
        })
      });

      if (res.ok) {
        setRecipientName('');
        setSignatureText('');
        setProofPhotoSimulated(false);
        fetchDriverDashboardData();
      }
    } catch (err) {
      console.error('Error finalizing delivery proof:', err);
    }
  };

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          liters: fuelLiters,
          cost: fuelCost,
          odometerReading: vehicle.odometer,
        }),
      });

      if (res.ok) {
        setShowFuelModal(false);
        alert('Fuel purchase logged in operations center.');
        fetchDriverDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerEmergencyAlert = async (type: string) => {
    setEmergencyActive(type);
    try {
      await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driverProfile?.id || 'd-1',
          driverName: driverProfile?.name || user.name,
          tripId: activeShipment?.shipmentId || 'NO_ACTIVE_TRIP',
          message: `${type.toUpperCase()} alert posted by driver.`
        }),
      });
    } catch (err) {
      console.error('Error posting emergency alert:', err);
    }
  };

  const getWorkflowStepDetails = () => {
    if (!activeShipment) return { step: 0 };
    const p = activeShipment.progressPercentage;
    if (p <= 15 && activeShipment.status === 'Confirmed') return { step: 1 };
    if (p <= 25) return { step: 2 };
    if (activeShipment.status === 'Picked Up') return { step: 3 };
    if (activeShipment.status === 'In Transit') return { step: 4 };
    if (activeShipment.status === 'At Hub' || activeShipment.status === 'Out For Delivery') return { step: 5 };
    return { step: 6 };
  };

  const { step: currentStep } = getWorkflowStepDetails();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-12 transition-colors duration-300">
      
      {/* Driver Mobile SaaS Header */}
      <header className="border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xs transition-colors">
        <div className="flex items-center space-x-2.5">
          <div className="bg-brand/10 p-2.5 rounded-xl border border-brand/20">
            <Truck className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-950 dark:text-white leading-tight uppercase tracking-tight">{user.name}</h1>
            <p className="text-[9px] text-brand font-mono font-bold uppercase tracking-wider mt-0.5">{t.online}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* English / Hindi Switcher */}
          <button
            onClick={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 text-[11px] font-bold cursor-pointer"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-brand" />
            <span className="uppercase">{lang === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="text-[10px] bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 font-bold cursor-pointer transition"
          >
            {t.logout}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* EMERGENCY SOS BOARD */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl p-5">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 mb-3.5">
            <AlertOctagon className="w-4.5 h-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">{t.emergencyIncidentPanel}</span>
          </div>

          {emergencyActive ? (
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl text-center shadow-xs">
              <p className="text-xs text-red-700 dark:text-red-400 font-black uppercase tracking-wider animate-pulse">
                🚨 {emergencyActive.toUpperCase()} SOS ACTIVE 🚨
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {t.emergencyActiveMsg}
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <button 
                  onClick={() => triggerEmergencyAlert('Re-Broadcast SOS')}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-[10px] font-bold shadow-md cursor-pointer"
                >
                  Call Control Room
                </button>
                <button
                  onClick={() => setEmergencyActive(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  Clear SOS
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => triggerEmergencyAlert('Breakdown')}
                className="py-2.5 bg-white dark:bg-slate-900 hover:bg-red-100/30 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-[10px] font-bold text-red-700 dark:text-red-400 transition cursor-pointer shadow-xs"
              >
                {t.mechanicalFail}
              </button>
              <button
                type="button"
                onClick={() => triggerEmergencyAlert('Accident')}
                className="py-2.5 bg-white dark:bg-slate-900 hover:bg-red-100/30 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-[10px] font-bold text-red-700 dark:text-red-400 transition cursor-pointer shadow-xs"
              >
                {t.accidentSos}
              </button>
              <button
                type="button"
                onClick={() => triggerEmergencyAlert('Traffic Hold')}
                className="py-2.5 bg-white dark:bg-slate-900 hover:bg-red-100/30 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-[10px] font-bold text-red-700 dark:text-red-400 transition cursor-pointer shadow-xs"
              >
                {t.heavyJam}
              </button>
            </div>
          )}
        </div>

        {/* OPERATOR PROFILE DETAILS */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-xs text-left space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
            <UserCheck className="w-4 h-4 text-brand" />
            <h4 className="text-sm font-black uppercase tracking-wider font-mono text-slate-900 dark:text-white">Operator Profile Info</h4>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase tracking-wider">FULL NAME</span>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{driverProfile?.name || user.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase tracking-wider">PRIMARY PHONE</span>
                <span className="font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">{driverProfile?.contactNumber || user.phone || '+91 98765 43212'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase tracking-wider">EMERGENCY PHONE</span>
                <span className="font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">{driverProfile?.emergencyContactNumber || '+91 99999 88881'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE TASK & MILESTONES WORKFLOW */}
        {activeShipment ? (
          <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">{t.activeCargoTask}</span>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white mt-1 font-mono">{activeShipment.shipmentId}</h2>
                </div>
                <span className="text-[11px] bg-brand/10 text-brand dark:bg-brand/20 dark:text-red-400 border border-brand/20 font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  {activeShipment.status === 'Confirmed' ? t.assigned : activeShipment.status}
                </span>
              </div>

              {/* Transit progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{t.transitProgress}</span>
                  <span className="font-mono font-black text-brand dark:text-red-400">{activeShipment.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-750">
                  <div className="bg-brand h-full rounded-full transition-all duration-500" style={{ width: `${activeShipment.progressPercentage}%` }}></div>
                </div>
              </div>

              {/* Assignment Summary */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-150 dark:border-slate-750 space-y-3 text-left">
                <div className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">{t.summary}</div>
                <div className="grid grid-cols-2 gap-3.5 text-sm">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase font-mono">{t.consignor}</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-300 mt-0.5 block">{activeShipment.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase font-mono">{t.container}</span>
                    <span className="font-extrabold text-sm text-brand dark:text-red-400 mt-0.5 block font-mono">{vehicle?.registrationNumber || 'GJ-05-BY-1204'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase font-mono">{t.route}</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-300 mt-0.5 block uppercase">{activeShipment.source} &rarr; {activeShipment.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase font-mono">{t.payload}</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-300 mt-0.5 block font-mono">{activeShipment.cargoWeight.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-bold uppercase font-mono">{t.requestedEta}</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-300 mt-0.5 block font-mono">{activeShipment.eta}</span>
                  </div>
                </div>
              </div>

              {/* Vertical workflow timeline step logs */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-left">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-4">{t.milestones}</h3>
                
                <div className="relative border-l-2 border-slate-150 dark:border-slate-700 pl-6 space-y-6">
                  
                  {/* Step 1: Safety Check */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep > 1 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : currentStep === 1 
                          ? 'bg-white dark:bg-slate-800 border-brand' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.preTripCheck}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.preTripCheckDesc}</p>
                      
                      {currentStep === 1 && (
                        <button
                          type="button"
                          onClick={() => advanceWorkflowStep('Confirmed', 20, 'Pre-trip safety checklists verified successfully by partner driver.')}
                          className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          {t.completeSafety}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Confirm Loading */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep > 2 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : currentStep === 2 
                          ? 'bg-white dark:bg-slate-800 border-brand' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.cargoLoaded}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.cargoLoadedDesc}</p>
                      
                      {currentStep === 2 && (
                        <button
                          type="button"
                          onClick={() => advanceWorkflowStep('Confirmed', 30, 'Container doors locked & sealed. Cargo payload balance verified.')}
                          className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          {t.confirmLoaded}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Departed */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep > 3 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : currentStep === 3 
                          ? 'bg-white dark:bg-slate-800 border-brand' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.departing}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.departingDesc}</p>
                      
                      {currentStep === 3 && (
                        <button
                          type="button"
                          onClick={() => advanceWorkflowStep('Picked Up', 45, 'Truck departed pickup terminal. Entering national highway expressway.')}
                          className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          {t.markDeparted}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 4: In Transit */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep > 4 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : currentStep === 4 
                          ? 'bg-white dark:bg-slate-800 border-brand' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.enRoute}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.enRouteDesc}</p>
                      
                      {currentStep === 4 && (
                        <button
                          type="button"
                          onClick={() => advanceWorkflowStep('In Transit', 70, 'GPS coordinates broadcasting live. Transit speed nominal.')}
                          className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center space-x-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{t.setInTransit}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 5: Arrived at destination */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep > 5 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : currentStep === 5 
                          ? 'bg-white dark:bg-slate-800 border-brand' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.reachedDestination}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.reachedDestinationDesc}</p>
                      
                      {currentStep === 5 && (
                        <button
                          type="button"
                          onClick={() => advanceWorkflowStep('Out For Delivery', 90, 'Lorry arrived at consignee gate. Unloading processes initialized.')}
                          className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          {t.markReached}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step 6: Proof of Delivery */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                      currentStep === 6 ? 'bg-white dark:bg-slate-800 border-brand' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`} />
                    <div className="text-sm">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t.proofValidation}</div>
                      <p className="text-slate-500 dark:text-slate-450 mt-0.5 text-xs">{t.proofValidationDesc}</p>
                      
                      {currentStep === 6 && (
                        <form onSubmit={handleCompleteDelivery} className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl space-y-3 text-left">
                          <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center space-x-1 font-mono">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>{t.podForm}</span>
                          </h4>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.recipientName}</label>
                            <input
                              type="text"
                              required
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              placeholder="e.g. Rudraksh Chauhan"
                              className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-brand outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.signatureText}</label>
                            <input
                              type="text"
                              required
                              value={signatureText}
                              onChange={(e) => setSignatureText(e.target.value)}
                              placeholder="Type complete name to certify"
                              className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-brand outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">{t.cargoPhoto}</label>
                            {proofPhotoSimulated ? (
                              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/35 rounded-lg text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-between">
                                <span>✓ discharge_unloaded.jpg ready</span>
                                <button type="button" onClick={() => setProofPhotoSimulated(false)} className="text-slate-400 hover:text-red-600 font-bold">Remove</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setProofPhotoSimulated(true)}
                                className="w-full p-2.5 bg-white dark:bg-slate-850 border border-dashed border-slate-250 dark:border-slate-700 hover:border-brand rounded-lg text-[10px] text-slate-500 font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                              >
                                <Upload className="w-3.5 h-3.5 text-brand" />
                                <span>{t.simulatePhoto}</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer mt-1"
                          >
                            {t.finalizePod}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Safety parameters telemetry metrics */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-xs text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-brand" />
                  <span>{t.telemetry}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setFuelLiters('90');
                    setFuelCost('7200');
                    setShowFuelModal(true);
                  }}
                  className="text-[9px] bg-brand/10 hover:bg-brand/20 border border-brand/20 px-2.5 py-1 rounded-lg text-brand dark:text-red-400 font-bold cursor-pointer transition"
                >
                  {t.refuel}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 p-3 rounded-xl flex items-center space-x-3">
                  <Droplet className="w-5 h-5 text-brand" />
                  <div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">{t.fuelCap}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">82% (Safe Range)</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 p-3 rounded-xl flex items-center space-x-3">
                  <Battery className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">{t.batteryLife}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">92% (Excellent)</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 p-3 rounded-xl flex items-center space-x-3">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">{t.tireCalib}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">120 PSI (Standard)</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-750 p-3 rounded-xl flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">{t.engineThermal}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Nominal</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 text-center text-slate-400 shadow-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2.5 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t.allDispatchesCleared}</h3>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.waitingApproval}
            </p>
          </div>
        )}

        {/* COMPLETED DELIVERIES HISTORY JOURNAL */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-xs text-left">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
            <History className="w-4 h-4 text-brand" />
            <span>{t.completedDeliveries} ({completedShipments.length})</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            {completedShipments.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">{t.noPreviousDeliveries}</p>
            ) : (
              completedShipments.map((s, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-750 p-3 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white font-mono">{s.shipmentId}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase">{s.source} &rarr; {s.destination}</div>
                  </div>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    Delivered
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Fuel Logging Form Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-sm w-full rounded-[24px] p-6 relative shadow-xl text-left">
            <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase font-mono tracking-wider mb-0.5">{t.dieselRefuel}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Inputs automatically compiled in operations cost sheets.</p>

            <form onSubmit={handleLogFuel} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1">{t.refilledAmount}</label>
                <input
                  type="number"
                  required
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1">{t.totalCost}</label>
                <input
                  type="number"
                  required
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand hover:bg-brand-hover text-xs font-bold rounded-xl text-white shadow-sm"
                >
                  {t.confirmLog}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
