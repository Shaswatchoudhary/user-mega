import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DEFAULT_WORKER_IMAGE = 'https://avatar.iran.liara.run/public/job/operator/male';

const topBanners = [
  { id: 1, title: "Electrician\nWorkers", image: 'https://plus.unsplash.com/premium_photo-1678766819262-cdc490bfd0d1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWxlY3RyaWNhbiUyMHdvcmtlcnxlbnwwfHwwfHx8MA%3D%3D', screen: 'WorkerList', category: 'Electrician' },
  { id: 2, title: "Plumber\nWorkers", image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', screen: 'WorkerList', category: 'Plumber' },
  { id: 3, title: "Carpenter\nWorkers", image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', screen: 'WorkerList', category: 'Carpenter' },
];

const popularServices = [
  { id: 1, name: 'Electrician', icon: 'lightning-bolt', color: '#F39C12', screen: 'WorkerList' },
  { id: 2, name: 'Plumber', icon: 'pipe-wrench', color: '#3498DB', screen: 'WorkerList' },
  { id: 3, name: 'Carpenter', icon: 'hammer-screwdriver', color: '#E67E22', screen: 'WorkerList' },
  { id: 4, name: 'Self-Care', icon: 'face-woman-shimmer', color: '#FF6B9D', screen: 'WorkerList', hasSubcategories: true },
  { id: 5, name: 'AC Repair', icon: 'air-conditioner', color: '#1ABC9C', screen: 'WorkerList' },
  { id: 6, name: 'Appliance', icon: 'washing-machine', color: '#9B59B6', screen: 'WorkerList' },
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
    screen: 'WorkerList',
    category: 'Electrician'
  },
  {
    id: 2,
    title: 'Book AC\nTechnicians\nfrom ₹299',
    buttonText: 'Book now',
    bg: '#1ABC9C',
    image: 'https://content3.jdmagicbox.com/v2/comp/ernakulam/x7/0484px484.x484.161007111216.j2x7/catalogue/home-star-services-india-pvt-ltd-palarivattom-ernakulam-ac-repair-and-services-41xdekdexb.jpg',
    screen: 'WorkerList',
    category: 'AC Repair'
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
import { useAuth } from '../../context/AuthContext';
import { getUserLocation, reverseGeocode } from '../../utils/locationHelper';
import permissionService from '../../services/permissionService';
import firestore from '@react-native-firebase/firestore';
import CustomModal from '../../components/CustomModal';

export default function HomeScreen({ navigation }) {
  const [placeholder, setPlaceholder] = useState(searchPlaceholders[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSelfCareModal, setShowSelfCareModal] = useState(false);
  const [mostBookedWorkers, setMostBookedWorkers] = useState([]);
  const {
    selectedLocation,
    saveLocation,
    distance,
    hasActiveBooking,
    bookingStatus
  } = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    primaryLabel: 'Got it',
    secondaryLabel: null,
    onPrimary: () => setModalConfig(prev => ({ ...prev, visible: false })),
    onSecondary: null,
  });

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

  useEffect(() => {
    const initLocation = async () => {
      // 1. If location already exists in context, don't re-detect
      if (selectedLocation?.latitude) return;

      // 2. Check for last used address from user profile
      if (user?.lastUsedAddress) {
        console.log('[HomeScreen] Using last used address from profile');
        saveLocation(user.lastUsedAddress);
        return;
      }

      // 3. Fallback to GPS
      const perms = await permissionService.requestInitialPermissions();
      if (perms.location) {
        try {
          const coords = await getUserLocation();
          if (coords) {
            const addr = await reverseGeocode(coords.latitude, coords.longitude);
            if (addr) {
              await saveLocation({
                ...addr,
                shortAddress: addr.name,
                fullAddress: addr.addressText
              });
            }
          }
        } catch (error) {
          console.error('[HomeScreen] Initial Location Error:', error);
        }
      }
    };
    initLocation();
    fetchMostBookedWorkers();
    return () => {};
  }, [user?.lastUsedAddress, selectedLocation?.latitude, mostBookedWorkers.length]);


  const locationName = selectedLocation?.shortAddress || selectedLocation?.name || 'Select Location';
  const locationSubtitle = selectedLocation?.displayAddress || selectedLocation?.addressText || selectedLocation?.address || 'Tap to choose address';

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
          image: String(worker.image || fallbackImages[worker.category] || fallbackImages['default']),
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

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('notifications')
      .where('isRead', '==', false)
      .onSnapshot(querySnapshot => {
        setUnreadCount(querySnapshot?.size || 0);
      }, error => {
        console.error('[HomeScreen] Error listening to notifications:', error.message);
      });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleServicePress = (service) => {
    if (service.hasSubcategories) {
      setShowSelfCareModal(true);
    } else {
      navigation.navigate(service.screen, { category: service.name });
    }
  };

  const handleAcRepairPress = (ac) => {
    navigation.navigate('AcRepair');
  };

  const handleSelfCareSubcategoryPress = (subcategory) => {
    setShowSelfCareModal(false);
    if (subcategory === 'men') {
      navigation.navigate('WorkerList', { category: "Men's Self Care" });
    } else if (subcategory === 'women') {
      navigation.navigate('WorkerList', { category: "Women's Self Care" });
    }
  };

  const handleBannerPress = (banner) => {
    navigation.navigate(banner.screen, { category: banner.category });
  };

  const handlePromoPress = (promo) => {
    navigation.navigate(promo.screen, { category: promo.category });
  };

  const handleSeeAllPress = (category) => {
    navigation.navigate('WorkerList', { category: category });
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
              <Text style={{ fontSize: 9, color: '#E84545', fontWeight: 'bold' }}>Build v1.2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.badgeContainer} />
            )}
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
              <Image source={{ uri: String(banner.image || DEFAULT_WORKER_IMAGE) }} style={styles.bannerImage} />
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
                onPress={() => navigation.navigate('WorkerProfile', { worker: { ...worker, name: worker.subtitle.split(' • ')[0] } })}
              >
                <Image source={{ uri: String(worker.image || DEFAULT_WORKER_IMAGE) }} style={styles.mostBookedImage} />
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
              <Image source={{ uri: String(promo.image || DEFAULT_WORKER_IMAGE) }} style={styles.promoImage} />
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
                onPress={() => navigation.navigate('WorkerList', { category: 'Electrician' })}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
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
                onPress={() => navigation.navigate('WorkerList', { category: 'Plumber' })}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
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
                onPress={() => navigation.navigate('WorkerList', { category: 'Carpenter' })}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            snapToInterval={192} // width (180) + gap (12)
            decelerationRate="fast"
          />
        </View>

        {/* AC Repair Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AC repair workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('AC Repair')}>
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
                onPress={() => navigation.navigate('WorkerList', { category: 'AC Repair' })}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            snapToInterval={192} // width (180) + gap (12)
            decelerationRate="fast"
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
                onPress={() => navigation.navigate('WorkerList', { category: 'Appliance' })}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            snapToInterval={192} // width (180) + gap (12)
            decelerationRate="fast"
          />
        </View>

        {/* Self-Care Workers - MOTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Self-care workers</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('SelfCare')}>
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
                onPress={() => handleSeeAllPress('SelfCare')}
              >
                <Image source={{ uri: String(service.image || DEFAULT_WORKER_IMAGE) }} style={styles.categoryImage} />
                <Text style={styles.categoryTitle}>{service.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            snapToInterval={192} // width (180) + gap (12)
            decelerationRate="fast"
          />
        </View>

        {/* Self-Care Selection Modal (Screenshot Match) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSelfCareModal}
          onRequestClose={() => setShowSelfCareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Text style={styles.modalSubtitle}>Choose self-care workers</Text>

              {/* Men's Option */}
              <TouchableOpacity 
                style={styles.subcategoryButton}
                onPress={() => {
                  setShowSelfCareModal(false);
                  navigation.navigate('Menscare');
                }}
              >
                <View style={[styles.subIconContainer, { backgroundColor: '#FFF5F5' }]}>
                  <MaterialCommunityIcons name="face-man" size={28} color="#E84545" />
                </View>
                <View style={styles.subcategoryTextContainer}>
                  <Text style={styles.subcategoryTitle}>Men's Self-Care</Text>
                  <Text style={styles.subcategorySubtext}>Barbers, stylists & grooming experts</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Women's Option */}
              <TouchableOpacity 
                style={styles.subcategoryButton}
                onPress={() => {
                  setShowSelfCareModal(false);
                  navigation.navigate('Womenscare');
                }}
              >
                <View style={[styles.subIconContainer, { backgroundColor: '#FFF5F7' }]}>
                  <MaterialCommunityIcons name="face-woman" size={28} color="#FF6B9D" />
                </View>
                <View style={styles.subcategoryTextContainer}>
                  <Text style={styles.subcategoryTitle}>Women's Self-Care</Text>
                  <Text style={styles.subcategorySubtext}>Stylists, beauticians & spa workers</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowSelfCareModal(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryLabel={modalConfig.primaryLabel}
        secondaryLabel={modalConfig.secondaryLabel}
        onPrimary={modalConfig.onPrimary}
        onSecondary={modalConfig.onSecondary}
      />
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
  // Modal Styles (Compact Screenshot Match)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '82%', // More compact
    maxWidth: 340,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  subcategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subIcon: {
    width: 22,
    height: 22,
  },
  subcategoryTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  subcategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  subcategorySubtext: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
  },
  modalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Poppins-SemiBold',
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
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: '#E84545',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
});