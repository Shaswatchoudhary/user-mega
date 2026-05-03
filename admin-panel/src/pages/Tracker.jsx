import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Search,
  Globe,
  Radio,
  Phone,
  MessageSquare,
  Maximize2
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Tracker = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default center (Mumbai)

  useEffect(() => {
    let unsubscribe = () => {};

    const initTracker = async () => {
      try {
        // 1. Fetch official workers from MongoDB
        const response = await api.get('/workers');
        const officialWorkers = response.data.data || [];
        const workerIds = officialWorkers.map(w => w._id);

        // 2. Initial state from MongoDB
        setProviders(officialWorkers);
        if (officialWorkers.length > 0 && !selectedNode) {
          setSelectedNode(officialWorkers[0]);
        }

        // 3. Subscribe to Firestore for real-time updates for these specific workers
        unsubscribe = onSnapshot(collection(db, "workers"), (snapshot) => {
          const firestoreData = snapshot.docs
            .map(doc => ({ _id: doc.id, ...doc.data() }))
            .filter(doc => workerIds.includes(doc._id)); // Filter only official workers

          setProviders(prev => prev.map(p => {
            const update = firestoreData.find(f => f._id === p._id);
            return update ? { ...p, ...update } : p;
          }));
        });

      } catch (error) {
        console.error('Error initializing tracker:', error);
      } finally {
        setLoading(false);
      }
    };

    initTracker();
    return () => unsubscribe();
  }, []);

  // Component to re-center map when selectedNode changes
  const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 13);
      }
    }, [center]);
    return null;
  };

  // Geocoding effect: Find coordinates if only an address is available
  useEffect(() => {
    const geocodeWorker = async (worker) => {
      if (worker.location?.address && (!worker.location?.latitude || !worker.location?.longitude)) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(worker.location.address)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const updatedWorker = {
              ...worker,
              location: {
                ...worker.location,
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
              }
            };
            setProviders(prev => prev.map(p => p._id === worker._id ? updatedWorker : p));
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
    };

    providers.forEach(p => geocodeWorker(p));
  }, [providers.length]); // Only run when the list changes

  // Keep selectedNode in sync with real-time updates from the providers list
  useEffect(() => {
    if (selectedNode) {
      const updated = providers.find(p => p._id === selectedNode._id);
      if (updated && (updated.location?.latitude !== selectedNode.location?.latitude || updated.isOnline !== selectedNode.isOnline)) {
        setSelectedNode(updated);
      }
    }
  }, [providers, selectedNode]);

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Live Service Monitoring // Global Fleet</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            Field <span className="text-accent-red italic">Tracker</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Real-time visualization of service provider locations via Leaflet GIS integration.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-accent-red/5 border border-accent-red/10 px-4 py-2 rounded-xl flex items-center space-x-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse-red"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">Active Providers: {providers.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
           <div className="relative bg-reddish-950 border border-white/5 rounded-[3rem] overflow-hidden h-[600px] shadow-premium group z-10">
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {selectedNode?.location?.latitude && (
                  <ChangeView center={[selectedNode.location.latitude, selectedNode.location.longitude]} />
                )}

                {providers.map((p) => (
                  p.location?.latitude && (
                    <Marker 
                      key={p._id} 
                      position={[p.location.latitude, p.location.longitude]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="w-10 h-10 bg-reddish-900 border-2 ${p._id === selectedNode?._id ? 'border-accent-red scale-110 shadow-red-glow' : 'border-white/20'} rounded-2xl flex items-center justify-center text-white font-black text-[10px] uppercase overflow-hidden shadow-xl transition-all">
                                ${p.profileImage ? `<img src="${p.profileImage}" class="w-full h-full object-cover"/>` : p.fullName.charAt(0)}
                                ${p.isOnline ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full border-2 border-white animate-pulse"></div>' : ''}
                              </div>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                      })}
                      eventHandlers={{
                        click: () => setSelectedNode(p),
                      }}
                    >
                      <Popup>
                        <div className="text-center p-1">
                          <p className="text-xs font-black uppercase mb-1">{p.fullName}</p>
                          <p className="text-[10px] text-accent-red font-bold">{p.category || 'Professional'}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>

              <div className="absolute bottom-8 right-8 flex flex-col space-y-3 z-[1000]">
                 <button className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-accent-red shadow-premium transition-all"><Maximize2 size={20}/></button>
                 <button className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-accent-red shadow-premium transition-all"><Globe size={20}/></button>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {selectedNode && (
             <div className="card !p-10 border border-border bg-white rounded-3xl animate-in slide-in-from-right-10 shadow-premium">
                <div className="flex items-center space-x-6 mb-10 pb-10 border-b border-border">
                   <Avatar src={selectedNode.profileImage} initials={selectedNode.fullName} size="xl" ringColor="ring-accent-red/20" />
                   <div>
                      <h4 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none font-outfit">{selectedNode.fullName}</h4>
                      <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.2em] mt-2">{selectedNode.category || 'Professional'}</p>
                      <div className="flex items-center space-x-2 mt-4">
                         <span className={`w-2 h-2 rounded-full ${selectedNode.isOnline ? 'bg-accent-red animate-pulse-red' : 'bg-text-muted'}`}></span>
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{selectedNode.isOnline ? 'Verified Connection' : 'Standard Status'}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="p-6 bg-surface-light rounded-3xl border border-border transition-all hover:border-accent-red/20">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Live Location Registry</p>
                        <MapPin size={16} className="text-accent-red" />
                      </div>
                      <p className="text-xs font-black text-text-primary uppercase leading-relaxed break-words">
                        {selectedNode.location?.address || 
                         (selectedNode.location?.latitude ? `${selectedNode.location.latitude.toFixed(6)}, ${selectedNode.location.longitude.toFixed(6)}` : 'Location Syncing...')}
                      </p>
                      {(!selectedNode.location?.latitude && !selectedNode.location?.address) && (
                        <div className="mt-3 flex items-center space-x-2 bg-accent-red/5 p-2 rounded-lg border border-accent-red/10">
                          <div className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse"></div>
                          <p className="text-[9px] font-black text-accent-red uppercase">Awaiting GPS Handshake</p>
                        </div>
                      )}
                   </div>
                   <div className="p-5 bg-surface-light rounded-2xl border border-border flex justify-between items-center">
                      <div>
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Connection Signal</p>
                         <p className="text-xs font-black text-accent-red uppercase">Verified - Hub Node</p>
                      </div>
                      <Activity size={18} className="text-accent-red" />
                   </div>
                   <div className="p-5 bg-surface-light rounded-2xl border border-border flex justify-between items-center">
                      <div>
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Fleet Territory</p>
                         <p className="text-xs font-black text-text-primary uppercase">Alpha District</p>
                      </div>
                      <Navigation size={18} className="text-text-muted" />
                   </div>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 btn-primary !bg-accent-red !py-4 flex items-center justify-center shadow-red-glow transition-all active:scale-95">
                      <Phone size={16} className="mr-2" />
                      Contact
                   </button>
                   <button className="w-14 h-14 bg-surface-light border border-border rounded-2xl flex items-center justify-center text-text-primary hover:bg-reddish-900 hover:text-white hover:border-reddish-900 transition-all">
                      <MessageSquare size={20} />
                   </button>
                </div>
             </div>
           )}

            <div className="card !p-8 border border-border bg-white rounded-3xl">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
                 <Radio size={14} className="mr-2 text-accent-red" /> active Fleet
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {providers.map(p => (
                   <div 
                    key={p._id} 
                    onClick={() => {
                      setSelectedNode(p);
                      if (p.location?.latitude) {
                        setMapCenter([p.location.latitude, p.location.longitude]);
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedNode?._id === p._id ? 'bg-reddish-900 text-white shadow-premium border-reddish-900' : 'bg-white border-border hover:bg-surface-light'}`}
                   >
                      <div className="flex items-center space-x-3">
                         <Avatar src={p.profileImage} initials={p.fullName} size="sm" />
                         <span className={`text-[10px] font-black uppercase tracking-tight ${selectedNode?._id === p._id ? 'text-white' : 'text-text-primary'}`}>{p.fullName}</span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isOnline ? 'bg-accent-red shadow-red-glow' : 'bg-text-muted opacity-50'}`}></span>
                   </div>
                 ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
