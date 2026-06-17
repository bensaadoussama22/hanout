// localStorage keys
const KEYS = {
  ARTICLES: 'hanout_articles',
  TRANSACTIONS: 'hanout_transactions',
  SETTINGS: 'hanout_settings',
  PHOTOS: 'hanout_photos',
};

export const storage = {
  getArticles: () => JSON.parse(localStorage.getItem(KEYS.ARTICLES) || '[]'),
  setArticles: (data) => localStorage.setItem(KEYS.ARTICLES, JSON.stringify(data)),

  getTransactions: () => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
  setTransactions: (data) => localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data)),

  getSettings: () => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}'),
  setSettings: (data) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data)),

  // Photos stored separately (base64) to avoid bloating main data
  getPhoto: (id) => localStorage.getItem(`${KEYS.PHOTOS}_${id}`) || null,
  setPhoto: (id, base64) => {
    try {
      localStorage.setItem(`${KEYS.PHOTOS}_${id}`, base64);
      return true;
    } catch {
      return false; // storage quota exceeded
    }
  },
  removePhoto: (id) => localStorage.removeItem(`${KEYS.PHOTOS}_${id}`),
};

export const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const formatDate = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount) =>
  `${Math.abs(amount).toLocaleString('fr-DZ')} DA`;
