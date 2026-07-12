import React, { useState, useEffect } from 'react';
import { Shipment, User, StructuredAddress } from '../types';
import MapWidget from './MapWidget';
import AddressForm from './AddressForm';
import { exportToPDF } from '../utils/pdfGenerator';
import { 
  Plus, HelpCircle, FileText, Download, Navigation, Sun, Moon,
  MapPin, Clock, Truck, ShieldAlert, CheckCircle2, RefreshCw, Send, MessageSquare, Search, Filter,
  Barcode, Calendar
} from 'lucide-react';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function ClientDashboard({ user, onLogout, theme, toggleTheme }: ClientDashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Booked' | 'In Transit' | 'Delivered'>('All');

  // Structured Address States
  const [sourceAddress, setSourceAddress] = useState<StructuredAddress>({
    line1: '',
    line2: '',
    landmark: '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pinCode: ''
  });

  const [destinationAddress, setDestinationAddress] = useState<StructuredAddress>({
    line1: '',
    line2: '',
    landmark: '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pinCode: ''
  });

  const [addressErrors, setAddressErrors] = useState<{ source?: Record<string, string>, dest?: Record<string, string> }>({});
  const [contactNumber, setContactNumber] = useState('');
  const [contactError, setContactError] = useState('');

  const [cargoWeight, setCargoWeight] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [etaDate, setEtaDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [etaTime, setEtaTime] = useState('17:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    { sender: 'agent', text: 'Welcome to CarryOn Active Dispatch. I can check current route status or driver telemetry. How can I help?', time: '09:00 AM' }
  ]);

  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        const clientShipments = data.filter((s: Shipment) => s.clientId === user.id);
        setShipments(clientShipments);
        if (clientShipments.length > 0 && !selectedShipment) {
          setSelectedShipment(clientShipments[0]);
        } else if (clientShipments.length > 0 && selectedShipment) {
          const updatedSelected = clientShipments.find((s: Shipment) => s.id === selectedShipment.id);
          if (updatedSelected) {
            setSelectedShipment(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    const interval = setInterval(fetchShipments, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchShipments();
    setTimeout(() => setRefreshing(false), 600);
  };

  const validateForm = () => {
    const sErrors: Record<string, string> = {};
    const dErrors: Record<string, string> = {};
    let isValid = true;
    setContactError('');

    if (!sourceAddress.line1.trim()) { sErrors.line1 = 'Pickup address line 1 is required'; isValid = false; }
    if (!sourceAddress.city.trim()) { sErrors.city = 'Pickup city is required'; isValid = false; }
    if (!sourceAddress.state.trim()) { sErrors.state = 'Pickup state is required'; isValid = false; }
    if (!sourceAddress.pinCode.trim() || !/^\d{6}$/.test(sourceAddress.pinCode.trim())) { 
      sErrors.pinCode = 'Must be exactly 6 digits'; isValid = false; 
    }

    if (!destinationAddress.line1.trim()) { dErrors.line1 = 'Destination address line 1 is required'; isValid = false; }
    if (!destinationAddress.city.trim()) { dErrors.city = 'Destination city is required'; isValid = false; }
    if (!destinationAddress.state.trim()) { dErrors.state = 'Destination state is required'; isValid = false; }
    if (!destinationAddress.pinCode.trim() || !/^\d{6}$/.test(destinationAddress.pinCode.trim())) { 
      dErrors.pinCode = 'Must be exactly 6 digits'; isValid = false; 
    }

    if (!contactNumber.trim() || !/^\+?[0-9\s\-]{10,15}$/.test(contactNumber.trim())) {
      setContactError('A valid 10-15 digit contact number is required');
      isValid = false;
    }

    setAddressErrors({ source: sErrors, dest: dErrors });
    return isValid;
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const formattedDate = new Date(etaDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const finalEta = `${formattedDate}, ${etaTime}`;

    // Compile nice summary strings for old-compatible layout elements
    const compiledSource = `${sourceAddress.line1}, ${sourceAddress.city}`;
    const compiledDestination = `${destinationAddress.line1}, ${destinationAddress.city}`;

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.name,
          clientId: user.id,
          source: compiledSource,
          destination: compiledDestination,
          sourceAddress,
          destinationAddress,
          cargoWeight: Number(cargoWeight),
          priority,
          eta: finalEta,
          contactNumber: contactNumber.trim()
        }),
      });

      if (res.ok) {
        const newShipment = await res.json();
        setShipments(prev => [newShipment, ...prev]);
        setSelectedShipment(newShipment);
        setShowAddModal(false);
        // Reset fields to keep them clean
        setSourceAddress({
          line1: '',
          line2: '',
          landmark: '',
          area: '',
          city: '',
          district: '',
          state: '',
          country: 'India',
          pinCode: ''
        });
        setDestinationAddress({
          line1: '',
          line2: '',
          landmark: '',
          area: '',
          city: '',
          district: '',
          state: '',
          country: 'India',
          pinCode: ''
        });
        setContactNumber('');
        setContactError('');
        setCargoWeight('');
      }
    } catch (err) {
      console.error('Error adding shipment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newLog = [...chatLog, { sender: 'user' as const, text: chatMessage, time: 'Now' }];
    setChatLog(newLog);
    setChatMessage('');

    setTimeout(() => {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Acknowledge: Active route telemetry check on consignment ${selectedShipment?.shipmentId || 'CO-9104'} is running normal. Safe speed registered.`,
          time: 'Now'
        }
      ]);
    }, 1000);
  };

  // Filter & Search shipments
  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Booked') return matchesSearch && s.status === 'Booked';
    if (statusFilter === 'In Transit') return matchesSearch && s.status !== 'Booked' && s.status !== 'Delivered';
    if (statusFilter === 'Delivered') return matchesSearch && s.status === 'Delivered';
    return matchesSearch;
  });

  const getPriorityLabel = (p: string) => {
    if (p === 'High') return 'URGENT';
    if (p === 'Medium') return 'EXPRESS';
    return 'STANDARD';
  };

  const getCityCode = (cityName: string): string => {
    if (!cityName) return 'N/A';
    const clean = cityName.trim().toUpperCase();
    if (clean.includes('SURAT')) return 'SUR';
    if (clean.includes('MUMBAI') || clean.includes('BOMBAY')) return 'BOM';
    if (clean.includes('DELHI') || clean.includes('NEW DELHI')) return 'DEL';
    if (clean.includes('BANGALORE') || clean.includes('BENGALURU')) return 'BLR';
    if (clean.includes('AHMEDABAD')) return 'AMD';
    if (clean.includes('CHENNAI') || clean.includes('MADRAS')) return 'MAA';
    if (clean.includes('HYDERABAD')) return 'HYD';
    if (clean.includes('KOLKATA') || clean.includes('CALCUTTA')) return 'CCU';
    if (clean.includes('PUNE')) return 'PNQ';
    if (clean.includes('GUJARAT')) return 'GUJ';
    if (clean.includes('MAHARASHTRA')) return 'MAH';
    // fallback to first 3 letters
    const letters = clean.replace(/[^A-Z]/g, '');
    return letters.length >= 3 ? letters.substring(0, 3) : (letters + 'XXX').substring(0, 3);
  };

  const timelineSteps = [
    { label: 'Booked', description: 'Manifest Saved' },
    { label: 'Confirmed', description: 'Assigned Driver' },
    { label: 'Picked Up', description: 'Carrier Departed' },
    { label: 'In Transit', description: 'Enroute Expressway' },
    { label: 'At Hub', description: 'Sorting Terminal' },
    { label: 'Out For Delivery', description: 'Local Dispatch' },
    { label: 'Delivered', description: 'POD Completed' },
  ];

  const currentStepIndex = selectedShipment 
    ? { 'Booked': 0, 'Confirmed': 1, 'Picked Up': 2, 'In Transit': 3, 'At Hub': 4, 'Out For Delivery': 5, 'Delivered': 6 }[selectedShipment.status] ?? 0
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xs transition-colors">
        <div className="flex items-center space-x-3">
          <div className="bg-brand/10 p-2.5 rounded-xl border border-brand/20">
            <Truck className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Carry<span className="text-brand">On</span>
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">CLIENT CONSOLE | SECURED NODE</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 bg-brand hover:bg-brand-hover text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">BOOK SHIPMENT</span>
            <span className="sm:hidden">BOOK</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="text-right flex flex-col items-end">
            <div className="text-xs font-bold text-slate-950 dark:text-white">{user.name}</div>
            <div className="text-[9px] text-brand font-mono font-bold">Premium Shipper</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Phone: {user.phone || '+91 98765 12805'}</div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 font-bold cursor-pointer transition"
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List and Support (Span 1) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section title & count */}
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">My Shipments</h2>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-bold font-mono">
              {filteredShipments.length} found
            </span>
          </div>

          {/* Search and Filters box */}
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipment ID, cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {(['All', 'Booked', 'In Transit', 'Delivered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border transition cursor-pointer ${
                      statusFilter === st 
                        ? 'bg-brand/10 text-brand border-brand/30 dark:bg-brand/20 dark:text-red-400' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st === 'Booked' ? 'Pending' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shipments List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse h-28" />
              ))
            ) : filteredShipments.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                <Truck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2.5 animate-pulse" />
                <p className="text-xs">No matching consignments found.</p>
              </div>
            ) : (
              filteredShipments.map((s) => {
                const isActive = selectedShipment?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShipment(s)}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-4.5 border cursor-pointer transition-all ${
                      isActive 
                        ? 'border-brand ring-1 ring-brand bg-brand/5 dark:bg-brand/5 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{s.shipmentId}</span>
                        <div className="text-[9px] text-brand font-bold tracking-wider uppercase mt-0.5">{getPriorityLabel(s.priority)} SLA</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border font-mono ${
                        s.status === 'Delivered' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                          : s.status === 'Booked'
                            ? 'bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            : 'bg-yellow-50 dark:bg-amber-950/20 text-yellow-700 dark:text-amber-400 border-yellow-200 dark:border-amber-900/30'
                      }`}>
                        {s.status === 'Booked' ? 'Pending Approval' : s.status === 'Confirmed' ? 'Assigned' : s.status === 'Delivered' ? 'Delivered' : s.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2.5 mt-1">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-widest font-mono">Origin &rarr; Target</span>
                        <div className="font-bold text-slate-800 dark:text-slate-300 truncate max-w-[120px]">{s.source} &rarr; {s.destination}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-widest font-mono">Target ETA</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-300 font-mono text-[11px]">{s.eta.split(',')[0]}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Support Widget */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-brand" />
              <span>LOGISTICS CONTROL DESK</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Request instant routing amendments or terminal geofence overrides.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-brand" />
                <span>{chatOpen ? 'Close Live Support' : 'Live Operations'}</span>
              </button>
              <a
                href="mailto:support@carryon.in?subject=Operations Inquiry"
                className="py-2.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-center text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-brand" />
                <span>Email Depot</span>
              </a>
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Tracking View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedShipment ? (
            <>
              {/* Shipment Journey Status banner */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 md:p-6 relative overflow-hidden shadow-xs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-brand dark:text-red-400 uppercase tracking-widest">ACTIVE TRUCKING EXPRESSWAY</span>
                    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1 uppercase">
                       {selectedShipment.source} &rarr; {selectedShipment.destination}
                    </h3>
                  </div>
                  <div className="mt-3 md:mt-0 text-left md:text-right">
                    <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">ESTIMATED SLA TIME</div>
                    <div className="text-sm font-black text-brand dark:text-red-400 mt-1 font-mono">
                      {selectedShipment.eta}
                    </div>
                  </div>
                </div>

                {/* Tracking Progress */}
                <div className="relative pt-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span>Consignor Node (0%)</span>
                    <span className="text-brand font-bold font-mono">{selectedShipment.progressPercentage}% Completed</span>
                    <span>Consignee Dock (100%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-750 p-0.5">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: `${selectedShipment.progressPercentage}%` }}
                    >
                      <span className="absolute right-0 top-0.5 w-1 h-1 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">OpenStreetMap Routing Path</span>
                <div className="h-[320px]">
                  <MapWidget 
                    progress={selectedShipment.progressPercentage}
                    source={selectedShipment.source}
                    destination={selectedShipment.destination}
                    sourceAddress={selectedShipment.sourceAddress}
                    destinationAddress={selectedShipment.destinationAddress}
                    activeVehicleReg={selectedShipment.vehicleNumber || 'GJ-05-BY-1204'}
                  />
                </div>
              </div>

              {/* Milestones Flow */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 md:p-6">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-5">Transit Milestones</h3>
                
                <div className="relative flex flex-col md:flex-row md:justify-between md:items-start space-y-5 md:space-y-0 md:space-x-3">
                  <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-slate-100 dark:bg-slate-700 hidden md:block -z-10" />

                  {timelineSteps.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={idx} className="flex md:flex-col items-center md:text-center relative z-10 flex-1">
                        <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone 
                            ? 'bg-brand/10 border-brand text-brand dark:text-red-400 font-bold' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-400'
                        }`}>
                          <span className="text-[10px] font-mono">{idx + 1}</span>
                        </div>

                        <div className="ml-3.5 md:ml-0 md:mt-2.5 text-left md:text-center">
                          <div className={`text-[11px] font-bold ${isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'} ${isCurrent ? 'text-brand' : ''}`}>
                            {step.label === 'Booked' ? 'Pending Approval' : step.label === 'Confirmed' ? 'Assigned' : step.label === 'Delivered' ? 'Completed' : step.label}
                          </div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{step.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boarding Pass Ticket & PDF Exports */}
              <div className="relative bg-[#FFFDF9] dark:bg-slate-900 rounded-[28px] border-2 border-slate-200 dark:border-slate-800 shadow-md flex flex-col lg:flex-row overflow-hidden select-none">
                
                {/* Perforation Left and Right Cutouts for Mobile (snaps vertically) */}
                <div className="lg:hidden absolute left-0 bottom-[210px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-r-2 border-slate-200 dark:border-slate-800 z-20"></div>
                <div className="lg:hidden absolute right-0 bottom-[210px] translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-l-2 border-slate-200 dark:border-slate-800 z-20"></div>

                {/* Perforation Top and Bottom Cutouts for Desktop (side-by-side) */}
                <div className="hidden lg:block absolute -top-4 left-[73%] -translate-x-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 z-20"></div>
                <div className="hidden lg:block absolute -bottom-4 left-[73%] -translate-x-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800 z-20"></div>

                {/* MAIN TICKET (Left 73% on Desktop) */}
                <div className="lg:w-[73%] p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800 lg:border-r-2 border-b-2 lg:border-b-0 border-dashed relative">
                  
                  {/* Top bar */}
                  <div className="flex justify-between items-start border-b border-slate-200/60 dark:border-slate-800/60 pb-4 mb-5">
                    <div className="flex items-center space-x-3">
                      <div className="bg-brand text-white font-mono p-1.5 rounded-lg flex items-center justify-center font-black text-sm tracking-tighter">
                        CO
                      </div>
                      <div>
                        <span className="text-[14px] font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                          <span>CARRY</span><span className="text-brand">ON</span> <span className="font-light text-slate-400">EXPRESS</span>
                        </span>
                        <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Global Logistics Network</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className="bg-brand text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                        {getPriorityLabel(selectedShipment.priority)} CLASS
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-extrabold">GATE 04 • CONSIGNOR DESPATCH</span>
                    </div>
                  </div>

                  {/* Large Route Display */}
                  <div className="flex justify-between items-center bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-slate-800/50">
                    <div className="text-left">
                      <div className="text-[32px] md:text-[40px] font-black text-slate-900 dark:text-white leading-none font-sans tracking-tighter">
                        {getCityCode(selectedShipment.source)}
                      </div>
                      <div className="text-xs font-black text-brand uppercase mt-1 tracking-wider">{selectedShipment.source}</div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase">Origin Hub</div>
                    </div>

                    {/* Arrow / Lane Line with Truck Icon */}
                    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                      <div className="text-[10px] font-mono font-bold text-slate-400 mb-1.5 uppercase tracking-widest flex items-center space-x-1">
                        <Truck className="w-3.5 h-3.5 text-brand animate-pulse" />
                        <span>Transit Corridor</span>
                      </div>
                      <div className="w-full relative flex items-center">
                        <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                        <div 
                          className="absolute bg-brand text-white p-1 rounded-full shadow-md border-2 border-white dark:border-slate-900 transition-all duration-1000"
                          style={{ left: `calc(${selectedShipment.progressPercentage}% - 14px)` }}
                        >
                          <Truck className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                      </div>
                      <div className="text-[9px] font-mono font-black text-brand dark:text-red-400 mt-2">
                        {selectedShipment.progressPercentage}% TRANSIT COMPLETE
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[32px] md:text-[40px] font-black text-slate-900 dark:text-white leading-none font-sans tracking-tighter">
                        {getCityCode(selectedShipment.destination)}
                      </div>
                      <div className="text-xs font-black text-brand uppercase mt-1 tracking-wider">{selectedShipment.destination}</div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase">Consignee Terminal</div>
                    </div>
                  </div>

                  {/* Main Grid Details (Airline boarding pass style) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 mb-5 text-left">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">CONSIGNOR CLIENT</span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">{selectedShipment.customerName}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">ASSIGNED COMMANDER</span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">{selectedShipment.driverName || 'DISPATCH PENDING'}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">FLEET UNIT NUMBER</span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono truncate">{selectedShipment.vehicleNumber || 'ALLOCATION PENDING'}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">CARGO PAYLOAD</span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">{selectedShipment.cargoWeight.toLocaleString()} KG</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">DESPATCH DATE</span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
                        {new Date(selectedShipment.creationDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest font-mono">ESTIMATED SLA ETA</span>
                      <div className="text-xs font-extrabold text-brand dark:text-red-400 mt-0.5 font-mono uppercase">{selectedShipment.eta}</div>
                    </div>
                  </div>

                  {/* Live Status Area */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3.5 md:space-y-0">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                        SYSTEM STATUS: <span className="text-brand dark:text-red-400 font-black">{selectedShipment.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight">
                      LEDGER BLOCK SECURED WITH GPS STREAM • ACTIVE TELEMETRY LOGS
                    </div>
                  </div>
                </div>

                {/* TICKET STUB (Right 27% on Desktop) */}
                <div className="lg:w-[27%] p-6 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col justify-between items-center text-center relative min-h-[220px]">
                  
                  {/* Stub Logo & Info */}
                  <div className="w-full flex justify-between items-center lg:flex-col lg:space-y-4">
                    <div className="text-left lg:text-center">
                      <span className="text-[11px] font-black tracking-tight text-slate-800 dark:text-slate-200">
                        CARRY<span className="text-brand">ON</span> PASS
                      </span>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Transit Stub</div>
                    </div>

                    <div className="bg-brand/10 text-brand border border-brand/20 text-[9px] font-extrabold px-2.5 py-1 rounded-md font-mono uppercase">
                      {selectedShipment.priority}
                    </div>
                  </div>

                  {/* Route & ID summary */}
                  <div className="w-full my-4 text-left lg:text-center border-y border-slate-200/60 dark:border-slate-800/60 py-3 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400 text-[10px]">ROUTE:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {getCityCode(selectedShipment.source)} &rarr; {getCityCode(selectedShipment.destination)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400 text-[10px]">CLIENT:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[110px]">{selectedShipment.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400 text-[10px]">ID:</span>
                      <span className="font-extrabold text-brand dark:text-red-400">{selectedShipment.shipmentId}</span>
                    </div>
                  </div>

                  {/* QR Code Container with scan scanner border decoration */}
                  <div className="relative group p-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <img 
                      className="w-20 h-20 rounded-lg flex-shrink-0" 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CarryOn-${selectedShipment.shipmentId}&color=E74C3C`} 
                      alt="Wallet QR" 
                    />
                    {/* Corner decorators to simulate camera focus */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-brand"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-brand"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand"></div>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="w-full mt-4">
                    <div className="flex items-end justify-center space-x-[2px] h-8 w-full opacity-70 mix-blend-multiply dark:mix-blend-normal dark:invert">
                      {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2].map((w, i) => (
                        <div key={i} className="bg-slate-900" style={{ width: `${w}px`, height: i % 3 === 0 ? '100%' : '80%' }} />
                      ))}
                    </div>
                    <div className="text-[8px] font-mono font-bold text-slate-400 tracking-[0.15em] uppercase text-center mt-1">
                      *CARRYON-{selectedShipment.shipmentId}*
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF EXPORTS CONTAINER (Outside the boarding pass, neatly presented) */}
              <div className="bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-[20px] p-4 flex flex-col md:flex-row justify-between items-center space-y-3.5 md:space-y-0">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Download Official Logistics Paperwork</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Compliant with Indian MoRTH and GST E-way bill requirements</div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => exportToPDF('ticket', selectedShipment)}
                    className="py-2.5 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Ticket PDF</span>
                  </button>
                  <button
                    onClick={() => exportToPDF('invoice', selectedShipment)}
                    className="py-2.5 px-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand" />
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={() => exportToPDF('receipt', selectedShipment)}
                    className="py-2.5 px-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand" />
                    <span>Lorry Receipt</span>
                  </button>
                  <button
                    onClick={() => exportToPDF('pod', selectedShipment)}
                    className="py-2.5 px-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand" />
                    <span>Download POD</span>
                  </button>
                </div>
              </div>

              {/* Activity Feeds */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 md:p-6">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-4">Milestone Log Details</h3>
                <div className="space-y-4.5">
                  {selectedShipment.activityFeed?.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs border-l border-slate-200 dark:border-slate-700 pl-4 relative">
                      <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-brand border-2 border-white dark:border-slate-800 shadow-sm" />
                      <div className="text-slate-400 font-mono w-14 flex-shrink-0 text-[10px]">{item.time}</div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white mr-1.5 font-mono text-[10px] bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-750">
                          {item.status === 'Booked' ? 'PENDING APPROVAL' : item.status === 'Confirmed' ? 'ASSIGNED' : item.status === 'Delivered' ? 'DELIVERED' : item.status.toUpperCase()}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">{item.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-[28px] p-12 text-center text-slate-400">
              <Truck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">No active consignment selected</h3>
              <p className="text-xs max-w-sm mx-auto mt-2 text-slate-500 dark:text-slate-400">
                Book a shipment request or select an existing one from the left-hand column to query live telemetry.
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-2xl w-full rounded-[24px] p-5 md:p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">Book CarryOn Cargo Manifest</h3>
            <p className="text-xs text-brand font-bold mb-5 font-mono uppercase tracking-wider">Initialize high-accuracy geocoding & route planning</p>

            <form onSubmit={handleAddShipment} className="space-y-4">
              
              {/* Structured Address inputs for source & destination */}
              <AddressForm 
                label="Consignor pickup point"
                address={sourceAddress}
                onChange={setSourceAddress}
                errors={addressErrors.source}
              />

              <AddressForm 
                label="Consignee Delivery dock"
                address={destinationAddress}
                onChange={setDestinationAddress}
                errors={addressErrors.dest}
              />

              {/* Client Contact Number */}
              <div className="bg-white dark:bg-slate-800/40 p-4 border border-slate-150 dark:border-slate-700/60 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-150 dark:border-slate-700/50">
                  <h4 className="text-xs font-bold text-brand dark:text-red-400 uppercase tracking-widest">Contact Information</h4>
                  <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase">Primary Contact</span>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">CONTACT NUMBER *</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                      contactError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-brand'
                    } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {contactError && <p className="text-[9px] text-red-500 font-semibold mt-1">{contactError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">CARGO WEIGHT (KG)</label>
                  <input
                    type="number"
                    required
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">PRIORITY TIER</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Standard Logistics</option>
                    <option value="Medium">Express Premium</option>
                    <option value="High">Urgent Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">REQUESTED DELIVERY DATE</label>
                  <input
                    type="date"
                    required
                    value={etaDate}
                    onChange={(e) => setEtaDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">TARGET DELIVERY TIME</label>
                  <input
                    type="time"
                    required
                    value={etaTime}
                    onChange={(e) => setEtaTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-750 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-brand uppercase text-[9px] font-mono tracking-wider block mb-1">Target ETA Representation Preview</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {new Date(etaDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, {etaTime}
                </span>
              </div>

              <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-brand hover:bg-brand-hover text-xs font-bold text-white rounded-xl transition cursor-pointer shadow-md disabled:opacity-55"
                >
                  {isSubmitting ? 'SECUREING LINK...' : 'BOOK MANIFEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Support Drawer */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-lg overflow-hidden z-50 flex flex-col h-96 transition-colors">
          <div className="bg-brand px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Support Operator</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white hover:opacity-85 text-lg leading-none cursor-pointer">&times;</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-slate-900">
            {chatLog.map((log, idx) => (
              <div key={idx} className={`max-w-[85%] p-2.5 rounded-xl ${
                log.sender === 'user' 
                  ? 'bg-brand/10 text-brand dark:text-red-450 ml-auto rounded-tr-none border border-brand/20 font-bold' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-150 dark:border-slate-750 shadow-xs'
              }`}>
                <div>{log.text}</div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 text-right mt-1 font-mono">{log.time}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="p-2 border-t border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 flex space-x-1.5">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Query active dispatch..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl focus:outline-none"
            />
            <button type="submit" className="bg-brand hover:bg-brand-hover p-2 rounded-xl text-white cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
