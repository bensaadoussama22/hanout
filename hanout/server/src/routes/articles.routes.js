import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function toResponse(row) {
  return {
    id: row.id,
    name: row.name,
    barcode: row.barcode,
    status: row.status,
    notes: row.notes,
    quantity: row.quantity,
    urgent: !!row.urgent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
  };
}

router.get('/', (req, res) => {
  const rows =
    req.user.role === 'admin'
      ? db
          .prepare(
            `SELECT articles.*, users.name AS created_by
             FROM articles JOIN users ON users.id = articles.user_id
             ORDER BY articles.created_at DESC`
          )
          .all()
      : db
          .prepare('SELECT * FROM articles WHERE user_id = ? ORDER BY created_at DESC')
          .all(req.user.id);
  res.json({ articles: rows.map(toResponse) });
});

router.post('/', (req, res) => {
  const { name, barcode, notes, quantity, urgent } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom de l'article est requis." });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO articles (id, user_id, name, barcode, status, notes, quantity, urgent, created_at, updated_at)
     VALUES (@id, @userId, @name, @barcode, 'fini', @notes, @quantity, @urgent, @now, @now)`
  ).run({
    id,
    userId: req.user.id,
    name: name.trim(),
    barcode: (barcode || '').trim(),
    notes: (notes || '').trim(),
    quantity: Number(quantity) > 0 ? Number(quantity) : 1,
    urgent: urgent ? 1 : 0,
    now,
  });

  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.status(201).json({ article: toResponse(row) });
});

router.patch('/:id', (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const existing = isAdmin
    ? db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id)
    : db.prepare('SELECT * FROM articles WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Article introuvable.' });

  const fields = req.body || {};
  const updated = {
    name: fields.name !== undefined ? String(fields.name).trim() : existing.name,
    barcode: fields.barcode !== undefined ? String(fields.barcode).trim() : existing.barcode,
    status: fields.status !== undefined ? fields.status : existing.status,
    notes: fields.notes !== undefined ? String(fields.notes).trim() : existing.notes,
    quantity: fields.quantity !== undefined ? Number(fields.quantity) : existing.quantity,
    urgent: fields.urgent !== undefined ? (fields.urgent ? 1 : 0) : existing.urgent,
    updatedAt: new Date().toISOString(),
    id: existing.id,
  };

  db.prepare(
    `UPDATE articles SET name = @name, barcode = @barcode, status = @status, notes = @notes,
     quantity = @quantity, urgent = @urgent, updated_at = @updatedAt WHERE id = @id`
  ).run(updated);

  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(existing.id);
  res.json({ article: toResponse(row) });
});

router.delete('/:id', (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const result = isAdmin
    ? db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id)
    : db.prepare('DELETE FROM articles WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Article introuvable.' });
  res.status(204).end();
});

export default router;
