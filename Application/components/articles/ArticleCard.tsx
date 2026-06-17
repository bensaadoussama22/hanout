import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { ShoppingCart, CheckCircle, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react-native';
import { formatDateTime } from '../../utils/format';
import type { Article } from '../../hooks/useArticles';

interface Props {
  article: Article;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onMarkInStore: (id: string) => void;
}

export default function ArticleCard({ article, onStatusChange, onDelete, onMarkInStore }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isFini = article.status === 'fini';
  const isAchete = article.status === 'achete';

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.iconBox}>
          {isAchete
            ? <CheckCircle size={20} color="rgba(255,255,255,0.7)" />
            : <Package size={20} color="rgba(255,255,255,0.5)" />}
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{article.name}</Text>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, isAchete ? styles.badgeBought : styles.badgePending]}>
                {isAchete ? 'Acheté' : 'Fini'}
              </Text>
            </View>
          </View>
          {article.quantity > 1 && (
            <Text style={styles.meta}>Quantité: {article.quantity}</Text>
          )}
          {!!article.barcode && (
            <Text style={styles.barcode}>{article.barcode}</Text>
          )}
        </View>

        <TouchableOpacity onPress={toggle} style={styles.chevron}>
          {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.2)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.2)" />}
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isFini && (
          <TouchableOpacity
            onPress={() => onStatusChange(article.id, 'achete')}
            style={[styles.btn, styles.btnBuy]}
            activeOpacity={0.7}
          >
            <ShoppingCart size={14} color="rgba(255,120,120,0.9)" />
            <Text style={styles.btnBuyText}>Acheté</Text>
          </TouchableOpacity>
        )}
        {isAchete && (
          <TouchableOpacity
            onPress={() => onMarkInStore(article.id)}
            style={[styles.btn, styles.btnStore]}
            activeOpacity={0.7}
          >
            <CheckCircle size={14} color="rgba(80,220,120,0.9)" />
            <Text style={styles.btnStoreText}>En magasin ✓</Text>
          </TouchableOpacity>
        )}
        {confirmDelete ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity onPress={() => onDelete(article.id)} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmDelete(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setConfirmDelete(true)} style={styles.deleteBtn}>
            <Trash2 size={15} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>
        )}
      </View>

      {expanded && (
        <View style={styles.expanded}>
          {!!article.notes && (
            <Text style={styles.notes}>
              <Text style={styles.notesLabel}>Notes: </Text>{article.notes}
            </Text>
          )}
          <Text style={styles.dateText}>Ajouté le {formatDateTime(article.createdAt)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', flexShrink: 1 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeBought: { color: 'rgba(255,255,255,0.7)' },
  badgePending: { color: 'rgba(255,255,255,0.45)' },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  barcode: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, fontVariant: ['tabular-nums'] },
  chevron: { padding: 4 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnBuy: {
    backgroundColor: 'rgba(220,60,60,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(220,60,60,0.3)',
  },
  btnBuyText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,120,120,0.9)' },
  btnStore: {
    backgroundColor: 'rgba(40,180,80,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(40,180,80,0.3)',
  },
  btnStoreText: { fontSize: 13, fontWeight: '600', color: 'rgba(80,220,120,0.9)' },
  confirmRow: { flexDirection: 'row', gap: 8 },
  confirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  confirmText: { fontSize: 12, fontWeight: '600', color: 'white' },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  deleteBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  expanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  notes: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  notesLabel: { fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.25)' },
});
