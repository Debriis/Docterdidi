const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Safe mapper
const mapPrescription = (p, patientsMap = {}) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id,
    patientId: p.patient_id,
    doctorId: p.doctor_id,
    medicineName: p.medicine_name,
    isActive: p.is_active,
    createdAt: p.created_at,
    patients: patientsMap[p.patient_id] || { name: 'Unknown' }
  };
};

// ✅ GET prescriptions
router.get('/', async (req, res) => {
  try {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', req.doctor.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error);
      return res.status(500).json({ message: error.message });
    }

    // fetch patients
    const { data: patientsData } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', req.doctor.id);

    const patientsMap = {};
    patientsData?.forEach(p => {
      patientsMap[p.id] = p;
    });

    res.json({
      prescriptions: prescriptions.map(p => mapPrescription(p, patientsMap))
    });

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST prescription (FIXED)
router.post('/', async (req, res) => {
  try {
    const {
      patient_id,   // ✅ frontend se ye aa raha hai
      medicine_name,
      dosage,
      timing,
      duration,
      instructions
    } = req.body;

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .insert([{
        patient_id,
        doctor_id: req.doctor.id,
        medicine_name,
        dosage,
        timing,
        duration,
        instructions
      }])
      .select('*')
      .single();

    if (error) {
      console.error("INSERT ERROR:", error);
      return res.status(500).json({ message: error.message });
    }

    // OPTIONAL monitoring (SAFE VERSION)
    await supabase.from('monitoring').insert([{
      prescription_id: prescription.id,
      patient_id: prescription.patient_id,
      doctor_id: req.doctor.id,
      status: 'Pending'
      // ❌ removed scheduled_date
    }]);

    // fetch patient
    const { data: pat } = await supabase
      .from('patients')
      .select('*')
      .eq('id', prescription.patient_id)
      .maybeSingle();

    const patientsMap = {};
    if (pat) patientsMap[pat.id] = pat;

    res.status(201).json({
      prescription: mapPrescription(prescription, patientsMap)
    });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ DEACTIVATE
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .eq('doctor_id', req.doctor.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    if (!prescription) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deactivated', prescription });

  } catch (err) {
    console.error("PATCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;  