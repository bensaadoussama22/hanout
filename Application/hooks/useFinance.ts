import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../utils/api';

export interface Transaction {
  id: string;
  date: string;
  group: string;
  designation: string;
  description?: string;
  entree: number;
  sortie: number;
  hasPhoto?: boolean;
  createdBy?: string;
}

export function useFinance(enabled: boolean = true) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    const data = await apiFetch('/transactions');
    setTransactions(data.transactions);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh().finally(() => setLoading(false));
  }, [enabled, refresh]);

  const addTransaction = useCallback(async (tx: Partial<Transaction> & { photo?: string | null; name?: string; hasPhoto?: boolean }) => {
    const data = await apiFetch('/transactions', {
      method: 'POST',
      body: {
        date: tx.date || new Date().toISOString(),
        group: tx.group,
        name: tx.name || '',
        entree: tx.entree || 0,
        sortie: tx.sortie || 0,
        description: tx.description || '',
        hasPhoto: tx.hasPhoto || false,
        photo: tx.photo || null,
      },
    });
    setTransactions((prev) =>
      [data.transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    return data.transaction;
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const today = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.toDateString() === now.toDateString();
    });

    const sum = (list: Transaction[], field: 'entree' | 'sortie') =>
      list.reduce((s, t) => s + (t[field] || 0), 0);

    return {
      monthTotal: sum(thisMonth, 'entree') - sum(thisMonth, 'sortie'),
      monthRevenu: sum(thisMonth, 'entree'),
      monthDepense: sum(thisMonth, 'sortie'),
      todayRevenu: sum(today, 'entree'),
      todayDepense: sum(today, 'sortie'),
    };
  }, [transactions]);

  return { transactions, loading, addTransaction, removeTransaction, refresh, stats };
}
