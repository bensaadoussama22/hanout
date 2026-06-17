import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Plus, Search, Package } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/ui/Header';
import ArticleCard from '../../components/articles/ArticleCard';
import AddArticleModal from '../../components/articles/AddArticleModal';
import { useArticles } from '../../hooks/useArticles';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'fini', label: 'À acheter' },
  { key: 'achete', label: 'Acheté' },
];

export default function Articles() {
  const { articles, addArticle, updateStatus, removeArticle, markInStore } = useArticles();
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return articles
      .filter((a) => filter === 'all' || a.status === filter)
      .filter((a) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          (a.barcode && a.barcode.includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
        );
      });
  }, [articles, filter, search]);

  return (
    <View style={styles.flex}>
      <Header title="Articles" subtitle={`${articles.length} article${articles.length > 1 ? 's' : ''} en liste`} />

      <View style={styles.searchBlock}>
        <View style={styles.searchWrap}>
          <Search size={15} color="rgba(255,255,255,0.25)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un article..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
                {f.key !== 'all' ? ` (${articles.filter((a) => a.status === f.key).length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onStatusChange={updateStatus}
            onDelete={removeArticle}
            onMarkInStore={markInStore}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={40} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>
              {search ? 'Aucun résultat' : 'Aucun article dans cette catégorie'}
            </Text>
            {!search && filter === 'all' && (
              <Text style={styles.emptySubtitle}>Appuyez sur + pour ajouter un article</Text>
            )}
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => setShowAdd(true)}
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#080818" strokeWidth={2.5} />
      </TouchableOpacity>

      {showAdd && <AddArticleModal onAdd={addArticle} onClose={() => setShowAdd(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080818' },
  searchBlock: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', marginTop: -8, zIndex: 1 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingLeft: 36,
    paddingRight: 16,
    paddingVertical: 10,
    color: 'white',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
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
  list: { padding: 16, paddingBottom: 150 },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginTop: 12 },
  emptySubtitle: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
