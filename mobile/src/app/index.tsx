import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { CampusColors } from '../constants/theme';

export default function AuthGate() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🏛️</Text>
      </View>
      <Text style={styles.title}>Campus Room</Text>
      <Text style={styles.subtitle}>Smart University Space Reservation</Text>
      <ActivityIndicator size="large" color={CampusColors.primary} style={{ marginTop: 24 }} />
      <Text style={styles.checking}>Connecting to campus services...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: CampusColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: CampusColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: CampusColors.textSecondary,
    marginTop: 6,
  },
  checking: {
    fontSize: 13,
    color: CampusColors.textMuted,
    marginTop: 12,
  },
});