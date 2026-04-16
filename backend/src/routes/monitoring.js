const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper to map Supabase structure to Mongoose-like structure
const mapLog = (l) => {
  if (!l) return null;
  const res = { ...l, _id: l.id };
  if (res.patients) {
    res.patientId = { ...res.patients, _id: res.patients.id };
    delete res.patients;
  }
  if (res.prescriptions) {
    res.prescriptionId = { ...res.prescriptions, _id: res.prescriptions.id };
    delete res.prescriptions;
  }
  return res;
};

// All routes require auth
router.use(authMiddleware);

// @route  GET /api/monitoring
// @desc   Get medication logs for the doctor — simulates real-time by randomly flipping Pending → Taken/Missed
router.get('/', async (req, res) => {
  try {
    // Simulate real-time: randomly update Pending logs
    const { data: pendingLogs, error: pendingError } = await supabase
      .from('medicationLogs')
      .select('id')
      .eq('doctorId', req.doctor.id)
      .eq('status', 'Pending');

    if (pendingError) throw pendingError;

    if (pendingLogs && pendingLogs.length > 0) {
      const updatePromises = pendingLogs.map(async (log) => {
        const rand = Math.random();
        if (rand < 0.4) {
          // 40% chance: mark as Taken
          return supabase
            .from('medicationLogs')
            .update({ status: 'Taken', takenAt: new Date() })
            .eq('id', log.id);
        } else if (rand < 0.65) {
          // 25% chance: mark as Missed
          return supabase.from('medicationLogs').update({ status: 'Missed' }).eq('id', log.id);
        }
        return null;
      });

      await Promise.all(updatePromises.filter(Boolean));
    }

    // Fetch all logs with populated data
    const { data: logsData, error } = await supabase
      .from('medicationLogs')
      .select('*, patients!patientId(id, name, age, phone), prescriptions!prescriptionId(id, medicineName, dosage, timing)')
      .eq('doctorId', req.doctor.id)
      .order('scheduledDate', { ascending: false })
      .limit(50);

    if (error) throw error;

    const logs = logsData ? logsData.map(mapLog) : [];

    // Summary stats
    const total = logs.length;
    const taken = logs.filter((l) => l.status === 'Taken').length;
    const missed = logs.filter((l) => l.status === 'Missed').length;
    const pending = logs.filter((l) => l.status === 'Pending').length;

    res.json({ logs, summary: { total, taken, missed, pending } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  PATCH /api/monitoring/:id
// @desc   Manually update a medication log status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Taken', 'Missed', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { data: log, error } = await supabase
      .from('medicationLogs')
      .update({ status, takenAt: status === 'Taken' ? new Date() : null })
      .eq('id', req.params.id)
      .eq('doctorId', req.doctor.id)
      .select('*, patients!patientId(id, name, age, phone), prescriptions!prescriptionId(id, medicineName, dosage, timing)')
      .maybeSingle();

    if (error) throw error;
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    res.json({ message: 'Status updated', log: mapLog(log) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
