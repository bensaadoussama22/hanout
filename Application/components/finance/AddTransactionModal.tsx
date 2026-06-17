import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
  KeyboardAvoidingView, Platform, ScrollView, Pressable, Image,
} from 'react-native';
import { X, TrendingUp, TrendingDown, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { TX_GROUPS, getGroup, buildDesignation } from '../../constants/txGroups';

interface Props {
  onAdd: (tx: {
    group: string;
    name: string;
    entree: number;
    sortie: number;
    description: string;
    date: string;
    hasPhoto: boolean;
    photo: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export default function AddTransactionModal({ onAdd, onClose }: Props) {
  const [type, setType] = useState<'entree' | 'sortie'>('sortie');
  const [amount, setAmount] = useState('');
  const [group, setGroup] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const groupDef = group ? getGroup(group) : null;
  const needsName = !!groupDef && !groupDef.fixedName;

  const availableGroups = useMemo(
    () => TX_GROUPS.filter((g) => (type === 'entree' ? g.id === 'ca' || g.id === 'autre' : g.id !== 'ca')),
    [type]
  );

  const handleTypeChange = (newType: 'entree' | 'sortie') => {
    setType(newType);
    const stillValid = newType === 'entree' ? group === 'ca' || group === 'autre' : group !== 'ca';
    if (!stillValid) { setGroup(''); setName(''); }
  };

  const designationPreview = useMemo(() => {
    if (!groupDef) return null;
    return buildDesignation(group, name);
  }, [group, name, groupDef]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!galleryPerm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setPhotoData(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setPhotoData(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const isValid = !!amount && !!group && (!needsName || !!name.trim());

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onAdd({
        group,
        name: needsName ? name.trim() : '',
        entree: type === 'entree' ? parseFloat(amount) : 0,
        sortie: type === 'sortie' ? parseFloat(amount) : 0,
        description,
        date: new Date(date).toISOString(),
        hasPhoto: !!photoData,
        photo: photoData,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Header + toggle */}
            <View style={styles.headerBlock}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Nouvelle transaction</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
              <View style={styles.toggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, type === 'sortie' && styles.toggleActive]}
                  onPress={() => handleTypeChange('sortie')}
                >
                  <TrendingDown size={16} color={type === 'sortie' ? 'white' : 'rgba(255,255,255,0.35)'} />
                  <Text style={[styles.toggleText, type === 'sortie' && styles.toggleTextActive]}>Sortie</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, type === 'entree' && styles.toggleActive]}
                  onPress={() => handleTypeChange('entree')}
                >
                  <TrendingUp size={16} color={type === 'entree' ? 'white' : 'rgba(255,255,255,0.35)'} />
                  <Text style={[styles.toggleText, type === 'entree' && styles.toggleTextActive]}>Entrée</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              <Field label="Montant (DA) *">
                <View style={styles.amountWrap}>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                  <Text style={styles.daLabel}>DA</Text>
                </View>
              </Field>

              <Field label="Catégorie (Désignation) *">
                <View style={styles.grid}>
                  {availableGroups.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.groupBtn, group === g.id && styles.groupBtnActive]}
                      onPress={() => setGroup(g.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.groupEmoji}>{g.emoji}</Text>
                      <Text style={[styles.groupLabel, group === g.id && styles.groupLabelActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>

              {needsName && groupDef && (
                <Field label={`${groupDef.nameLabel} *`}>
                  <TextInput
                    style={styles.input}
                    placeholder={groupDef.placeholder || ''}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={name}
                    onChangeText={setName}
                  />
                </Field>
              )}

              {designationPreview && (
                <View style={styles.preview}>
                  <Text style={styles.previewText}>
                    Désignation : <Text style={styles.previewValue}>{designationPreview}</Text>
                  </Text>
                </View>
              )}

              <Field label="Description">
                <TextInput
                  style={styles.input}
                  placeholder="Détails de la transaction..."
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={description}
                  onChangeText={setDescription}
                />
              </Field>

              <Field label="Date">
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="numbers-and-punctuation"
                />
              </Field>

              <Field label="Photo de la facture (optionnel)">
                {photoData ? (
                  <View style={styles.photoWrap}>
                    <Image source={{ uri: photoData }} style={styles.photoPreview} resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => setPhotoData(null)}
                      style={styles.removePhoto}
                    >
                      <Trash2 size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={pickPhoto} style={styles.cameraBtn} activeOpacity={0.7}>
                    <Camera size={20} color="rgba(255,255,255,0.35)" />
                    <Text style={styles.cameraBtnText}>Prendre / Choisir une photo</Text>
                  </TouchableOpacity>
                )}
              </Field>

              <View style={{ height: 16 }} />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, (!isValid || submitting) && styles.submitDisabled]}
                disabled={!isValid || submitting}
                activeOpacity={0.8}
              >
                <Text style={[styles.submitText, (!isValid || submitting) && styles.submitTextDisabled]}>
                  {submitting
                    ? 'Enregistrement...'
                    : type === 'sortie' ? '− Enregistrer la sortie' : '+ Enregistrer l\'entrée'}
                </Text>
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
    <View style={fStyles.field}>
      <Text style={fStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fStyles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(14,14,30,0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    maxHeight: '95%',
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: 'white' },
  closeBtn: { padding: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  toggleActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  toggleText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  toggleTextActive: { color: 'white' },
  body: { paddingHorizontal: 20, paddingTop: 16 },
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
  amountWrap: { position: 'relative' },
  amountInput: { fontSize: 24, fontWeight: '700', paddingRight: 50 },
  daLabel: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -9,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  groupBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  groupBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  groupEmoji: { fontSize: 18 },
  groupLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.45)', flex: 1 },
  groupLabelActive: { color: 'white' },
  preview: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  previewText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  previewValue: { fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  photoWrap: { position: 'relative' },
  photoPreview: { width: '100%', height: 128, borderRadius: 12 },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cameraBtnText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.35)' },
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
  submitDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#080818' },
  submitTextDisabled: { color: 'rgba(255,255,255,0.25)' },
});
