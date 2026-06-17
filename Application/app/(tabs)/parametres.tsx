import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import {
  Settings as SettingsIcon, Trash2, Download, ChevronRight,
  AlertCircle, FileSpreadsheet, User, LogOut,
} from 'lucide-react-native';
import Header from '../../components/ui/Header';
import { useAuth } from '../../context/AuthContext';
import { useArticles } from '../../hooks/useArticles';
import { useFinance } from '../../hooks/useFinance';
import { downloadAndShareExcelReport } from '../../utils/exportExcel';
import { apiFetch } from '../../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const { articles, removeArticle } = useArticles();
  const { transactions, removeTransaction } = useFinance();
  const [confirmClear, setConfirmClear] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
