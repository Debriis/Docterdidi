const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET patients
router.get('/', async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', req.doctor.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ patients });
  } catch (err) {
    console.error("PATIENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ADD patient
router.post('/', async (req, res) => {
  try {
    const { name, age, phone, notes } = req.body;

    const { data: patient, error } = await supabase
      .from('patients')
      .insert([{
        name,
        age,
        phone,
        notes,
        doctor_id: req.doctor.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ patient });
  } catch (err) {
    console.error("PATIENT POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id)
      .eq('doctor_id', req.doctor.id);

    if (error) throw error;

    res.json({ message: 'Patient removed' });
  } catch (err) {
    console.error("PATIENT DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;