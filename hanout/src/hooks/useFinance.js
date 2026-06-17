import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../utils/api';

export function useFinance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await apiFetch('/transactions');
    setTransactions(data.transactions);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addTransaction = useCallback(async (tx) => {
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
      [data.transaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    return data.transaction;
  }, []);

  const removeTransaction = useCallback(async (id) => {
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

    const sum = (list, field) => list.reduce((s, t) => s + (t[field] || 0), 0);

    const monthEntree = sum(thisMonth, 'entree');
    const monthSortie = sum(thisMonth, 'sortie');
    const todayEntree = sum(today, 'entree');
    const todaySortie = sum(today, 'sortie');
    const totalEntree = sum(transactions, 'entree');
    const totalSortie = sum(transactions, 'sortie');

    return {
      total: totalEntree - totalSortie,
      monthTotal: monthEntree - monthSortie,
      monthRevenu: monthEntree,
      monthDepense: monthSortie,
      todayRevenu: todayEntree,
      todayDepense: todaySortie,
    };
  }, [transactions]);

  return { transactions, loading, addTransaction, removeTransaction, refresh, stats };
}
