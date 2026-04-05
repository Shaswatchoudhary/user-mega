import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const topBanners = [
  { id: 1, title: "Electrician\nWorkers", image: 'https://plus.unsplash.com/premium_photo-1678766819262-cdc490bfd0d1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWxlY3RyaWNhbiUyMHdvcmtlcnxlbnwwfHwwfHx8MA%3D%3D', screen: 'Electrician' },
  { id: 2, title: "Plumber\nWorkers", image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', screen: 'Plumber' },
  { id: 3, title: "Carpenter\nWorkers", image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', screen: 'Carpenter' },
];

const popularServices = [
  { id: 1, name: 'Electrician', icon: 'lightning-bolt', color: '#F39C12', screen: 'Electrician' },
  { id: 2, name: 'Plumber', icon: 'pipe-wrench', color: '#3498DB', screen: 'Plumber' },
  { id: 3, name: 'Carpenter', icon: 'hammer-screwdriver', color: '#E67E22', screen: 'Carpenter' },
  { id: 4, name: 'Self-Care\nWorkers', icon: 'face-woman-shimmer', color: '#FF6B9D', screen: 'SelfCare', hasSubcategories: true },
  { id: 5, name: 'AC Repair', icon: 'air-conditioner', color: '#1ABC9C', screen: 'AcRepair' },
  { id: 6, name: 'Appliance\nRepair', icon: 'washing-machine', color: '#9B59B6', screen: 'Appliance' },
];



const applianceServices = [
  {
    id: 1,
    title: 'Refrigerator Repair Workers',
    image: 'https://www.shutterstock.com/image-photo/create-service-engineer-indian-face-260nw-2644992429.jpg'
  },
  {
    id: 2,
    title: 'Microwave Repair Workers',
    image: 'https://tiimg.tistatic.com/fp/1/007/052/microwave-oven-repair-service-858.jpg'
  },
  {
    id: 3,
    title: 'Water Purifier Technicians',
    image: 'https://elements-resized.envatousercontent.com/elements-video-cover-images/3efffb2e-ab85-48fa-8fa3-54b657efaeeb/video_preview/video_preview_0000.jpg?w=500&cf_fit=cover&q=85&format=auto&s=1f029959c012c650278bb39f2f454b633c44b4e9602acf00ed46b2283e4c32e6'
  },
];

const electricianServices = [
  {
    id: 1,
    title: 'Electrical Wiring Experts',
    image: 'https://st2.depositphotos.com/1005682/12186/i/450/depositphotos_121865862-stock-photo-indian-male-electrician.jpg'
  },
  {
    id: 2,
    title: 'Switch & Socket Installers',
    image: 'https://www.shutterstock.com/image-photo/electrician-engineer-tests-electrical-installations-260nw-2466456623.jpg'
  },
  {
    id: 3,
    title: 'Fan Installation Workers',
    image: 'https://hometriangle.com/imagecache/media/514499/package.png'
  },
];

const plumberServices = [
  {
    id: 1,
    title: 'Tap & Mixer Installers',
    image: 'https://tiimg.tistatic.com/fp/1/006/064/plumber-services-367.jpg'
  },
  {
    id: 2,
    title: 'Bathroom Repair Experts',
    image: 'https://www.shutterstock.com/shutterstock/videos/3396943941/thumb/1.jpg?ip=x480'
  },
  {
    id: 3,
    title: 'Drain Cleaning Workers',
    image: 'https://www.initial.com/dam/jcr:4c7e4ce8-0bcf-4392-af33-18e168b7d04e/initialhygiene-blog-drainoscopy-in.webp'
  },
];

const carpenterServices = [
  {
    id: 1,
    title: 'Furniture Repair Carpenters',
    image: 'https://www.shutterstock.com/shutterstock/videos/3661468615/thumb/1.jpg?ip=x480'
  },
  {
    id: 2,
    title: 'Door & Window Fitters',
    image: 'https://media.istockphoto.com/id/1456233693/photo/construction-workers-installing-windows.jpg?s=612x612&w=0&k=20&c=60s02sozdqAcAg8zUaMTyStpeZWhb4uDmpbD2g5VsIw='
  },
  {
    id: 3,
    title: 'Custom Carpentry Workers',
    image: 'https://st3.depositphotos.com/5653638/18453/i/450/depositphotos_184533424-stock-photo-handsome-indian-carpenter-wood-worker.jpg'
  },
];

const acRepairServices = [
  {
    id: 1,
    title: 'AC Installation Technicians',
    image: 'https://tiimg.tistatic.com/fp/1/008/912/ac-maintenance-services-617.jpg'
  },
  {
    id: 2,
    title: 'AC Service & Cleaning Experts',
    image: 'https://content.jdmagicbox.com/v2/comp/coimbatore/b4/0422px422.x422.251010202025.b9b4/catalogue/o50gx9ldodfl8pd-vkxa2xuc57-250.jpg'
  },
  {
    id: 3,
    title: 'AC Gas Refilling Workers',
    image: 'https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template,q_auto:low,f_auto/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1745414099439-5d0167.jpeg'
  },
];

const selfCareServices = [
  {
    id: 1,
    title: 'Haircut & Styling Experts',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    category: 'both' // both men and women
  },
  {
    id: 2,
    title: 'Hair Color Specialists',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400',
    category: 'both'
  },
  {
    id: 3,
    title: 'Massage Therapists',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
    category: 'both'
  },
  {
    id: 4,
    title: 'Facial & Skincare Workers',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    category: 'both'
  },
];

const bannerPromos = [
  {
    id: 1,
    title: 'Expert\nWorkers\nat your door',
    buttonText: 'Book now',
    bg: '#F39C12',
    image: 'https://content.jdmagicbox.com/v2/comp/bangalore/n7/080pxx80.xx80.160413211625.i6n7/catalogue/gururaja-r-srinagar-banashankari-1st-stage-bangalore-electricians-for-residence-1lrzrclwa7.jpg',
    screen: 'Electrician'
  },
  {
    id: 2,
    title: 'Book AC\nTechnicians\nfrom ₹299',
    buttonText: 'Book now',
    bg: '#1ABC9C',
    image: 'https://content3.jdmagicbox.com/v2/comp/ernakulam/x7/0484px484.x484.161007111216.j2x7/catalogue/home-star-services-india-pvt-ltd-palarivattom-ernakulam-ac-repair-and-services-41xdekdexb.jpg',
    screen: 'ACRepair'
  },
];

const searchPlaceholders = [
  'Search for "Electrician"',
  'Search for "AC technician"',
  'Search for "Plumber"',
  'Search for "Haircut"',
  'Search for "Carpenter"',
];

import { API_BASE_URL } from '../../constants/config';

import { useLocation } from '../../context/LocationContext';

export default function HomeScreen({ navigation }) {
  const [placeholder, setPlaceholder] = useState(searchPlaceholders[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSelfCareModal, setShowSelfCareModal] = useState(false);
  const [mostBookedWorkers, setMostBookedWorkers] = useState([]);
  const {
    selectedLocation,
    distance,
    hasActiveBooking,
    bookingStatus
  } = useLocation();

  const mostBookedRef = useRef(null);
  const electricianRef = useRef(null);
  const plumberRef = useRef(null);
  const carpenterRef = useRef(null);
  const acRef = useRef(null);
  const applianceRef = useRef(null);
  const selfCareRef = useRef(null);

  const scrollIndices = useRef({
    mostBooked: 0,
    electrician: 0,
    plumber: 0,
    carpenter: 0,
    ac: 0,
    appliance: 0,
    selfCare: 0
  });

  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    fetchMostBookedWorkers();
    startAutoScroll();
    return () => stopAutoScroll();
  }, [mostBookedWorkers.length]);

  const startAutoScroll = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);

    scrollIntervalRef.current = setInterval(() => {
      // 1. Most Booked
      if (mostBookedWorkers.length > 0) {
        scrollIndices.current.mostBooked = (scrollIndices.current.mostBooked + 1) % mostBookedWorkers.length;
        mostBookedRef.current?.scrollToIndex({ index: scrollIndices.current.mostBooked, animated: true, viewPosition: 0 });
      }

      // 2. Electrician
      if (electricianServices.length > 0) {
        scrollIndices.current.electrician = (scrollIndices.current.electrician + 1) % electricianServices.length;
        electricianRef.current?.scrollToIndex({ index: scrollIndices.current.electrician, animated: true, viewPosition: 0 });
      }

      // 3. Plumber
      if (plumberServices.length > 0) {
        scrollIndices.current.plumber = (scrollIndices.current.plumber + 1) % plumberServices.length;
        plumberRef.current?.scrollToIndex({ index: scrollIndices.current.plumber, animated: true, viewPosition: 0 });
      }

      // 4. Carpenter
      if (carpenterServices.length > 0) {
        scrollIndices.current.carpenter = (scrollIndices.current.carpenter + 1) % carpenterServices.length;
        carpenterRef.current?.scrollToIndex({ index: scrollIndices.current.carpenter, animated: true, viewPosition: 0 });
      }

      // 5. AC
      if (acRepairServices.length > 0) {
        scrollIndices.current.ac = (scrollIndices.current.ac + 1) % acRepairServices.length;
        acRef.current?.scrollToIndex({ index: scrollIndices.current.ac, animated: true, viewPosition: 0 });
      }

      // 6. Appliance
      if (applianceServices.length > 0) {
        scrollIndices.current.appliance = (scrollIndices.current.appliance + 1) % applianceServices.length;
        applianceRef.current?.scrollToIndex({ index: scrollIndices.current.appliance, animated: true, viewPosition: 0 });
      }

      // 7. Self-Care
      if (selfCareServices.length > 0) {
        scrollIndices.current.selfCare = (scrollIndices.current.selfCare + 1) % selfCareServices.length;
        selfCareRef.current?.scrollToIndex({ index: scrollIndices.current.selfCare, animated: true, viewPosition: 0 });
      }
    }, 4000); // 4 seconds for a smoother feel across many carousels
  };

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
  };

  const locationName = selectedLocation?.name || 'Select Location';
  const locationSubtitle = selectedLocation?.addressText || selectedLocation?.address || 'Tap to choose address';

  const fetchMostBookedWorkers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/workers/most-booked`);
      const json = await response.json();
      if (json.success && json.data) {
        // Fallback images based on category
        const fallbackImages = {
          'Electrician': 'https://plus.unsplash.com/premium_photo-1678766819262-cdc490bfd0d1?w=900',
          'Plumber': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
          'Carpenter': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
          'AC Repair': 'https://tiimg.tistatic.com/fp/1/008/912/ac-maintenance-services-617.jpg',
          'default': 'https://thumbs.dreamstime.com/b/head-shot-portrait-happy-indian-man-posing-indoor-millennial-s-dressed-casual-blue-shirt-profile-picture-office-employee-355194436.jpg'
        };

        const mappedWorkers = json.data.map(worker => ({
          id: worker._id,
          title: worker.category || "Service",
          rating: worker.rating || 4.5,
          reviews: `${worker.completedOrders || 0} bookings`,
          price: `₹${worker.basePrice || 299}`,
          originalPrice: `₹${(worker.basePrice || 299) + 150}`,
          image: worker.image || fallbackImages[worker.category] || fallbackImages['default'],
          subtitle: `${worker.fullName || "Professional"} • ${worker.experience || 0} Yrs Exp`
        }));
        setMostBookedWorkers(mappedWorkers);
      }
    } catch (error) {
      console.error('Home Fetch Error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholder(searchPlaceholders[placeholderIndex]);
  }, [placeholderIndex]);

  const handleServicePress = (service) => {
    console.log('Navigating to screen:', service.screen, 'with params:', { category: service.name });
    if (service.hasSubcategories) {
      setShowSelfCareModal(true);
    } else {
      navigation.navigate(service.screen, { category: service.name });
    }
  };

  const handleAcRepairPress = (ac) => {
    navigation.navigate('AcRepair');  // Must match the name in Stack.Screen
  };

  const handleSelfCareSubcategoryPress = (subcategory) => {
    setShowSelfCareModal(false);
    // Navigate to the appropriate screen based on the selected subcategory
    if (subcategory === 'men') {
      navigation.navigate('Menscare');
    } else if (subcategory === 'women') {
      navigation.navigate('Womenscare');
    }
  };

  const handleBannerPress = (banner) => {
    navigation.navigate(banner.screen);
  };

  const handlePromoPress = (promo) => {
    // Ensuring exact screen names as per navigation stack
    const screenMap = {
      'Electrician': 'Electrician',
      'Plumber': 'Plumber',
      'Carpenter': 'Carpenter',
      'AcRepair': 'AcRepair', // Fixed mapping
      'Appliance': 'Appliance',
      'SelfCare': 'SelfCare'
    };
    navigation.navigate(screenMap[promo.screen] || promo.screen);
  };

  const handleSeeAllPress = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => navigation.navigate('LocationSelection')}
            activeOpacity={0.7}
          >
            <View style={{ marginRight: 8 }}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#E84545" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                <Ionicons name="chevron-down" size={16} color="#333" />
              </View>
              <Text style={styles.locationSubtext} numberOfLines={1}>{locationSubtitle}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => alert('Notifications coming soon!')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#888" />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>

        {/* Live Tracking Status Bar */}
        {hasActiveBooking && (
          <TouchableOpacity
            style={[
              styles.trackingStatusBar,
              bookingStatus === 'arrived' && styles.arrivedStatusBar
            ]}
            onPress={() => navigation.navigate('Tracking')}
          >
            <View style={[
              styles.trackingIconContainer,
              bookingStatus === 'arrived' && styles.arrivedIconContainer
            ]}>
              <MaterialCommunityIcons
                name={bookingStatus === 'arrived' ? "check-circle" : "moped"}
                size={24}
                color="#FFF"
              />
            </View>
            <View style={styles.trackingTextContainer}>
              <Text style={styles.trackingTitle}>
                {bookingStatus === 'arrived' ? "Worker has arrived!" : "Workie is on the way!"}
              </Text>
              <Text style={styles.trackingSubtitle}>
                {bookingStatus === 'arrived'
                  ? 'Your professional is at your door'
                  : (distance > 0.1 ? `${distance.toFixed(1)} km away` : 'Arriving soon')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Top Banner Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topBannerScroll}>
          {topBanners.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              style={styles.topBanner}
              activeOpacity={0.9}
              onPress={() => handleBannerPress(banner)}
            >
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Services Grid */}
        <View style={styles.servicesGrid}>
          {popularServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceBox}
              activeOpacity={0.8}
              onPress={() => handleServicePress(service)}
            >
              <View style={[styles.serviceIconBox, { backgroundColor: service.color + '15' }]}>
                <MaterialCommunityIcons name={service.icon} size={32} color={service.color} />
              </View>
              <Text style={styles.serviceBoxText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Most Booked Workers - AUTO CAROUSEL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most booked workers</Text>
          <FlatList
            ref={mostBookedRef}
            data={mostBookedWorkers}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: worker }) => (
              <TouchableOpacity
                key={worker.id}
                style={styles.mostBookedCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('WorkerProfile', { worker })}
              >
                <Image source={{ uri: worker.image }} style={styles.mostBookedImage} />
                <View style={styles.mostBookedInfo}>
                  <Text style={styles.mostBookedTitle} numberOfLines={2}>{worker.title}</Text>
                  <Text style={styles.workerSubtitle}>{worker.subtitle}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#000" />
                    <Text style={styles.ratingText}>{worker.rating} ({worker.reviews})</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{worker.price}</Text>
                    <Text style={styles.originalPrice}>{worker.originalPrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            pagingEnabled={false}
            snapToInterval={212} // width (200) + gap (12)
            decelerationRate="fast"
          />
        </View>

        {/* Promotional Banners */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoBannerScroll}
        >
          {bannerPromos.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[styles.promoBanner, { backgroundColor: promo.bg }]}
              activeOpacity={0.9}
              onPress={() => handlePromoPress(promo)}
            >
              <View style={styles.promoTextSection}>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <View style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>{promo.buttonText}</Text>
                </View>
              </View>
              <Image source={{ uri: promo.image }} style={styles.promoImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Electrician Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Electrician workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('Electrician')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={electricianRef}
            data={electricianServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Electrician', { category: 'Electrician' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Plumber Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plumber workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('Plumber')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={plumberRef}
            data={plumberServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Plumber', { category: 'Plumber' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Carpenter Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Carpenter workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('Carpenter')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={carpenterRef}
            data={carpenterServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Carpenter', { category: 'Carpenter' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* AC Repair Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AC repair workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('AcRepair')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={acRef}
            data={acRepairServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AcRepair', { category: 'AcRepair' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Appliance Repair Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appliance repair workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('Appliance')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={applianceRef}
            data={applianceServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Appliance', { category: 'Appliance' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Self-Care Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Self-care workers</Text>
            <TouchableOpacity onPress={() => setShowSelfCareModal(true)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={selfCareRef}
            data={selfCareServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            renderItem={({ item: service }) => (
              <TouchableOpacity
                key={service.id}
                style={styles.categoryCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('SelfCare', { category: 'SelfCare' })}
              >
                <Image source={{ uri: service.image }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Professional Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional workers</Text>
          <Text style={styles.sectionSubtitle}>available at your doorstep</Text>
        </View>

        {/* Live it up Section */}
        <View style={styles.liveItUpSection}>
          <Text style={styles.liveItUpText}>Ease your day!</Text>
          <Text style={styles.craftedText}>Crafted with care 💕 from Kolhapur.</Text>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Self-Care Subcategory Modal */}
      <Modal
        visible={showSelfCareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSelfCareModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSelfCareModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <Text style={styles.modalSubtitle}>Choose self-care workers</Text>

            <TouchableOpacity
              style={styles.subcategoryButton}
              onPress={() => handleSelfCareSubcategoryPress('men')}
            >
              <MaterialCommunityIcons name="face-man" size={32} color="#E84545" />
              <View style={styles.subcategoryTextContainer}>
                <Text style={styles.subcategoryTitle}>Men's Self-Care</Text>
                <Text style={styles.subcategorySubtext}>Barbers, stylists & grooming experts</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subcategoryButton}
              onPress={() => handleSelfCareSubcategoryPress('women')}
            >
              <MaterialCommunityIcons name="face-woman" size={32} color="#FF6B9D" />
              <View style={styles.subcategoryTextContainer}>
                <Text style={styles.subcategoryTitle}>Women's Self-Care</Text>
                <Text style={styles.subcategorySubtext}>Stylists, beauticians & spa workers</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSelfCareModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  locationSubtext: {
    fontSize: 11,
    color: '#666',
  },
  cartButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  topBannerScroll: {
    paddingHorizontal: 12,
    gap: 12,
    paddingVertical: 8,
  },
  topBanner: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  serviceBox: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  serviceIconBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceBoxText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#000',
    lineHeight: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#E84545',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingRight: 16,
    gap: 12,
  },
  mostBookedCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  mostBookedImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  mostBookedInfo: {
    padding: 12,
  },
  mostBookedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  workerSubtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  categoryCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    padding: 12,
  },
  promoBannerScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  promoBanner: {
    width: 360,
    height: 200,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 20,
  },
  promoTextSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 32,
  },
  promoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  promoImage: {
    width: 150,
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    paddingVertical: 40,
    paddingBottom: 100,
  },
  liveItUpSection: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  liveItUpText: {
    fontSize: 68,
    fontWeight: '900',
    color: '#B0B0B0',
    textAlign: 'left',
    lineHeight: 74,
    letterSpacing: -2,
    marginLeft: 4,
  },
  craftedText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
    textAlign: 'left',
    marginTop: 6,
    marginLeft: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  subcategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subcategoryTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  subcategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subcategorySubtext: {
    fontSize: 12,
    color: '#666',
  },
  modalCloseButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  trackingStatusBar: {
    backgroundColor: '#E84545',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trackingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingTextContainer: {
    flex: 1,
  },
  trackingTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
  trackingSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  arrivedStatusBar: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  arrivedIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});