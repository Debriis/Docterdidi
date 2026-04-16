const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
console.log("🔥 PRESCRIPTIONS ROUTE HIT");
const router = express.Router();

router.use(authMiddleware);

const mapPrescription = (p) => ({
  ...p,
  _id: p.id,
  patientId: p.patient_id // 🔥 CRITICAL FIX
});

// GET
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', req.doctor.id);

    if (error) throw error;

    res.json({ prescriptions: data.map(mapPrescription) });

  } catch (err) {
    console.error("PRES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { patientId, medicineName, dosage, timing, duration } = req.body;

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([{
        patient_id: patientId,
        doctor_id: req.doctor.id,
        medicine_name: medicineName,
        dosage,
        timing,
        duration
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      prescription: mapPrescription(data)
    });

  } catch (err) {
    console.error("PRES POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;