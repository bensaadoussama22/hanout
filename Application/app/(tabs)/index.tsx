import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, Wallet, TrendingUp, TrendingDown, ShoppingCart, AlertCircle } from 'lucide-react-native';
import { formatCurrency } from '../../utils/format';
import GlassCard from '../../components/ui/GlassCard';
import { useArticles } from '../../hooks/useArticles';
import { useFinance } from '../../hooks/useFinance';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { articles, refresh: refreshArticles } = useArticles();
  const { transactions, stats, refresh: refreshFinance } = useFinance();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshArticles(), refreshFinance()]);
    setRefreshing(false);
  };

  const pendingArticles = articles.filter((a) => a.status === 'fini');
  const boughtArticles = articles.filter((a) => a.status === 'achete');
  const recentTransactions = useMemo(() => [...transactions].slice(0, 5), [transactions]);
  const monthName = new Date().toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' });

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.heroLabel}>Tableau de bord</Text>
        <Text style={styles.heroTitle}>Bensaad</Text>
        <Text style={styles.heroSubtitle}>Article ménage & Gâteau</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance du mois — {monthName}</Text>
          <Text style={styles.balanceValue}>
            {stats.monthTotal >= 0 ? '+' : '−'}{formatCurrency(stats.monthTotal)}
          </Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceSubLabel}>Revenus</Text>
              <Text style={styles.balanceSubValuePos}>+{formatCurrency(stats.monthRevenu)}</Text>
            </View>
            <View>
              <Text style={styles.balanceSubLabel}>Dépenses</Text>
              <Text style={styles.balanceSubValueNeg}>−{formatCurrency(stats.monthDepense)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Today stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIcon}><TrendingUp size={14} color="rgba(255,255,255,0.7)" /></View>
              <Text style={styles.statLabel}>Aujourd'hui entrée</Text>
            </View>
            <Text style={styles.statValuePos}>+{formatCurrency(stats.todayRevenu)}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIcon}><TrendingDown size={14} color="rgba(255,255,255,0.7)" /></View>
              <Text style={styles.statLabel}>Aujourd'hui sortie</Text>
            </View>
            <Text style={styles.statValueNeg}>−{formatCurrency(stats.todayDepense)}</Text>
          </GlassCard>
        </View>

        {/* Stock status */}
        <GlassCard noPad>
          <View style={styles.sectionHeader}>
            <Package size={16} color="rgba(255,255,255,0.35)" />
            <Text style={styles.sectionTitle}>État du stock</Text>
          </View>
          <View style={styles.stockRow}>
            <View style={[styles.stockCell, styles.stockBorder]}>
              <View style={styles.stockLabelRow}>
                <AlertCircle size={13} color="rgba(255,255,255,0.5)" />
                <Text style={styles.stockLabel}>À acheter</Text>
              </View>
              <Text style={styles.stockValue}>{pendingArticles.length}</Text>
            </View>
            <View style={[styles.stockCell, styles.stockBorder]}>
              <View style={styles.stockLabelRow}>
                <ShoppingCart size={13} color="rgba(255,255,255,0.5)" />
                <Text style={styles.stockLabel}>Acheté</Text>
              </View>
              <Text style={styles.stockValueBright}>{boughtArticles.length}</Text>
            </View>
            <View style={styles.stockCell}>
              <View style={styles.stockLabelRow}>
                <Package size={13} color="rgba(255,255,255,0.3)" />
                <Text style={styles.stockLabel}>Total liste</Text>
              </View>
              <Text style={styles.stockValueDim}>{articles.length}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Pending alert */}
        {pendingArticles.length > 0 && (
          <View style={styles.alertCard}>
            <AlertCircle size={17} color="rgba(255,255,255,0.6)" />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>Articles à acheter</Text>
              <Text style={styles.alertSubtitle}>
                {pendingArticles.slice(0, 3).map((a) => a.name).join(', ')}
                {pendingArticles.length > 3 ? ` et ${pendingArticles.length - 3} autres` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <GlassCard noPad>
            <View style={styles.sectionHeader}>
              <Wallet size={16} color="rgba(255,255,255,0.35)" />
              <Text style={styles.sectionTitle}>Transactions récentes</Text>
            </View>
            {recentTransactions.map((tx, i) => {
              const isPositive = tx.entree > 0;
              const amount = isPositive ? tx.entree : tx.sortie;
              return (
                <View
                  key={tx.id}
                  style={[styles.txRow, i < recentTransactions.length - 1 && styles.txDivider]}
                >
                  <View>
                    <Text style={styles.txName}>{tx.designation}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={isPositive ? styles.txAmountPos : styles.txAmountNeg}>
                    {isPositive ? '+' : '−'}{formatCurrency(amount)}
                  </Text>
                </View>
              );
            })}
          </GlassCard>
        )}

        {articles.length === 0 && transactions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>Bienvenue dans votre gestionnaire de magasin!</Text>
            <Text style={styles.emptySubtitle}>Commencez par ajouter des articles ou des transactions.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080818' },
  hero: { paddingHorizontal: 20, paddingBottom: 40 },
  heroLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  heroTitle: { color: 'white', fontSize: 24, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 2 },
  balanceCard: {
    marginTop: 20,
    borderRadius: 18,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '500' },
  balanceValue: { color: 'white', fontSize: 30, fontWeight: '800', marginTop: 4 },
  balanceRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  balanceSubLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  balanceSubValuePos: { color: 'white', fontWeight: '700', fontSize: 14 },
  balanceSubValueNeg: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 14 },
  content: { paddingHorizontal: 16, marginTop: -16, gap: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  statValuePos: { fontSize: 19, fontWeight: '800', color: 'white' },
  statValueNeg: { fontSize: 19, fontWeight: '800', color: 'rgba(255,255,255,0.55)' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  stockRow: { flexDirection: 'row' },
  stockCell: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  stockBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  stockLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  stockLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  stockValue: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  stockValueBright: { fontSize: 22, fontWeight: '800', color: 'white' },
  stockValueDim: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  alertCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  alertSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  txDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  txName: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  txDate: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  txAmountPos: { fontWeight: '700', fontSize: 14, color: 'white' },
  txAmountNeg: { fontWeight: '700', fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: 'rgba(255,255,255,0.55)', fontWeight: '500', textAlign: 'center' },
  emptySubtitle: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 4, textAlign: 'center' },
});
