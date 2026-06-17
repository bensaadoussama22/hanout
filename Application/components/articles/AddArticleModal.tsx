import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { X, Package } from 'lucide-react-native';

interface Props {
  onAdd: (article: { name: string; quantity: number; notes: string }) => void;
  onClose: () => void;
}

export default function AddArticleModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity, notes });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconBox}>
                  <Package size={16} color="rgba(255,255,255,0.6)" />
                </View>
                <Text style={styles.title}>Nouvel article</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              <Field label="Nom de l'article *">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Sucre 1kg, Huile 5L..."
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                />
              </Field>

              <Field label="Quantité manquante">
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.qInput]}
                    value={String(quantity)}
                    onChangeText={(v) => setQuantity(parseInt(v) || 1)}
                    keyboardType="number-pad"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.qBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Text style={styles.qBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </Field>

              <Field label="Notes">
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Marque préférée, emplacement..."
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </Field>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, !name.trim() && styles.submitDisabled]}
                disabled={!name.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>Ajouter à la liste</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(14,14,30,0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: 'white' },
  closeBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: { paddingHorizontal: 20, paddingVertical: 16 },
  field: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
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
  textarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBtnText: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  qInput: { flex: 1, fontWeight: '600' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  submitBtn: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: 'rgba(255,255,255,0.15)' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#080818' },
});
