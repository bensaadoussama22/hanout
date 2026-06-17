// Groupes de transactions (système "Désignation") — utilisés pour le formulaire
// et pour construire le rapport Excel (pivot par Désignation / Entrée / Sortie).
export const TX_GROUPS = [
  {
    id: 'dette',
    label: 'Gestion des dettes',
    section: 'Gestion des dettes',
    emoji: '🤝',
    prefix: 'Dette',
    suffix: null,
    fixedName: null,
    nameLabel: 'Nom de la personne',
    placeholder: 'Ahmed',
  },
  {
    id: 'achat',
    label: 'Achats marchandises',
    section: 'Achats marchandises',
    emoji: '📦',
    prefix: 'Achat',
    suffix: null,
    fixedName: null,
    nameLabel: 'Fournisseur',
    placeholder: 'Bachir',
  },
  {
    id: 'charge',
    label: 'Charges & frais divers',
    section: 'Charges & frais divers',
    emoji: '🧾',
    prefix: 'Sortie',
    suffix: null,
    fixedName: null,
    nameLabel: 'Type de charge',
    placeholder: 'Électricité',
  },
  {
    id: 'vehicule',
    label: 'Dépenses véhicule',
    section: 'Dépenses véhicule',
    emoji: '🚗',
    prefix: null,
    suffix: 'Véhicule',
    fixedName: null,
    nameLabel: 'Type de dépense',
    placeholder: 'Vidange',
  },
  {
    id: 'salaire',
    label: 'Paie du personnel',
    section: 'Paie du personnel',
    emoji: '👷',
    prefix: 'Salaire',
    suffix: null,
    fixedName: null,
    nameLabel: 'Employé',
    placeholder: 'Yassine',
  },
  {
    id: 'ca',
    label: "Chiffre d'affaires (CA)",
    section: "Chiffre d'affaires (CA)",
    emoji: '💰',
    prefix: null,
    suffix: null,
    fixedName: null,
    nameLabel: 'Type de recette',
    placeholder: 'Recette',
  },
  {
    id: 'caisse',
    label: 'Approvisionnement de caisse',
    section: 'Trésorerie & divers',
    emoji: '🏦',
    prefix: null,
    suffix: null,
    fixedName: 'Approvisionnement de caisse',
    nameLabel: null,
    placeholder: null,
  },
  {
    id: 'impot',
    label: 'Impôts & Taxes',
    section: 'Trésorerie & divers',
    emoji: '🏛️',
    prefix: null,
    suffix: null,
    fixedName: 'Impôts – Taxes',
    nameLabel: null,
    placeholder: null,
  },
  {
    id: 'ras',
    label: 'RAS (Rien à signaler)',
    section: 'Trésorerie & divers',
    emoji: '📋',
    prefix: null,
    suffix: null,
    fixedName: 'RAS',
    nameLabel: null,
    placeholder: null,
  },
  {
    id: 'autre',
    label: 'Autre',
    section: 'Trésorerie & divers',
    emoji: '🔖',
    prefix: null,
    suffix: null,
    fixedName: null,
    nameLabel: 'Désignation',
    placeholder: 'Divers',
  },
];

export const TX_GROUP_IDS = TX_GROUPS.map((g) => g.id);

export const SECTION_ORDER = [
  'Gestion des dettes',
  'Charges & frais divers',
  'Achats marchandises',
  'Dépenses véhicule',
  'Paie du personnel',
  "Chiffre d'affaires (CA)",
  'Trésorerie & divers',
];

export function getGroup(groupId) {
  return TX_GROUPS.find((g) => g.id === groupId) || TX_GROUPS[TX_GROUPS.length - 1];
}

// Construit le libellé "Désignation" (ex: "Dette – Ahmed", "Achat – Bachir",
// "Vidange – Véhicule", "Recette", "Approvisionnement de caisse"...)
export function buildDesignation(groupId, name) {
  const group = getGroup(groupId);
  if (group.fixedName) return group.fixedName;
  const n = (name || '').trim() || '—';
  if (group.prefix) return `${group.prefix} – ${n}`;
  if (group.suffix) return `${n} – ${group.suffix}`;
  return n;
}
