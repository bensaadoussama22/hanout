import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, LayoutAnimation } from 'react-native';
import { Camera, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getGroup } from '../../constants/txGroups';
import { formatDate, formatCurrency } from '../../utils/format';
import { apiFetch } from '../../utils/api';
import type { Transaction } from '../../hooks/useFinance';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export default function TransactionCard({ transaction, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const isPositive = transaction.entree > 0;
  const amount = isPositive ? transaction.entree : transaction.sortie;
  const groupDef = getGroup(transaction.group);

  const toggleExpanded = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!expanded && transaction.hasPhoto && !photo) {
      setLoadingPhoto(true);
      try {
        const data = await apiFetch(`/transactions/${transaction.id}/photo`);
        setPhoto(data?.photo || null);
      } catch {
        setPhoto(null);
      } finally {
        setLoadingPhoto(false);
      }
    }
    setExpanded((v) => !v);
  };

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.iconBox}>
          <Text style={styles.emoji}>{groupDef.emoji}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View style={styles.textBlock}>
              <Text style={styles.name} numberOfLines={1}>{transaction.designation}</Text>
              {!!transaction.description && (
                <Text style={styles.desc} numberOfLines={1}>{transaction.description}</Text>
              )}
              <Text style={styles.date}>{formatDate(transaction.date)}</Text>
            </View>
            <View style={styles.amountBlock}>
              {transaction.hasPhoto && <Camera size={14} color="rgba(255,255,255,0.2)" />}
              <Text style={[styles.amount, isPositive ? styles.amountPos : styles.amountNeg]}>
                {isPositive ? '+' : '−'}{formatCurrency(amount)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={toggleExpanded} style={styles.chevron}>
          {expanded
            ? <ChevronUp size={16} color="rgba(255,255,255,0.2)" />
            : <ChevronDown size={16} color="rgba(255,255,255,0.2)" />}
        </TouchableOpacity>
      </View>

      <View style={styles.deleteRow}>
        {confirmDelete ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Supprimer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmDelete(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setConfirmDelete(true)} style={styles.deleteBtn}>
            <Trash2 size={14} color="rgba(255,255,255,0.15)" />
          </TouchableOpacity>
        )}
      </View>

      {expanded && transaction.hasPhoto && (
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Photo de la facture</Text>
          {loadingPhoto ? (
            <Text style={styles.photoMeta}>Chargement...</Text>
          ) : photo ? (
            <Image source={{ uri: photo }} style={styles.photo} resizeMode="contain" />
          ) : (
            <Text style={styles.photoMeta}>Photo indisponible</Text>
          )}
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
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emoji: { fontSize: 18 },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  textBlock: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  desc: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  date: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 },
  amountBlock: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700' },
  amountPos: { color: 'white' },
  amountNeg: { color: 'rgba(255,255,255,0.5)' },
  chevron: { padding: 4 },
  deleteRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 12 },
  confirmRow: { flexDirection: 'row', gap: 8 },
  confirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  confirmText: { fontSize: 12, fontWeight: '600', color: 'white' },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  deleteBtn: { padding: 6, borderRadius: 10 },
  photoSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  photoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8 },
  photoMeta: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  photo: { width: '100%', height: 180, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
});
