import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Plus, TrendingUp, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/ui/Header';
import TransactionCard from '../../components/finance/TransactionCard';
import AddTransactionModal from '../../components/finance/AddTransactionModal';
import { formatCurrency } from '../../utils/format';
import { useFinance } from '../../hooks/useFinance';

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'revenu', label: 'Revenus' },
  { key: 'depense', label: 'Dépenses' },
];

const PERIODS = [
  { key: 'all', label: 'Tout' },
  { key: 'today', label: 'Auj.' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
];

export default function Finance() {
  const { transactions, addTransaction, removeTransaction } = useFinance();
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [period, setPeriod] = useState('month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        if (typeFilter === 'revenu') return t.entree > 0;
        if (typeFilter === 'depense') return t.sortie > 0;
        return true;
      })
      .filter((t) => {
        if (period === 'all') return true;
        const d = new Date(t.date);
        if (period === 'today') return d.toDateString() === now.toDateString();
        if (period === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      })
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.designation && t.designation.toLowerCase().includes(q))
        );
      });
  }, [transactions, typeFilter, period, search]);

  const filteredRevenu = filtered.reduce((s, t) => s + (t.entree || 0), 0);
  const filteredDepense = filtered.reduce((s, t) => s + (t.sortie || 0), 0);
  const filteredBalance = filteredRevenu - filteredDepense;

  return (
    <View style={styles.flex}>
      <Header title="Finance" subtitle={`${transactions.length} transaction${transactions.length > 1 ? 's' : ''}`} />

      <View style={styles.summaryBlock}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <SummaryChip label="Balance" value={`${filteredBalance >= 0 ? '+' : '−'}${formatCurrency(filteredBalance)}`} bright />
          <SummaryChip label="Revenus" value={`+${formatCurrency(filteredRevenu)}`} bright />
          <SummaryChip label="Dépenses" value={`−${formatCurrency(filteredDepense)}`} />
        </ScrollView>

        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setTypeFilter(f.key)}
              style={[styles.filterBtn, typeFilter === f.key && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, typeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchWrap}>
          <Search size={15} color="rgba(255,255,255,0.25)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TransactionCard transaction={item} onDelete={removeTransaction} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <TrendingUp size={40} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>Aucune transaction</Text>
            <Text style={styles.emptySubtitle}>Appuyez sur + pour en ajouter une</Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => setShowAdd(true)}
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        activeOpacity={0.85}
      >
        <Plus size={20} color="#080818" strokeWidth={2.5} />
        <Text style={styles.fabText}>Ajouter</Text>
      </TouchableOpacity>

      {showAdd && <AddTransactionModal onAdd={addTransaction} onClose={() => setShowAdd(false)} />}
    </View>
  );
}

function SummaryChip({ label, value, bright }: { label: string; value: string; bright?: boolean }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={bright ? styles.chipValueBright : styles.chipValueDim}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080818' },
  summaryBlock: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  chipsRow: { gap: 12, paddingBottom: 4 },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 90,
    alignItems: 'center',
  },
  chipLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  chipValueBright: { fontWeight: '700', fontSize: 13, color: 'white' },
  chipValueDim: { fontWeight: '700', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  periodRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  periodBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  periodText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  periodTextActive: { color: '#080818' },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterBtnActive: { backgroundColor: 'white', borderColor: 'white' },
  filterText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  filterTextActive: { color: '#080818' },
  searchWrap: { position: 'relative', marginTop: 12 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', marginTop: -8, zIndex: 1 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingLeft: 36,
    paddingRight: 16,
    paddingVertical: 9,
    color: 'white',
    fontSize: 14,
  },
  list: { padding: 16, paddingBottom: 150 },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginTop: 12 },
  emptySubtitle: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { fontWeight: '600', fontSize: 14, color: '#080818' },
});
