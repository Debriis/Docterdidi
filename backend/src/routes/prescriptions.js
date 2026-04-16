const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper to map Supabase structure to Mongoose-like structure
const mapPrescription = (p) => {
  if (!p) return null;
  const res = { ...p, _id: p.id };
  if (res.patients) {
    res.patientId = { ...res.patients, _id: res.patients.id };
    delete res.patients;
  }
  if (res.doctors) {
    res.doctorId = { ...res.doctors, _id: res.doctors.id };
    delete res.doctors;
  }
  return res;
};

// All routes require auth
router.use(authMiddleware);

// @route  GET /api/prescriptions
// @desc   Get all prescriptions for the logged-in doctor
router.get('/', async (req, res) => {
  try {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*, patients!patientId(id, name, age, phone)')
      .eq('doctorId', req.doctor.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({ prescriptions: prescriptions.map(mapPrescription) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/prescriptions
// @desc   Create a new prescription and auto-generate today's medication log
router.post('/', async (req, res) => {
  try {
    const { patientId, medicineName, dosage, timing, customTiming, duration, instructions } = req.body;

    if (!patientId || !medicineName || !dosage || !timing || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify patient belongs to this doctor
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('doctorId', req.doctor.id)
      .maybeSingle();

    if (patientError) throw patientError;
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { data: prescription, error: presError } = await supabase
      .from('prescriptions')
      .insert([{
        patientId,
        doctorId: req.doctor.id,
        medicineName,
        dosage,
        timing,
        customTiming,
        duration,
        instructions
      }])
      .select('*, patients!patientId(id, name, age, phone)')
      .single();

    if (presError) throw presError;

    // Auto-create a medication log entry for today
    const { error: logError } = await supabase
      .from('medicationLogs')
      .insert([{
        prescriptionId: prescription.id,
        patientId,
        doctorId: req.doctor.id,
        status: 'Pending',
        scheduledDate: new Date()
      }]);

    if (logError) throw logError;

    res.status(201).json({ message: 'Prescription created successfully', prescription: mapPrescription(prescription) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/prescriptions/:id
// @desc   Get a single prescription (for QR data)
router.get('/:id', async (req, res) => {
  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select('*, patients!patientId(id, name, age, phone), doctors!doctorId(id, name, email, specialty)')
      .eq('id', req.params.id)
      .eq('doctorId', req.doctor.id)
      .maybeSingle();

    if (error) throw error;
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    
    res.json({ prescription: mapPrescription(prescription) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PATCH /api/prescriptions/:id/deactivate
// @desc   Deactivate a prescription
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .update({ isActive: false })
      .eq('id', req.params.id)
      .eq('doctorId', req.doctor.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    
    res.json({ message: 'Prescription deactivated', prescription: mapPrescription(prescription) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
