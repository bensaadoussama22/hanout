import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { generateRapportExcel } from '../services/excelReport.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/excel', async (req, res) => {
  const { from, to } = req.query;

  let query = 'SELECT * FROM transactions WHERE 1 = 1';
  const params = [];

  if (from) {
    query += ' AND date >= ?';
    params.push(new Date(from).toISOString());
  }
  if (to) {
    query += ' AND date <= ?';
    params.push(new Date(to).toISOString());
  }
  query += ' ORDER BY date ASC';

  const transactions = db.prepare(query).all(...params);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  const buffer = await generateRapportExcel(transactions, user);

  const filename = `rapport-gestion-${new Date().toISOString().split('T')[0]}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
});

export default router;
