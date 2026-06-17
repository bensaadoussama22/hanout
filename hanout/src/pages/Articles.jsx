import { useState, useMemo } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import Header from '../components/layout/Header';
import ArticleCard from '../components/articles/ArticleCard';
import AddArticleModal from '../components/articles/AddArticleModal';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'fini', label: 'À acheter' },
  { key: 'achete', label: 'Acheté' },
];

export default function Articles({ articles, onAdd, onStatusChange, onDelete, onMarkInStore }) {
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
    <div className="pb-24">
      <Header
        title="Articles"
        subtitle={`${articles.length} article${articles.length > 1 ? 's' : ''} en liste`}
      />

      {/* Search & filters */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            inputMode="search"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2 mt-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                filter === f.key
                  ? { background: 'white', color: '#080818' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  ({articles.filter((a) => a.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/40 font-medium">
              {search ? 'Aucun résultat' : 'Aucun article dans cette catégorie'}
            </p>
            {!search && filter === 'all' && (
              <p className="text-white/25 text-sm mt-1">Appuyez sur + pour ajouter un article</p>
            )}
          </div>
        ) : (
          filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onMarkInStore={onMarkInStore}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
        style={{
          right: '16px',
          bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 8px)',
          background: 'white',
          color: '#080818',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {showAdd && (
        <AddArticleModal
          onAdd={onAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
