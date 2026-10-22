import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { syncDatabases } from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || 'env-user',
      username: user.username || user.name || 'admin',
      role: user.role || 'admin',
    },
    process.env.JWT_SECRET || 'demo-secret',
    { expiresIn: '7d' }
  );
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === envUsername && password === envPassword) {
      const token = generateToken({ username: envUsername, role: 'admin' });
      return res.json({
        message: 'Login successful',
        token,
        user: {
          username: envUsername,
          role: 'admin',
        },
      });
    }

    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(existingUser);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        username: existingUser.username,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: 'admin' });
    await syncDatabases();

    const token = generateToken(user);

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  return res.json({
    user: {
      username: req.user.username,
      role: req.user.role,
    },
  });
};
