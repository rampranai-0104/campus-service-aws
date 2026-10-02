import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { CampusColors } from '../constants/theme';
import outputs from '../amplify_outputs.json';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoadingAuth, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim()) {
      setLocalError('Please enter your university email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        setLocalError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = localError || authError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* University Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="meeting-room" size={32} color="#ffffff" />
          </View>
          <Text style={styles.appName}>CampusRoom</Text>
          <Text style={styles.appSubtitle}>University Academic Workspace</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Access study pods, labs, and seminar halls with your university credentials.
          </Text>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={18} color={CampusColors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Email Input */}
          <Text style={styles.inputLabel}>University Email</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={CampusColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. student@klu.in"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={(t) => { setEmail(t); setLocalError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={CampusColors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={(t) => { setPassword(t); setLocalError(null); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={CampusColors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.submitButton, (submitting || isLoadingAuth) && styles.submitButtonDisabled]}
            disabled={submitting || isLoadingAuth}
            onPress={handleLogin}>
            {submitting || isLoadingAuth ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Sign In</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          {/* Security & Cloud Info Pill */}
          <View style={styles.cloudInfoBox}>
            <MaterialIcons name="verified-user" size={14} color={CampusColors.primary} />
            <Text style={styles.cloudInfoText}>
              Amazon Cognito • {outputs.auth?.aws_region || 'ap-south-1'}
            </Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            For student or faculty account inquiries, please contact Campus Facilities.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: CampusColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CampusColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: CampusColors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: CampusColors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CampusColors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: CampusColors.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CampusColors.dangerContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: CampusColors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: CampusColors.text,
  },
  eyeBtn: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: CampusColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: CampusColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cloudInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cloudInfoText: {
    fontSize: 11,
    color: CampusColors.textMuted,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  footerNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: CampusColors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
  },
});
