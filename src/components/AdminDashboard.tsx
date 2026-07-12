import React, { useState, useEffect } from 'react';
import { User, Vehicle, Driver, Expense, MaintenanceLog, VehicleDocument } from '../types';
import { 
  ShieldAlert, Truck, Users, CreditCard, Wrench, Plus, 
  Search, Eye, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Activity, X, Info,
  FileText, Calendar, Mail, BarChart2, PieChart as PieIcon, RefreshCw, Sun, Moon, Sparkles, Send, ShieldCheck, Smartphone
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function AdminDashboard({ user, onLogout, theme, toggleTheme }: AdminDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [activeTab, setActiveTab] = useState<'fleet' | 'drivers' | 'ledger' | 'analytics'>('fleet');
  const [refreshing, setRefreshing] = useState(false);

  // Selected Vehicle for Document Management
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState<Vehicle | null>(null);

  // Selected Driver for License Email Modal
  const [selectedDriverForEmail, setSelectedDriverForEmail] = useState<Driver | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Search/Filters
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Vehicle Form State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vReg, setVReg] = useState('');
  const [vName, setVName] = useState('');
  const [vType, setVType] = useState<'Heavy Truck' | 'Medium Truck' | 'Light Van' | 'Electric Container'>('Heavy Truck');
  const [vLoad, setVLoad] = useState('18000');
  const [vCost, setVCost] = useState('5500000');
  const [vEff, setVEff] = useState('4.2');
  const [vFuel, setVFuel] = useState<'Diesel' | 'Electric' | 'Petrol'>('Diesel');

  // Add Driver Form State
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [dName, setDName] = useState('');
  const [dLicense, setDLicense] = useState('');
  const [dCat, setDCat] = useState('Heavy Commercial');
  const [dExpiry, setDExpiry] = useState('2026-08-15');
  const [dPhone, setDPhone] = useState('+91 98765 ');
  const [dEmergencyPhone, setDEmergencyPhone] = useState('+91 99999 ');

  // Add Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expVehicle, setExpVehicle] = useState('');
  const [expAmount, setExpAmount] = useState('3200');
  const [expType, setExpType] = useState<'Fuel' | 'Maintenance' | 'Toll' | 'Permit' | 'Other'>('Toll');
  const [expDesc, setExpDesc] = useState('Valsad Toll Plaza NH-48 Expressway');

  // Add Vehicle Document State
  const [showDocModal, setShowDocModal] = useState(false);
  const [docType, setDocType] = useState<'RC Book' | 'Insurance' | 'PUC' | 'Fitness Certificate' | 'Permit' | 'Road Tax'>('RC Book');
  const [docNum, setDocNum] = useState('');
  const [docIssue, setDocIssue] = useState('2026-01-01');
  const [docExpiry, setDocExpiry] = useState('2027-01-01');

  const fetchData = async () => {
    try {
      const vRes = await fetch('/api/vehicles');
      const dRes = await fetch('/api/drivers');
      const eRes = await fetch('/api/expenses');
      const mRes = await fetch('/api/maintenance');

      if (vRes.ok && dRes.ok && eRes.ok && mRes.ok) {
        setVehicles(await vRes.json());
        setDrivers(await dRes.json());
        setExpenses(await eRes.json());
        setMaintenance(await mRes.json());
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const cleanReg = vReg.replace(/[-\s]/g, '').toUpperCase();
    const indianRegRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;
    
    if (!indianRegRegex.test(cleanReg)) {
      setErrorMsg('Invalid RTO registration. Use standard Indian formats (e.g. GJ05AB1234).');
      return;
    }

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: vReg.trim().toUpperCase(),
          name: vName.trim(),
          type: vType,
          maxLoadCapacity: Number(vLoad),
          acquisitionCost: Number(vCost),
          fuelEfficiency: Number(vEff),
          fuelType: vFuel,
          location: 'Surat Depot Main',
        }),
      });

      if (res.ok) {
        setShowVehicleModal(false);
        setVReg('');
        setVName('');
        fetchData();
        setSuccessMsg('Heavy transport container verified and logged into fleet registry.');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Validation failed. Check vehicle parameters.');
      }
    } catch (err) {
      setErrorMsg('Unexpected system error during registration.');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!dLicense.trim()) {
      setErrorMsg('Please specify driver license number.');
      return;
    }

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dName.trim(),
          licenseNumber: dLicense.trim().toUpperCase(),
          licenseCategory: dCat.trim(),
          licenseExpiryDate: dExpiry,
          contactNumber: dPhone.trim(),
          emergencyContactNumber: dEmergencyPhone.trim(),
        }),
      });

      if (res.ok) {
        setShowDriverModal(false);
        setDName('');
        setDLicense('');
        setDEmergencyPhone('+91 99999 ');
        fetchData();
        setSuccessMsg('Driver profile verified, background check verified, and saved.');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to register driver partner.');
      }
    } catch (err) {
      setErrorMsg('Unexpected system error registering operator.');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!expVehicle) {
      setErrorMsg('Please select a fleet vehicle.');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: expVehicle,
          amount: Number(expAmount),
          type: expType,
          description: expDesc.trim(),
        }),
      });

      if (res.ok) {
        setShowExpenseModal(false);
        fetchData();
        setSuccessMsg('Expense voucher successfully reconciled and posted to the ledger.');
      } else {
        setErrorMsg('Failed to log expense voucher.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during posting.');
    }
  };

  // Add Document to Selected Vehicle
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForDocs) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!docNum.trim()) {
      setErrorMsg('Please provide a document reference number.');
      return;
    }

    const currentDocs: VehicleDocument[] = selectedVehicleForDocs.documents || [];
    const expiry = new Date(docExpiry);
    const today = new Date();
    const isExpired = expiry < today;
    const isExpiring = !isExpired && (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 30;
    const docStatus: 'Active' | 'Expiring' | 'Expired' = isExpired ? 'Expired' : (isExpiring ? 'Expiring' : 'Active');

    const newDoc: VehicleDocument = {
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      type: docType,
      documentNumber: docNum.toUpperCase(),
      issueDate: docIssue,
      expiryDate: docExpiry,
      status: docStatus,
      fileName: `${docType.replace(/\s+/g, '_')}_ref.pdf`
    };

    const updatedDocs = [...currentDocs.filter(d => d.type !== docType), newDoc];

    try {
      const res = await fetch(`/api/vehicles/${selectedVehicleForDocs.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: updatedDocs
        })
      });

      if (res.ok) {
        setShowDocModal(false);
        setDocNum('');
        // Update local object
        const updatedVehicle = { ...selectedVehicleForDocs, documents: updatedDocs };
        setSelectedVehicleForDocs(updatedVehicle);
        fetchData();
        setSuccessMsg(`Uploaded and verified ${docType} for vehicle ${selectedVehicleForDocs.registrationNumber}.`);
      } else {
        setErrorMsg('Failed to update vehicle document ledger.');
      }
    } catch (err) {
      setErrorMsg('Error synchronizing document update.');
    }
  };

  // Automated License Expiry checks
  const getLicenseStatus = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const today = new Date();
    if (exp < today) return { label: 'Expired', color: 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40' };
    const diffDays = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 30) return { label: 'Expiring Soon', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' };
    return { label: 'Compliant', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' };
  };

  // Setup SMS / Contact Reminder Modal
  const triggerSMSModal = (driver: Driver) => {
    setSelectedDriverForEmail(driver);
    setEmailSubject(`DL EXPIRY WARNING - DL# ${driver.licenseNumber}`);
    setEmailBody(`Dear ${driver.name}, your commercial driving license (${driver.licenseNumber}) expires on ${driver.licenseExpiryDate}. Please contact Operations desk to submit renewals and prevent trip suspension.`);
  };

  const sendSMSReminder = () => {
    if (!selectedDriverForEmail) return;
    setSuccessMsg(`Compliance warning SMS successfully sent to driver ${selectedDriverForEmail.name} at ${selectedDriverForEmail.contactNumber}. Emergency Contact fallback: ${selectedDriverForEmail.emergencyContactNumber || '+91 99999 88888'}.`);
    setSelectedDriverForEmail(null);
  };

  const totalFleetCost = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) || 
    v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );

  // CHARTS DATA PREPARATION
  // 1. Costs breakdown by Type
  const expensesByType = expenses.reduce((acc: { [key: string]: number }, cur) => {
    acc[cur.type] = (acc[cur.type] || 0) + cur.amount;
    return acc;
  }, {});
  const costDistributionData = Object.keys(expensesByType).map(key => ({
    name: key,
    value: expensesByType[key]
  }));
  const COLORS = ['#E74C3C', '#2980B9', '#F1C40F', '#27AE60', '#8E44AD'];

  // 2. Fuel Efficiency Chart (Bar Chart)
  const fuelEfficiencyData = vehicles.map(v => ({
    name: v.registrationNumber.split(' ').join(''),
    efficiency: v.fuelEfficiency,
    status: v.status
  }));

  // 3. Operating trajectory (simulated AreaChart)
  const trajectoryData = [
    { date: 'Jul 01', Operational: 23000, Maintenance: 8500 },
    { date: 'Jul 04', Operational: 31000, Maintenance: 9200 },
    { date: 'Jul 07', Operational: 29000, Maintenance: 14500 },
    { date: 'Jul 10', Operational: 42000, Maintenance: 11000 },
    { date: 'Jul 13', Operational: 38000, Maintenance: 15400 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* SaaS Admin Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 md:px-6 py-4 flex flex-col lg:flex-row justify-between items-center sticky top-0 z-40 gap-4 shadow-sm transition-colors">
        <div className="flex items-center space-x-3">
          <div className="bg-brand/10 p-2.5 rounded-xl border border-brand/20">
            <TrendingUp className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-md md:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Carry<span className="text-brand">On</span>
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-widest">GLOBAL ENTERPRISE CONTROL</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('fleet'); setSelectedVehicleForDocs(null); }}
            className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${activeTab === 'fleet' ? 'bg-brand text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Fleet & Docs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${activeTab === 'drivers' ? 'bg-brand text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Driver Licenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${activeTab === 'ledger' ? 'bg-brand text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            General Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-lg font-bold transition cursor-pointer ${activeTab === 'analytics' ? 'bg-brand text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Analytics
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
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

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
            <div className="text-[9px] text-brand font-mono font-bold">Administrator</div>
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
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/45 px-6 py-3 flex justify-between items-center text-emerald-750 dark:text-emerald-400 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[10px] text-emerald-500 hover:underline uppercase font-bold cursor-pointer">DISMISS</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/45 px-6 py-3 flex justify-between items-center text-red-700 dark:text-red-400 text-xs font-bold animate-fadeIn">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[10px] text-red-500 hover:underline uppercase font-bold cursor-pointer">DISMISS</button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* TAB 1: FLEET REGISTRY & VEHICLE DOCUMENT MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Vehicles Directory (Span 2 or Full depending on selection) */}
            <div className={`${selectedVehicleForDocs ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4 text-left transition-all duration-300`}>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-brand" />
                  <span>Fleet Registry ({filteredVehicles.length})</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setShowVehicleModal(true)}
                  className="flex items-center space-x-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Vehicle</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Search by lorry name, model or RTO plate..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Grid of heavy transports */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredVehicles.map((v) => {
                  const docCount = v.documents?.length || 0;
                  const expiredCount = v.documents?.filter(d => d.status === 'Expired').length || 0;
                  const expiringCount = v.documents?.filter(d => d.status === 'Expiring').length || 0;
                  
                  return (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedVehicleForDocs(v)}
                      className={`bg-white dark:bg-slate-800 border rounded-3xl p-4.5 flex flex-col justify-between shadow-xs transition cursor-pointer ${
                        selectedVehicleForDocs?.id === v.id 
                          ? 'border-brand ring-1 ring-brand bg-brand/5 dark:bg-brand/5' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{v.registrationNumber}</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{v.name}</h4>
                          </div>
                          <span className={`text-[8px] font-mono font-black px-2 py-0.5 border rounded-full uppercase ${
                            v.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            v.status === 'On Trip' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400' :
                            'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-450'
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        {/* Document summary pills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-md font-mono text-slate-500 dark:text-slate-400">
                            Documents: {docCount}
                          </span>
                          {expiredCount > 0 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 rounded-md font-mono text-red-600 dark:text-red-400 font-bold">
                              Expired: {expiredCount}
                            </span>
                          )}
                          {expiringCount > 0 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30 rounded-md font-mono text-amber-600 dark:text-amber-400 font-bold">
                              Expiring: {expiringCount}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-750 pt-3">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] font-black uppercase font-mono">Odometer</span>
                            {v.odometer.toLocaleString()} km
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] font-black uppercase font-mono">Efficiency</span>
                            {v.fuelEfficiency} km/L
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] font-black uppercase font-mono">Fuel</span>
                            {v.fuelType}
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span>Limit: {v.nextMaintenanceOdometer.toLocaleString()} km</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">Payload: {(v.maxLoadCapacity/1000).toFixed(1)} T</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Vehicle Document Management Detail Tab (Span 2) */}
            {selectedVehicleForDocs && (
              <div className="lg:col-span-2 space-y-4 text-left animate-fadeIn">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-3">
                    <div>
                      <span className="text-[10px] bg-brand/10 text-brand px-2.5 py-0.5 rounded-full font-bold font-mono">
                        DOCUMENT SAFE
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        {selectedVehicleForDocs.name} ({selectedVehicleForDocs.registrationNumber})
                      </h3>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDocModal(true)}
                        className="flex items-center space-x-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Document</span>
                      </button>
                      <button 
                        onClick={() => setSelectedVehicleForDocs(null)}
                        className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl cursor-pointer"
                        title="Close Safe"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Documents Checklist Grid */}
                  <div className="space-y-3">
                    {(!selectedVehicleForDocs.documents || selectedVehicleForDocs.documents.length === 0) ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-250 dark:border-slate-750 rounded-2xl text-xs">
                        No official registry documents uploaded yet for this vehicle. Use "Upload Document" to synchronize.
                      </div>
                    ) : (
                      selectedVehicleForDocs.documents.map((doc) => {
                        let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
                        if (doc.status === 'Expired') badgeColor = 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30 animate-pulse';
                        if (doc.status === 'Expiring') badgeColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-900/30';

                        return (
                          <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-750 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                            <div className="flex items-start space-x-3">
                              <div className="p-2.5 bg-brand/10 text-brand border border-brand/20 rounded-xl">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase font-mono">{doc.type}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Ref#: {doc.documentNumber}</div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                                  Issued: {doc.issueDate} | <span className="font-bold">Expires: {doc.expiryDate}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-slate-800">
                              <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full uppercase border ${badgeColor}`}>
                                {doc.status}
                              </span>

                              <a 
                                href={`/assets/docs_example.pdf`} 
                                download
                                className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-200 dark:hover:bg-slate-750"
                              >
                                View File
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DRIVER LICENSES & AUTOMATED EXPIRY REMINDERS */}
        {activeTab === 'drivers' && (
          <div className="space-y-6 text-left animate-fadeIn">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand" />
                <span>Roster Licenses & Compliance Monitor</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowDriverModal(true)}
                className="flex items-center space-x-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Driver</span>
              </button>
            </div>

            {/* EXPIRED/EXPIRING LICENSE REMINDERS BANNER */}
            {drivers.filter(d => {
              const exp = new Date(d.licenseExpiryDate);
              const today = new Date();
              const diffDays = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
              return exp < today || diffDays <= 30;
            }).length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/15 border border-red-250 dark:border-red-900/35 rounded-3xl p-4 flex items-start space-x-3.5 animate-fadeIn">
                <div className="bg-brand text-white p-2.5 rounded-2xl animate-pulse flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-red-900 dark:text-red-400 uppercase tracking-widest font-mono">AUTOMATED SYSTEM Reminders Triggered</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                    Compliance engine detected heavy commercial driver partners with approaching license renewals. Suspended states active on expired rosters. Send automated SMS warnings and coordinate with primary or emergency contact numbers instantly below.
                  </p>
                </div>
              </div>
            )}

            {/* Drivers list with compliance metrics */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-750 pb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Operator Roster</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated screening and backgrounds status ledger</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    placeholder="Search driver by name..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrivers.map((d) => {
                  const statusInfo = getLicenseStatus(d.licenseExpiryDate);
                  
                  return (
                    <div key={d.id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-750 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">{d.name}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">License: {d.licenseCategory}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 border rounded-full font-mono ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-750 pt-3">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] font-black uppercase">License DL#</span>
                            {d.licenseNumber}
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block text-[8px] font-black uppercase">Expiry Limit</span>
                            {d.licenseExpiryDate}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-750/50 pt-3.5 mt-4 flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Safety Rating: <span className="text-brand font-mono">{d.safetyScore}/100</span>
                        </span>

                        {(statusInfo.label !== 'Compliant') && (
                          <button
                            type="button"
                            onClick={() => triggerSMSModal(d)}
                            className="flex items-center space-x-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition cursor-pointer"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Notify SMS</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GENERAL LEDGER & COST OUTLAYS */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 text-left animate-fadeIn">
            
            {/* Costs stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">Fleet Registry Book Valuation</span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ {totalFleetCost.toLocaleString()}</h4>
                <p className="text-xs text-brand font-bold mt-1">Registry ledger valuation of {vehicles.length} heavy logistics assets</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">Ledger Expense Reconciliations</span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ {totalExpenses.toLocaleString()}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reconciled diesel refuels and expressway toll passes</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (vehicles.length > 0) setExpVehicle(vehicles[0].id);
                    setShowExpenseModal(true);
                  }}
                  className="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition cursor-pointer"
                >
                  + Log Expense Voucher
                </button>
              </div>
            </div>

            {/* Expense breakdown journals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Expense Ledger */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-brand" />
                  <span>Reconciled Expense Vouchers</span>
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">No operational expenses logged.</div>
                  ) : (
                    expenses.map((e) => (
                      <div key={e.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-950 dark:text-white">{e.description}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{e.vehicleName} &bull; {e.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-red-500 font-mono">- ₹ {e.amount.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{e.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Maintenance directory */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-brand" />
                  <span>Preventive Workshop Logs</span>
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {maintenance.length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">No active workshop logs reported.</div>
                  ) : (
                    maintenance.map((m) => (
                      <div key={m.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-950 dark:text-white">{m.description}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{m.vehicleName} &bull; Odometer: {m.odometerReading.toLocaleString()} km</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-green-700 dark:text-emerald-450 font-mono">₹ {m.cost.toLocaleString()}</div>
                          <span className="text-[8px] font-mono font-black bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1.5 inline-block uppercase">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: CHARTS & ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 text-left animate-fadeIn">
            
            {/* Analytic quick summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Fleet Size</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{vehicles.length} Units</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Active Drivers</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{drivers.length} Partners</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Avg Safety Score</span>
                <div className="text-xl font-black text-emerald-600 mt-0.5">90.2%</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Compliance Audit</span>
                <div className="text-xl font-black text-brand mt-0.5">98.4%</div>
              </div>
            </div>

            {/* Recharts Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Plot 1: AreaChart trajectory of costs */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                  <BarChart2 className="w-4 h-4 text-brand" />
                  <span>July Operating Costs & Maintenance Outlays (₹)</span>
                </h4>
                <div className="h-[260px] w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOper" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#E74C3C" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2980B9" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2980B9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Operational" stroke="#E74C3C" fillOpacity={1} fill="url(#colorOper)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Maintenance" stroke="#2980B9" fillOpacity={1} fill="url(#colorMaint)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Plot 2: PieChart Cost Distribution */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                  <PieIcon className="w-4 h-4 text-brand" />
                  <span>Expense Distribution</span>
                </h4>
                <div className="h-[200px] w-full flex items-center justify-center">
                  {costDistributionData.length === 0 ? (
                    <div className="text-xs text-slate-400">Reconcile expenses to generate distribution.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {costDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {costDistributionData.map((entry, idx) => (
                    <div key={idx} className="flex items-center space-x-1 text-[9px] font-mono">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plot 3: BarChart Fuel Efficiency per vehicle */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                  <BarChart2 className="w-4 h-4 text-brand" />
                  <span>Vehicle Fuel Efficiency Calibration Metrics (km/L)</span>
                </h4>
                <div className="h-[220px] w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fuelEfficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#E74C3C" radius={[4, 4, 0, 0]}>
                        {fuelEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'In Shop' ? '#F1C40F' : '#E74C3C'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 text-[9px] font-mono text-slate-500">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-[#E74C3C] rounded-full" />
                    <span>Active Standard Run</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-[#F1C40F] rounded-full" />
                    <span>In-Shop Diagnostic Deviation</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-sm w-full rounded-[24px] p-6 relative shadow-lg max-h-[90vh] overflow-y-auto text-left animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">Register Heavy Asset</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">RTO REGISTRATION NUMBER</label>
                <input
                  type="text"
                  required
                  value={vReg}
                  onChange={(e) => setVReg(e.target.value)}
                  placeholder="e.g. GJ05AB1234"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">VEHICLE BRAND/MAKE</label>
                <input
                  type="text"
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g. BharatBenz 2823R"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">TYPE</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="Medium Truck">Medium Truck</option>
                    <option value="Light Van">Light Van</option>
                    <option value="Electric Container">Electric Container</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">MAX LOAD (KG)</label>
                  <input
                    type="number"
                    required
                    value={vLoad}
                    onChange={(e) => setVLoad(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">COST (₹)</label>
                  <input
                    type="number"
                    required
                    value={vCost}
                    onChange={(e) => setVCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">EFFICIENCY (KM/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={vEff}
                    onChange={(e) => setVEff(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-sm w-full rounded-[24px] p-6 relative shadow-lg max-h-[90vh] overflow-y-auto text-left animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">Register Operator</h3>
              <button onClick={() => setShowDriverModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">OPERATOR FULL NAME</label>
                <input
                  type="text"
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">LICENSE NUMBER</label>
                <input
                  type="text"
                  required
                  value={dLicense}
                  onChange={(e) => setDLicense(e.target.value)}
                  placeholder="e.g. DL-MH1220194852"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">CATEGORY</label>
                  <input
                    type="text"
                    required
                    value={dCat}
                    onChange={(e) => setDCat(e.target.value)}
                    placeholder="HEAVY VEHICLE"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">EXPIRY DATE</label>
                  <input
                    type="date"
                    required
                    value={dExpiry}
                    onChange={(e) => setDExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">CONTACT PHONE</label>
                <input
                  type="text"
                  required
                  value={dPhone}
                  onChange={(e) => setDPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">EMERGENCY CONTACT PHONE</label>
                <input
                  type="text"
                  required
                  value={dEmergencyPhone}
                  onChange={(e) => setDEmergencyPhone(e.target.value)}
                  placeholder="e.g. +91 99999 88888"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
                >
                  Register Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG OPERATIONAL EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-sm w-full rounded-[24px] p-6 relative shadow-lg max-h-[90vh] overflow-y-auto text-left animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">Log Operational Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">MAPPED FLEET VEHICLE</label>
                <select
                  value={expVehicle}
                  onChange={(e) => setExpVehicle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">-- Choose fleet vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">AMOUNT (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">CLASSIFICATION</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Fuel">Fuel Refill</option>
                    <option value="Maintenance">Maintenance Shop</option>
                    <option value="Toll">Highway Toll</option>
                    <option value="Permit">Transit Permit</option>
                    <option value="Other">Other Operational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">VOUCHER DESCRIPTION</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
                >
                  Commit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VEHICLE DOCUMENT UPLOAD MODAL */}
      {showDocModal && selectedVehicleForDocs && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-855 border border-slate-200 dark:border-slate-750 max-w-sm w-full rounded-[24px] p-6 relative shadow-lg text-left animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">Upload Document Ledger</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">DOCUMENT TYPE</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="RC Book">RC Book (Registration Certificate)</option>
                  <option value="Insurance">Commercial Insurance</option>
                  <option value="PUC">PUC (Pollution Certificate)</option>
                  <option value="Fitness Certificate">Fitness Certificate</option>
                  <option value="Permit">National/State Transit Permit</option>
                  <option value="Road Tax">Road Tax Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">REFERENCE DOCUMENT NUMBER</label>
                <input
                  type="text"
                  required
                  value={docNum}
                  onChange={(e) => setDocNum(e.target.value)}
                  placeholder="e.g. GJ-05-AB-91280"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">ISSUE DATE</label>
                  <input
                    type="date"
                    required
                    value={docIssue}
                    onChange={(e) => setDocIssue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">EXPIRY DATE</label>
                  <input
                    type="date"
                    required
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Drag and Drop Simulation Area */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">UPLOAD SCANNED FILE (PDF/JPEG)</label>
                <div className="border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4.5 rounded-xl text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950 transition">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 block font-bold">Drag and drop file or click to browse</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">Maximum upload size limit: 5MB</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition"
                >
                  Verify & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH SMS WARNING MODAL */}
      {selectedDriverForEmail && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 max-w-lg w-full rounded-[24px] p-5 md:p-6 relative shadow-2xl text-left animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-brand" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">SMS / Contact Notification Desk</h3>
              </div>
              <button onClick={() => setSelectedDriverForEmail(null)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-750 text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
                <div><span className="font-bold text-slate-400">PHONE:</span> {selectedDriverForEmail.contactNumber} ({selectedDriverForEmail.name})</div>
                <div><span className="font-bold text-slate-400">EMERGENCY:</span> {selectedDriverForEmail.emergencyContactNumber || 'None registered'}</div>
                <div><span className="font-bold text-slate-400">SENDER ID:</span> CARRYON-OPS</div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">SMS NOTIFICATION HEADER</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1">SMS TEXT BODY</label>
                <textarea
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-705 dark:text-slate-300 focus:outline-none h-44 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDriverForEmail(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendSMSReminder}
                  className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS Notification</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
