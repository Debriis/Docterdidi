const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper to map Supabase 'id' to '_id' for frontend compatibility
const mapPatient = (p) => (p ? { ...p, _id: p.id } : null);

// All routes require auth
router.use(authMiddleware);

// @route  GET /api/patients
// @desc   Get all patients for the logged-in doctor
router.get('/', async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctorId', req.doctor.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({ patients: patients.map(mapPatient) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/patients
// @desc   Add a new patient
router.post('/', async (req, res) => {
  try {
    const { name, age, phone, notes } = req.body;

    if (!name || !age || !phone) {
      return res.status(400).json({ message: 'Please provide name, age, and phone' });
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .insert([{ name, age, phone, notes, doctorId: req.doctor.id }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Patient added successfully', patient: mapPatient(patient) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/patients/:id
// @desc   Get a single patient
router.get('/:id', async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .eq('doctorId', req.doctor.id)
      .maybeSingle();

    if (error) throw error;
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({ patient: mapPatient(patient) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  DELETE /api/patients/:id
// @desc   Delete a patient
router.delete('/:id', async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id)
      .eq('doctorId', req.doctor.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
