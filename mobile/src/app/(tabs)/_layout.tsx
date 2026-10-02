import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CampusColors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function TabLayout() {
  const { unreadNotificationCount, queueCount } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CampusColors.primary,
        tabBarInactiveTintColor: CampusColors.textMuted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="meeting-room" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarBadge: queueCount > 0 ? queueCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: CampusColors.warning,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark-added" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarBadge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: CampusColors.primary,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
