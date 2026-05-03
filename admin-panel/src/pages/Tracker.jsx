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
  const [mapCenter, setMapCenter] = useState([16.7050, 74.2433]); // Default center (Kolhapur)

  // Helper to inject coordinates if missing (Deterministic based on ID + Landmark Recognition)
  const injectCoordinates = (list) => {
    // Local Landmark Cache for high accuracy when GPS is missing
    const landmarks = [
      { key: 'TERMINUS', lat: 16.6974, lng: 74.2427 },
      { key: 'SHAHU', lat: 16.6974, lng: 74.2427 },
      { key: 'SHIVAJI PARK', lat: 16.7025, lng: 74.2380 },
      { key: 'TARABAI', lat: 16.7055, lng: 74.2480 },
      { key: 'LIC COLONY', lat: 16.7110, lng: 74.2580 },
      { key: 'RUIKAR', lat: 16.7145, lng: 74.2520 },
      { key: 'KALAMBA', lat: 16.6667, lng: 74.2333 },
      { key: 'RANKALA', lat: 16.6950, lng: 74.2150 },
      { key: 'CENTRAL', lat: 16.7050, lng: 74.2433 }
    ];

    return list.map(worker => {
      // 1. If we have real GPS, use it exactly
      if (worker.location?.latitude && worker.location?.longitude && !worker.location.isFake) {
        return worker;
      }

      // 2. If missing GPS but has a Kolhapur address, find the best Landmark
      if (worker.location?.address && worker.location.address.toUpperCase().includes('KOLHAPUR')) {
        const address = worker.location.address.toUpperCase();
        
        // Find if the address contains any known landmarks
        const landmark = landmarks.find(l => address.includes(l.key)) || landmarks[landmarks.length - 1];
        
        // Use the ID to generate a tiny consistent offset around that landmark (so they don't stack)
        const idHash = worker._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const offsetLat = ((idHash % 100) / 10000) - 0.005;
        const offsetLon = (((idHash * 13) % 100) / 10000) - 0.005;
        
        return {
          ...worker,
          location: {
            ...worker.location,
            latitude: landmark.lat + offsetLat,
            longitude: landmark.lng + offsetLon,
            isFake: true 
          }
        };
      }
      return worker;
    });
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const initTracker = async () => {
      try {
        const response = await api.get('/workers');
        const officialWorkers = injectCoordinates(response.data.data || []);
        const workerIds = officialWorkers.map(w => w._id);

        setProviders(officialWorkers);
        if (officialWorkers.length > 0 && !selectedNode) {
          setSelectedNode(officialWorkers[0]);
        }

        unsubscribe = onSnapshot(collection(db, "workers"), (snapshot) => {
          const firestoreData = snapshot.docs
            .map(doc => ({ _id: doc.id, ...doc.data() }));

          setProviders(prev => {
            const updated = prev.map(p => {
              const update = firestoreData.find(f => f._id === p._id);
              return update ? { ...p, ...update } : p;
            });
            return injectCoordinates(updated); // Re-inject if real-time update is missing GPS
          });
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

  // Keep selectedNode in sync with real-time updates from the providers list
  useEffect(() => {
    if (selectedNode) {
      const updated = providers.find(p => p._id === selectedNode._id);
      if (updated && (updated.location?.latitude !== selectedNode.location?.latitude || updated.isOnline !== selectedNode.isOnline)) {
        setSelectedNode(updated);
      }
    }
  }, [providers]);

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

                {providers.map((p) => {
                  const hasLat = p.location?.latitude !== undefined && p.location?.latitude !== null;
                  const hasLng = p.location?.longitude !== undefined && p.location?.longitude !== null;
                  
                  if (!hasLat || !hasLng) return null;

                  return (
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
                  );
                })}
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
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${selectedNode.location?.isFake ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {selectedNode.location?.isFake ? 'Address Based' : 'Live GPS'}
                          </span>
                          <MapPin size={14} className="text-accent-red" />
                        </div>
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
