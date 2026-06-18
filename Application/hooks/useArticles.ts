import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

export interface Article {
  id: string;
  name: string;
  barcode?: string;
  notes?: string;
  quantity: number;
  status: 'fini' | 'achete';
  urgent: boolean;
  createdAt: string;
  createdBy?: string;
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await apiFetch('/articles');
    setArticles(data.articles);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addArticle = useCallback(async (article: Partial<Article>) => {
    const data = await apiFetch('/articles', {
      method: 'POST',
      body: {
        name: article.name,
        barcode: article.barcode || '',
        notes: article.notes || '',
        quantity: article.quantity || 1,
        urgent: article.urgent || false,
      },
    });
    setArticles((prev) => [data.article, ...prev]);
    return data.article;
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const data = await apiFetch(`/articles/${id}`, { method: 'PATCH', body: { status } });
    setArticles((prev) => prev.map((a) => (a.id === id ? data.article : a)));
  }, []);

  const removeArticle = useCallback(async (id: string) => {
    await apiFetch(`/articles/${id}`, { method: 'DELETE' });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markInStore = useCallback((id: string) => removeArticle(id), [removeArticle]);

  return { articles, loading, refresh, addArticle, updateStatus, removeArticle, markInStore };
}
