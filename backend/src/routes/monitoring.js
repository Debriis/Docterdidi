const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET logs
router.get('/', async (req, res) => {
  try {
    // 1. Fetch raw monitoring logs
    const { data: logsData, error: logsError } = await supabase
      .from('monitoring')
      .select('*')
      .eq('doctor_id', req.doctor.id)
      .order('created_at', { ascending: true });

    if (logsError) {
      console.error(logsError);
      return res.status(500).json({ message: logsError.message });
    }

    // 2. Fetch all patients and prescriptions for this doctor to bind in memory
    // This perfectly bypasses PGRST200 relation issues while maintaining frontend support!
    const { data: patientsData } = await supabase.from('patients').select('*').eq('doctor_id', req.doctor.id);
    const { data: prescriptionsData } = await supabase.from('prescriptions').select('*').eq('doctor_id', req.doctor.id);

    const patientsMap = {};
    if (patientsData) {
      patientsData.forEach(p => { patientsMap[p.id] = p; });
    }

    const presMap = {};
    if (prescriptionsData) {
      prescriptionsData.forEach(p => { presMap[p.id] = p; });
    }

    // 3. Reconstruct logs array exactly as frontend expects
    const logs = logsData.map(l => ({
      ...l,
      id: l.id,
      status: l.status,
      scheduled_date: l.created_at,
      taken_at: l.taken_at,
      patients: patientsMap[l.patient_id] || { name: 'Unknown' },
      prescriptions: presMap[l.prescription_id] || { medicine_name: 'Unknown', dosage: 'Unknown', timing: 'Unknown' }
    }));

    const summary = {
      total: logs.length,
      taken: logs.filter(l => l.status === 'Taken').length,
      missed: logs.filter(l => l.status === 'Missed').length,
      pending: logs.filter(l => l.status === 'Pending').length,
    };

    res.json({ logs, summary });
  } catch (err) {
    console.error("MONITOR GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE log status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data: logRaw, error } = await supabase
      .from('monitoring')
      .update({ status, taken_at: status === 'Taken' ? new Date() : null })
      .eq('id', req.params.id)
      .eq('doctor_id', req.doctor.id)
      .select('*')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }

    // Fetch singular items for binding
    const { data: patient } = await supabase.from('patients').select('*').eq('id', logRaw.patient_id).maybeSingle();
    const { data: pres } = await supabase.from('prescriptions').select('*').eq('id', logRaw.prescription_id).maybeSingle();

    const log = {
      ...logRaw,
      patients: patient || { name: 'Unknown' },
      prescriptions: pres || { medicine_name: 'Unknown', dosage: 'Unknown', timing: 'Unknown' }
    };

    res.json({ log });
  } catch (err) {
    console.error("MONITOR UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;