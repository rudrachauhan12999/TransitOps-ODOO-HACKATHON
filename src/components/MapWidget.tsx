import React, { useEffect, useRef, useState } from 'react';
import { StructuredAddress } from '../types';

interface MapWidgetProps {
  progress?: number; // 0 to 100
  source?: string;
  destination?: string;
  sourceAddress?: StructuredAddress;
  destinationAddress?: StructuredAddress;
  activeVehicleReg?: string;
}

// Custom geocoding coordinates fallback for popular Indian cities & hubs
function getCoordinates(location: string): [number, number] {
  const norm = location.toLowerCase();
  
  if (norm.includes('surat')) return [21.1702, 72.8311];
  if (norm.includes('mumbai') || norm.includes('bombay')) return [19.0760, 72.8777];
  if (norm.includes('delhi') || norm.includes('gurgaon') || norm.includes('noida')) return [28.7041, 77.1025];
  if (norm.includes('pune')) return [18.5204, 73.8567];
  if (norm.includes('jaipur')) return [26.9124, 75.7873];
  if (norm.includes('udaipur')) return [24.5854, 73.7125];
  if (norm.includes('navsari')) return [20.9467, 72.9520];
  if (norm.includes('valsad')) return [20.5992, 72.9342];
  if (norm.includes('vapi')) return [20.3893, 72.9106];
  if (norm.includes('ahmedabad')) return [23.0225, 72.5714];
  if (norm.includes('vadodara') || norm.includes('baroda')) return [22.3072, 73.1812];
  if (norm.includes('bangalore') || norm.includes('bengaluru')) return [12.9716, 77.5946];
  if (norm.includes('chennai') || norm.includes('madras')) return [13.0827, 80.2707];
  if (norm.includes('kolkata') || norm.includes('calcutta')) return [22.5726, 88.3639];
  if (norm.includes('hyderabad')) return [17.3850, 78.4867];
  
  // Deterministic fallback bounds coordinate inside India
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const lat = 16.0 + (hash % 110) / 10.0; // 16.0 to 27.0
  const lon = 72.0 + ((hash >> 3) % 90) / 10.0; // 72.0 to 81.0
  return [lat, lon];
}

async function geocodeAddress(addressStr: string): Promise<[number, number]> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}&limit=1`, {
      headers: {
        'User-Agent': 'CarryOnCentralLogisticsApp/1.0'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (err) {
    console.warn('Nominatim geocode failed, using local fallback:', err);
  }
  return getCoordinates(addressStr);
}

async function fetchOSRMRoute(start: [number, number], end: [number, number]): Promise<{ coordinates: [number, number][], distance: number, duration: number } | null> {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords = route.geometry.coordinates; // [[lon, lat], ...]
        const leafletCoords = rawCoords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        return {
          coordinates: leafletCoords,
          distance: route.distance / 1000, // in km
          duration: route.duration // in seconds
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing failed:', err);
  }
  return null;
}

function calculateStraightLine(start: [number, number], end: [number, number]) {
  const lat1 = start[0], lon1 = start[1];
  const lat2 = end[0], lon2 = end[1];
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  const duration = (distance / 50) * 3600; // assume 50 km/h average speed in seconds
  return {
    coordinates: [start, end] as [number, number][],
    distance,
    duration
  };
}

export default function MapWidget({ 
  progress = 68, 
  source = 'Surat Textile Hub', 
  destination = 'Mumbai Port Terminal 2', 
  sourceAddress,
  destinationAddress,
  activeVehicleReg = 'GJ-05-BY-1204' 
}: MapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerSourceRef = useRef<any>(null);
  const markerDestRef = useRef<any>(null);
  const markerVehicleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode state from document root
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  // Load Leaflet Assets dynamically
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = 'anonymous';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Fetch coordinates and route dynamically using OpenStreetMap Nominatim and OSRM
  useEffect(() => {
    let active = true;
    async function resolveRoute() {
      setLoadingRoute(true);

      let startQuery = source;
      if (sourceAddress && sourceAddress.line1) {
        const parts = [
          sourceAddress.line1,
          sourceAddress.line2,
          sourceAddress.area,
          sourceAddress.city,
          sourceAddress.district,
          sourceAddress.state,
          sourceAddress.pinCode
        ].filter(Boolean);
        startQuery = parts.join(', ');
      }

      let endQuery = destination;
      if (destinationAddress && destinationAddress.line1) {
        const parts = [
          destinationAddress.line1,
          destinationAddress.line2,
          destinationAddress.area,
          destinationAddress.city,
          destinationAddress.district,
          destinationAddress.state,
          destinationAddress.pinCode
        ].filter(Boolean);
        endQuery = parts.join(', ');
      }

      const start = await geocodeAddress(startQuery);
      const end = await geocodeAddress(endQuery);
      
      if (!active) return;

      const routeResult = await fetchOSRMRoute(start, end);
      if (!active) return;

      if (routeResult) {
        setRouteCoords(routeResult.coordinates);
        setRouteInfo({ distance: routeResult.distance, duration: routeResult.duration });
      } else {
        const straight = calculateStraightLine(start, end);
        setRouteCoords(straight.coordinates);
        setRouteInfo({ distance: straight.distance, duration: straight.duration });
      }
      setLoadingRoute(false);
    }

    resolveRoute();
    return () => {
      active = false;
    };
  }, [source, destination, sourceAddress, destinationAddress]);

  // Update Map layers
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || routeCoords.length === 0) return;
    const L = (window as any).L;
    if (!L) return;

    // Initialize map if not yet done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Dynamic tile mapping for Dark Mode and Light Mode
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const tileUrl = isDarkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);

    const startCoords = routeCoords[0];
    const endCoords = routeCoords[routeCoords.length - 1];

    // Calculate vehicle dynamic location along routed coordinate array
    let vehicleCoords = startCoords;
    if (routeCoords.length > 1) {
      const ratio = Math.max(0, Math.min(100, progress)) / 100;
      const targetIdx = Math.min(routeCoords.length - 1, Math.floor(ratio * (routeCoords.length - 1)));
      vehicleCoords = routeCoords[targetIdx];
    }

    const createMarkerHtml = (bgColor: string, label: string) => {
      return `<div class="flex flex-col items-center">
        <div style="background-color: ${bgColor};" class="w-4.5 h-4.5 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <div class="bg-slate-900/95 dark:bg-slate-950 text-white text-[9px] px-2 py-0.5 rounded-md mt-1 font-sans font-bold whitespace-nowrap shadow-sm border border-slate-700">
          ${label}
        </div>
      </div>`;
    };

    const startIcon = L.divIcon({
      html: createMarkerHtml('#E74C3C', source.split(',')[0].split(' ')[0]),
      className: 'custom-leaflet-marker',
      iconSize: [60, 40],
      iconAnchor: [30, 8]
    });

    const destIcon = L.divIcon({
      html: createMarkerHtml('#34495E', destination.split(',')[0].split(' ')[0]),
      className: 'custom-leaflet-marker',
      iconSize: [60, 40],
      iconAnchor: [30, 8]
    });

    const vehicleIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="relative bg-emerald-600 text-white p-1.5 rounded-full border-2 border-white shadow-md flex items-center justify-center" style="width: 28px; height: 28px;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h4M19 11h2l1 3v4h-3"></path>
            </svg>
          </div>
          <div class="absolute -top-6 bg-emerald-700 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-emerald-500 whitespace-nowrap">
            ${activeVehicleReg}
          </div>
        </div>
      `,
      className: 'custom-vehicle-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Remove old layers
    if (markerSourceRef.current) map.removeLayer(markerSourceRef.current);
    if (markerDestRef.current) map.removeLayer(markerDestRef.current);
    if (markerVehicleRef.current) map.removeLayer(markerVehicleRef.current);
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    // Create markers and routing polyline
    markerSourceRef.current = L.marker(startCoords, { icon: startIcon }).addTo(map)
      .bindPopup(`<b>Pickup Location:</b><br>${source}`);

    markerDestRef.current = L.marker(endCoords, { icon: destIcon }).addTo(map)
      .bindPopup(`<b>Destination Location:</b><br>${destination}`);

    markerVehicleRef.current = L.marker(vehicleCoords, { icon: vehicleIcon }).addTo(map)
      .bindPopup(`<b>Active Vehicle:</b> ${activeVehicleReg}<br><b>Completed:</b> ${progress}%`);

    polylineRef.current = L.polyline(routeCoords, {
      color: '#E74C3C',
      weight: 4.5,
      opacity: 0.85,
      dashArray: isDarkMode ? '4, 6' : '0' // solid road overlay in light, sleek dashed in dark
    }).addTo(map);

    // Fit View Boundaries
    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Invalidate size callback
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [leafletLoaded, routeCoords, progress, activeVehicleReg, isDarkMode]);

  // Clean up Leaflet Map completely on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-950 rounded-[20px] overflow-hidden border border-slate-200 dark:border-slate-800 relative flex flex-col transition-colors">
      {/* Dynamic Map Area */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[250px] z-10" />

      {/* Map HUD floating panel */}
      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 shadow-sm z-20 transition-all">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">LIVE HIGH-ACCURACY OSM TRACKER</span>
      </div>

      {/* Floating telemetry metrics */}
      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-left shadow-lg z-20 max-w-[260px] transition-all">
        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono tracking-wider">ROUTING TELEMETRY</div>
        
        {loadingRoute ? (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span>Geocoding routing...</span>
          </div>
        ) : routeInfo ? (
          <div className="mt-1 space-y-1 font-sans">
            <div className="text-[12px] font-bold text-slate-900 dark:text-slate-100">
              {routeInfo.distance.toFixed(1)} km <span className="text-slate-400 dark:text-slate-500">({formatDuration(routeInfo.duration)})</span>
            </div>
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 capitalize">
              {progress < 15 && 'Awaiting Dispatch'}
              {progress >= 15 && progress < 35 && `Departed pickup`}
              {progress >= 35 && progress < 70 && `En-route expressway`}
              {progress >= 70 && progress < 100 && `Approaching destination`}
              {progress >= 100 && 'Arrived & POD Verified'}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Geocoding offline fallback</div>
        )}

        <div className="mt-1.5 pt-1.5 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
          <span>Transit Progress:</span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
