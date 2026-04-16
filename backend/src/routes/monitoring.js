const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET logs
router.get('/', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('monitoring')
      .select('*, patients(id, name, age, phone), prescriptions(id, medicine_name, dosage, timing)')
      .eq('doctor_id', req.doctor.id)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    const summary = {
      total: logs.length,
      taken: logs.filter(l => l.status === 'Taken').length,
      missed: logs.filter(l => l.status === 'Missed').length,
      pending: logs.filter(l => l.status === 'Pending').length,
    };

    res.json({ logs, summary });
  } catch (err) {
    console.error("MONITOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE log status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data: log, error } = await supabase
      .from('monitoring')
      .update({ status, taken_at: status === 'Taken' ? new Date() : null })
      .eq('id', req.params.id)
      .eq('doctor_id', req.doctor.id)
      .select('*, patients(id, name, age, phone), prescriptions(id, medicine_name, dosage, timing)')
      .single();

    if (error) throw error;

    res.json({ log });
  } catch (err) {
    console.error("MONITOR UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;