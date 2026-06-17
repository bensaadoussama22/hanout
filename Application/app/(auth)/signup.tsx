import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../utils/api';

export default function Signup() {
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      router.replace('/(tabs)/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <View style={styles.logo}><Text style={styles.logoEmoji}>🏪</Text></View>
          <Text style={styles.heading}>Créer un compte</Text>
          <Text style={styles.subheading}>Gérez votre magasin en quelques secondes</Text>
        </View>

        <View style={styles.card}>
          <Field label="Nom">
            <TextInput
              style={styles.input}
              placeholder="Bensaad"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </Field>

          <Field label="E-mail">
            <TextInput
              style={styles.input}
              placeholder="vous@exemple.com"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </Field>

          <Field label="Mot de passe">
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="6 caractères minimum"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                {showPassword
                  ? <EyeOff size={17} color="rgba(255,255,255,0.3)" />
                  : <Eye size={17} color="rgba(255,255,255,0.3)" />}
              </TouchableOpacity>
            </View>
          </Field>

          {!!error && (
            <View style={styles.errorBox}>
              <AlertCircle size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitBtn, loading && styles.submitDisabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.switchText}>
          Déjà un compte ?{' '}
          <Link href="/(auth)/login" style={styles.switchLink}>Se connecter</Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fStyles.field}>
      <Text style={fStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const fStyles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080818' },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 30 },
  heading: { fontSize: 24, fontWeight: '800', color: 'white', textAlign: 'center' },
  subheading: { fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: '50%', marginTop: -10 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', flex: 1 },
  submitBtn: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#080818' },
  switchText: { marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  switchLink: { color: 'white', fontWeight: '700' },
});
