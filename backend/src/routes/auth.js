const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route  POST /api/auth/register
// @desc   Register a new doctor
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const { data: existingDoctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingDoctor) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: doctor, error } = await supabase
      .from('doctors')
      .insert([{ name, email, password: hashedPassword, specialty }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      doctor: { id: doctor.id, _id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  POST /api/auth/login
// @desc   Login doctor and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const { data: doctor } = await supabase
      .from('doctors')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      doctor: { id: doctor.id, _id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current logged-in doctor profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('id, name, email, specialty, "createdAt"')
      .eq('id', req.doctor.id)
      .maybeSingle();

    if (error) throw error;
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ doctor: { ...doctor, _id: doctor.id } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
