const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router(); // 🔥 IMPORTANT

router.post('/register', async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { name, email, password, specialty } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    // Check existing user
    const { data: existingDoctor, error: checkError } = await supabase
      .from('doctors')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingDoctor) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 SAFE INSERT (ONLY EXISTING COLUMNS)
    const insertData = {
      name,
      email,
      password: hashedPassword,
      specialty: specialty || null // safe fallback
    };

    const { data: doctor, error } = await supabase
      .from('doctors')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("DB ERROR:", error);
      return res.status(500).json({
        message: error.message,
        details: error
      });
    }

    // JWT
    const token = jwt.sign(
      { id: doctor.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      doctor
    });

  } catch (err) {
    console.error("REGISTER CRASH:", err);
    res.status(500).json({
      message: err.message || "Server error"
    });
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

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
       console.error("DB ERROR:", error);
       return res.status(500).json({ message: error.message, details: error });
    }

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: doctor.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      doctor: { id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty },
    });
  } catch (err) {
    console.error("LOGIN CRASH:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current logged-in doctor profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('id, name, email, specialty')
      .eq('id', req.doctor.id)
      .maybeSingle();

    if (error) throw error;
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;