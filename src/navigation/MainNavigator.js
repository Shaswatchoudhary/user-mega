import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_COUNT = 3;
const TAB_WIDTH = width / TAB_COUNT;

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          position: 'absolute',
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        },
      }}
      tabBar={(props) => <CurvedTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-outline" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Custom Animated Curved Tab Bar
const CurvedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(0);
  const iconScales = state.routes.map(() => useSharedValue(1));
  const labelOpacities = state.routes.map(() => useSharedValue(1));

  const curveStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(activeIndex.value * TAB_WIDTH, { duration: 400 }),
      },
    ],
  }));

  useEffect(() => {
    // Move curve and animate icons
    activeIndex.value = state.index;

    iconScales.forEach((val, i) => {
      val.value = withTiming(i === state.index ? 1.2 : 1, { duration: 400 });
    });

    // Labels always visible
    labelOpacities.forEach((val) => {
      val.value = 1;
    });
  }, [state.index]);

  const tabBarHeight = 70 + insets.bottom;

  return (
    <View style={[styles.container, { height: tabBarHeight, paddingBottom: insets.bottom }]}>
      {/* White Background */}
      <View style={[StyleSheet.absoluteFill, styles.whiteBackground]} />

      {/* Moving Side Curve */}
      <Animated.View style={[styles.curveHighlight, curveStyle]}>
        <Svg width={TAB_WIDTH} height={70} viewBox="0 0 100 70">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#E84545" />
              <Stop offset="100%" stopColor="#873524ff" />
            </LinearGradient>
          </Defs>
          <Path
            d="M0,0 C0,0 0,35 0,35 C0,60 40,70 50,70 C60,70 100,60 100,35 C100,35 100,0 100,0 Z"
            fill="url(#grad)"
          />
        </Svg>
      </Animated.View>

      {/* Icons & Labels */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            navigation.navigate(route.name);
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              options={options}
              isFocused={isFocused}
              onPress={onPress}
              index={index}
              iconScale={iconScales[index]}
              labelOpacity={labelOpacities[index]}
            />
          );
        })}
      </View>
    </View>
  );
};

// Separate component for each tab to ensure hooks are at top level
const TabItem = ({ route, options, isFocused, onPress, index, iconScale, labelOpacity }) => {
  const Icon = options.tabBarIcon;
  const color = isFocused ? '#FFFFFF' : '#f21919ff';

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Animated.View style={animatedIconStyle}>
          {Icon({ color })}
        </Animated.View>

        <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
          <Text style={[styles.labelText, { color }]}>{route.name}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-start',
  },
  whiteBackground: {
    backgroundColor: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  curveHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    elevation: 2,
  },
  labelContainer: {
    marginTop: 4,
  },
  labelText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
});
