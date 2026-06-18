import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import {
  Settings as SettingsIcon, Trash2, Download, ChevronRight,
  AlertCircle, FileSpreadsheet, User, LogOut, Users, UserPlus,
} from 'lucide-react-native';
import Header from '../../components/ui/Header';
import { useAuth } from '../../context/AuthContext';
import { useArticles } from '../../hooks/useArticles';
import { useFinance } from '../../hooks/useFinance';
import { downloadAndShareExcelReport } from '../../utils/exportExcel';
import { apiFetch, ApiError } from '../../utils/api';

interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'travailleur';
}

export default function Settings() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { articles, removeArticle } = useArticles();
  const { transactions, removeTransaction } = useFinance(isAdmin);
  const [confirmClear, setConfirmClear] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountUser[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'travailleur'>('travailleur');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const refreshAccounts = useCallback(async () => {
    try {
      const data = await apiFetch('/auth/users');
      setAccounts(data.users);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refreshAccounts();
  }, [isAdmin, refreshAccounts]);

  const handleCreateAccount = async () => {
    setCreateError('');
    if (!newName.trim() || !newEmail.trim() || newPassword.length < 6) {
      setCreateError('Nom, e-mail et mot de passe (6 caractères min.) requis.');
      return;
    }
    setCreating(true);
    try {
      await apiFetch('/auth/users', {
        method: 'POST',
        body: { name: newName.trim(), email: newEmail.trim(), password: newPassword, role: newRole },
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('travailleur');
      await refreshAccounts();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Création impossible.');
    } finally {
      setCreating(false);
    }
  };

  const handleExcelExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadAndShareExcelReport();
    } catch (err: any) {
      setExportError(err.message || "Erreur lors de l'export.");
    } finally {
      setExporting(false);
    }
  };

  const clearArticles = async () => {
    if (confirmClear !== 'articles') return;
    await Promise.all(articles.map((a) => removeArticle(a.id)));
    setConfirmClear('');
  };

  const clearTransactions = async () => {
    if (confirmClear !== 'transactions') return;
    await Promise.all(transactions.map((t) => removeTransaction(t.id)));
    setConfirmClear('');
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.flex}>
      <Header title="Paramètres" subtitle="Configuration du magasin" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Compte */}
        <Section title="Compte" icon={<User size={16} color="rgba(255,255,255,0.35)" />}>
          <View style={styles.accountRow}>
            <View>
              <Text style={styles.accountName}>{user?.name || '—'}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={15} color="white" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {isAdmin && (
          <>
            {/* Gestion des comptes */}
            <Section title="Gestion des comptes" icon={<Users size={16} color="rgba(255,255,255,0.35)" />}>
              {accounts.map((a) => (
                <View key={a.id} style={styles.accountListRow}>
                  <View>
                    <Text style={styles.accountName}>{a.name}</Text>
                    <Text style={styles.accountEmail}>{a.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, a.role === 'admin' && styles.roleBadgeAdmin]}>
                    <Text style={styles.roleBadgeText}>{a.role === 'admin' ? 'Admin' : 'Travailleur'}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.newAccountForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe (6 caractères min.)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <View style={styles.roleRow}>
                  {(['travailleur', 'admin'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setNewRole(r)}
                      style={[styles.roleOption, newRole === r && styles.roleOptionActive]}
                    >
                      <Text style={[styles.roleOptionText, newRole === r && styles.roleOptionTextActive]}>
                        {r === 'admin' ? 'Admin' : 'Travailleur'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {!!createError && (
                  <View style={styles.errorBox}>
                    <AlertCircle size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.errorText}>{createError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleCreateAccount}
                  disabled={creating}
                  style={[styles.createBtn, creating && styles.disabled]}
                  activeOpacity={0.8}
                >
                  <UserPlus size={15} color="#080818" />
                  <Text style={styles.createBtnText}>{creating ? 'Création...' : 'Créer le compte'}</Text>
                </TouchableOpacity>
              </View>
            </Section>

            {/* Export */}
            <Section title="Exporter les données" icon={<Download size={16} color="rgba(255,255,255,0.35)" />}>
              <TouchableOpacity
                onPress={handleExcelExport}
                disabled={exporting}
                style={[styles.exportBtn, exporting && styles.disabled]}
                activeOpacity={0.7}
              >
                <View style={styles.exportLeft}>
                  <FileSpreadsheet size={16} color="rgba(255,255,255,0.4)" />
                  <View>
                    <Text style={styles.exportTitle}>
                      {exporting ? 'Génération en cours...' : 'Rapport de gestion (Excel)'}
                    </Text>
                    <Text style={styles.exportSubtitle}>{transactions.length} transactions · 3 feuilles</Text>
                  </View>
                </View>
                {exporting
                  ? <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
                  : <ChevronRight size={16} color="rgba(255,255,255,0.2)" />}
              </TouchableOpacity>
              {!!exportError && (
                <View style={styles.errorBox}>
                  <AlertCircle size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.errorText}>{exportError}</Text>
                </View>
              )}
            </Section>

            {/* Stats */}
            <Section title="Statistiques" icon={<SettingsIcon size={16} color="rgba(255,255,255,0.35)" />}>
              {[
                { label: 'Articles en liste', value: articles.length },
                { label: 'Transactions totales', value: transactions.length },
              ].map((stat, i) => (
                <View key={stat.label} style={[styles.statRow, i === 0 && styles.statRowBorder]}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </Section>

            {/* Danger zone */}
            <Section title="Zone dangereuse" icon={<Trash2 size={16} color="rgba(255,255,255,0.5)" />}>
              <Text style={styles.dangerNote}>Ces actions sont irréversibles.</Text>

              {confirmClear === 'articles' ? (
                <View style={styles.confirmRow}>
                  <TouchableOpacity onPress={clearArticles} style={styles.confirmBtn}>
                    <Text style={styles.confirmText}>Confirmer la suppression</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmClear('')} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setConfirmClear('articles')} style={styles.dangerBtn}>
                  <Text style={styles.dangerBtnText}>Vider la liste des articles</Text>
                </TouchableOpacity>
              )}

              {confirmClear === 'transactions' ? (
                <View style={styles.confirmRow}>
                  <TouchableOpacity onPress={clearTransactions} style={styles.confirmBtn}>
                    <Text style={styles.confirmText}>Confirmer la suppression</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmClear('')} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setConfirmClear('transactions')} style={styles.dangerBtn}>
                  <Text style={styles.dangerBtnText}>Vider toutes les transactions</Text>
                </TouchableOpacity>
              )}
            </Section>
          </>
        )}

        <Text style={styles.footer}>Bensaad Article Ménage & Gâteau — v1.0</Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={sStyles.section}>
      <View style={sStyles.sectionHeader}>
        {icon}
        <Text style={sStyles.sectionTitle}>{title}</Text>
      </View>
      <View style={sStyles.sectionBody}>{children}</View>
    </View>
  );
}

const sStyles = StyleSheet.create({
  section: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  sectionBody: { padding: 16 },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080818' },
  content: { padding: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accountName: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  accountEmail: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: 'white' },
  accountListRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  roleBadgeAdmin: { backgroundColor: 'rgba(120,160,255,0.18)' },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  newAccountForm: { marginTop: 16, gap: 10 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: 'white',
    fontSize: 14,
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleOption: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  roleOptionActive: { backgroundColor: 'white', borderColor: 'white' },
  roleOptionText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  roleOptionTextActive: { color: '#080818' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'white', borderRadius: 12, paddingVertical: 12,
  },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#080818' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  disabled: { opacity: 0.5 },
  exportLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exportTitle: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  exportSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  errorText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  statRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  statLabel: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  statValue: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  dangerNote: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 },
  confirmRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  confirmBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  confirmText: { fontSize: 13, fontWeight: '600', color: 'white' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  cancelText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  dangerBtn: {
    paddingVertical: 11, borderRadius: 12, alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dangerBtnText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  footer: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingBottom: 24, paddingTop: 8 },
});
