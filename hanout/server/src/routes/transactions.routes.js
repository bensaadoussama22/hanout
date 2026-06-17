import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { TX_GROUP_IDS, buildDesignation, getGroup } from '../constants.js';

const router = Router();
router.use(requireAuth);

function toResponse(row) {
  return {
    id: row.id,
    date: row.date,
    group: row.group_id,
    name: row.name,
    designation: buildDesignation(row.group_id, row.name),
    section: getGroup(row.group_id).section,
    entree: row.entree,
    sortie: row.sortie,
    description: row.description,
    hasPhoto: !!row.has_photo,
    createdAt: row.created_at,
  };
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC')
    .all(req.user.id);
  res.json({ transactions: rows.map(toResponse) });
});

router.post('/', (req, res) => {
  const { date, group, name, entree, sortie, description, hasPhoto, photo } = req.body || {};

  if (!date || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: 'Date invalide.' });
  }
  if (!TX_GROUP_IDS.includes(group)) {
    return res.status(400).json({ error: 'Groupe de transaction invalide.' });
  }
  const e = Number(entree) || 0;
  const s = Number(sortie) || 0;
  if (e < 0 || s < 0) {
    return res.status(400).json({ error: 'Les montants doivent être positifs.' });
  }
  if (e === 0 && s === 0) {
    return res.status(400).json({ error: 'Indiquez un montant en Entrée ou en Sortie.' });
  }

  const groupDef = getGroup(group);
  if (!groupDef.fixedName && groupDef.nameLabel && !(name && name.trim())) {
    return res.status(400).json({ error: `Le champ "${groupDef.nameLabel}" est requis.` });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO transactions (id, user_id, date, group_id, name, entree, sortie, description, has_photo, photo, created_at)
     VALUES (@id, @userId, @date, @group, @name, @entree, @sortie, @description, @hasPhoto, @photo, @createdAt)`
  ).run({
    id,
    userId: req.user.id,
    date: new Date(date).toISOString(),
    group,
    name: (name || '').trim(),
    entree: e,
    sortie: s,
    description: (description || '').trim(),
    hasPhoto: hasPhoto ? 1 : 0,
    photo: hasPhoto && photo ? photo : null,
    createdAt,
  });

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.status(201).json({ transaction: toResponse(row) });
});

router.get('/:id/photo', (req, res) => {
  const row = db
    .prepare('SELECT photo FROM transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!row || !row.photo) return res.status(404).json({ error: 'Photo introuvable.' });
  res.json({ photo: row.photo });
});

router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Transaction introuvable.' });
  res.status(204).end();
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM transactions WHERE user_id = ?').run(req.user.id);
  res.status(204).end();
});

export default router;
