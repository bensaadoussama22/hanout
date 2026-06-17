import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/articles')
      .then((data) => setArticles(data.articles))
      .finally(() => setLoading(false));
  }, []);

  const addArticle = useCallback(async (article) => {
    const data = await apiFetch('/articles', {
      method: 'POST',
      body: {
        name: article.name,
        barcode: article.barcode || '',
        notes: article.notes || '',
        quantity: article.quantity || 1,
      },
    });
    setArticles((prev) => [data.article, ...prev]);
    return data.article;
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    const data = await apiFetch(`/articles/${id}`, { method: 'PATCH', body: { status } });
    setArticles((prev) => prev.map((a) => (a.id === id ? data.article : a)));
  }, []);

  const removeArticle = useCallback(async (id) => {
    await apiFetch(`/articles/${id}`, { method: 'DELETE' });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateArticle = useCallback(async (id, fields) => {
    const data = await apiFetch(`/articles/${id}`, { method: 'PATCH', body: fields });
    setArticles((prev) => prev.map((a) => (a.id === id ? data.article : a)));
  }, []);

  // Mark as 'en magasin' = delete from list
  const markInStore = useCallback((id) => removeArticle(id), [removeArticle]);

  return { articles, loading, addArticle, updateStatus, removeArticle, updateArticle, markInStore };
}
