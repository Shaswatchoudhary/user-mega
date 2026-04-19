import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { calculateDistance } from '../utils/locationUtils';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

// Initial worker location (nearby Kolhapur)
const INITIAL_WORKER_LOCATION = {
  latitude: 16.7050,
  longitude: 74.2433,
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  // selectedLocation structure: { addressText, latitude, longitude, name, subtitle }

  const [workerLocation, setWorkerLocation] = useState(INITIAL_WORKER_LOCATION);
  const [distance, setDistance] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'on_the_way', 'arrived', null
  const simulationIntervalRef = useRef(null);
  const arrivalTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  // Location logic without persistence
  useEffect(() => {
    return () => {
      stopSimulation();
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const saveLocation = async (location) => {
    try {
      // Ensure the location object is standardized
      const standardized = {
        addressText: location.addressText || location.address || '',
        latitude: location.latitude || location.coords?.latitude,
        longitude: location.longitude || location.coords?.longitude,
        name: location.name || '',
        subtitle: location.subtitle || ''
      };

      setSelectedLocation(standardized);
    } catch (e) {
      console.error('Error saving location:', e);
    }
  };

  // Distance calculation whenever locations change
  useEffect(() => {
    if (selectedLocation && workerLocation) {
      const { latitude, longitude } = selectedLocation;

      if (latitude && longitude) {
        const d = calculateDistance(
          workerLocation.latitude,
          workerLocation.longitude,
          latitude,
          longitude
        );
        setDistance(d);
      }
    }
  }, [selectedLocation, workerLocation]);

  // Simulation Logic
  const startSimulation = () => {
    if (simulationIntervalRef.current) return;

    setIsSimulating(true);
    setHasActiveBooking(true);
    setBookingStatus('on_the_way');

    // Movement Simulation
    simulationIntervalRef.current = setInterval(() => {
      setWorkerLocation(prev => {
        if (!selectedLocation) return prev;

        const { latitude: destLat, longitude: destLng } = selectedLocation;

        if (!destLat) return prev;

        const latDiff = destLat - prev.latitude;
        const lngDiff = destLng - prev.longitude;

        // Stop if close enough
        if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
          return prev;
        }

        const step = 0.0005;
        return {
          latitude: prev.latitude + (latDiff > 0 ? step : -step),
          longitude: prev.longitude + (lngDiff > 0 ? step : -step),
        };
      });
    }, 8000);

    // Demo Lifecycle Timers
    arrivalTimerRef.current = setTimeout(() => {
      setBookingStatus('arrived');
      resetTimerRef.current = setTimeout(() => {
        resetBooking();
      }, 10000);
    }, 60000);
  };

  const resetBooking = () => {
    stopSimulation();
    if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setHasActiveBooking(false);
    setBookingStatus(null);
    setWorkerLocation(INITIAL_WORKER_LOCATION);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  const resetWorkerLocation = (newWorkerLoc = INITIAL_WORKER_LOCATION) => {
    setWorkerLocation(newWorkerLoc);
  };

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      workerLocation,
      distance,
      isSimulating,
      hasActiveBooking,
      bookingStatus,
      saveLocation,
      startSimulation,
      stopSimulation,
      resetBooking,
      resetWorkerLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};
