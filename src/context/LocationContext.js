import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

// Hardcoded Kolhapur Coordinates
const HARDCODED_LOCATION = {
  latitude: 16.7050,
  longitude: 74.2433,
  addressText: "Kolhapur City Center, Maharashtra, India",
  name: "Kolhapur",
  subtitle: "Maharashtra, India"
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [distance, setDistance] = useState(null); 
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedLocation');
      if (saved) {
        setSelectedLocation(JSON.parse(saved));
      } else {
        setSelectedLocation(HARDCODED_LOCATION);
      }
    } catch (e) {
      console.error('Error loading location:', e);
    }
  };

  const saveLocation = async (location) => {
    try {
      await AsyncStorage.setItem('selectedLocation', JSON.stringify(location));
      setSelectedLocation(location);
    } catch (e) {
      console.error('Error saving location:', e);
    }
  };

  // Stubs for previous functionality
  const startSimulation = () => {
    console.log("Simulation disabled - Maps removed");
    setHasActiveBooking(true);
    setBookingStatus('on_the_way');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetBooking = () => {
    setHasActiveBooking(false);
    setBookingStatus(null);
  };

  const resetWorkerLocation = () => {
    setWorkerLocation(HARDCODED_LOCATION);
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
