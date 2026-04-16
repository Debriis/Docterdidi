const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const mapPatient = (p) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id,
    doctorId: p.doctor_id,
    createdAt: p.created_at
  };
};

// GET patients
router.get('/', async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', req.doctor.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    res.json({ patients: patients.map(mapPatient) });
  } catch (err) {
    console.error("PATIENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ADD patient
router.post('/', async (req, res) => {
  try {
    let { name, age, phone, notes } = req.body;
    
    // Frontend sometimes passes age as string
    age = Number(age);

    const { data: patient, error } = await supabase
      .from('patients')
      .insert([{
        name,
        age,
        phone,
        notes,
        doctor_id: req.doctor.id
      }])
      .select('*')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ patient: mapPatient(patient) });
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

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Patient removed' });
  } catch (err) {
    console.error("PATIENT DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;