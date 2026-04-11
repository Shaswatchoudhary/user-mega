import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import JobScreen from '../screens/jobs/JobScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_COUNT = 3;
const TAB_WIDTH = width / TAB_COUNT;

export default function MainTabNavigator({ route }) {
  const { workerId } = route.params || {};

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
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ workerId }}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Job"
        component={JobScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="briefcase-outline"
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

// Animated Tab Bar with Bottom Curve Design
const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Animation values
  const translateX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
  const iconScales = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1.2 : 1))
  ).current;
  const labelOpacities = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0.7))
  ).current;

  useEffect(() => {
    // Animate the curve movement
    Animated.timing(translateX, {
      toValue: state.index * TAB_WIDTH,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    // Animate icons
    iconScales.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === state.index ? 1.2 : 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    });

    // Animate labels
    labelOpacities.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === state.index ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    });
  }, [state.index]);

  const tabBarHeight = 70 + insets.bottom;

  return (
    <View style={[styles.container, { height: tabBarHeight, paddingBottom: insets.bottom }]}>
      {/* White Background with Shadow */}
      <View style={[StyleSheet.absoluteFill, styles.whiteBackground]} />

      {/* Moving Bottom Curve */}
      <Animated.View style={[styles.curveHighlight, { transform: [{ translateX }] }]}>
        <Svg width={TAB_WIDTH} height={70} viewBox="0 0 100 70">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#E84545" />
              <Stop offset="100%" stopColor="#C73535" />
            </LinearGradient>
          </Defs>
          {/* Inverted curve - open at top, closed at bottom */}
          <Path
            d="M0,0 
               L0,35
               Q0,50 15,55
               Q35,65 50,65
               Q65,65 85,55
               Q100,50 100,35
               L100,0
               Z"
            fill="url(#grad)"
          />
        </Svg>
      </Animated.View>

      {/* Icons & Labels */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const color = isFocused ? '#FFFFFF' : '#E84545';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            >
              <View style={styles.iconContainer}>
                <Animated.View style={{ transform: [{ scale: iconScales[index] }] }}>
                  {Icon({ color })}
                </Animated.View>

                <Animated.View style={[styles.labelContainer, { opacity: labelOpacities[index] }]}>
                  <Text style={[styles.labelText, { color }]}>{route.name}</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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
    fontWeight: '600',
  },
});