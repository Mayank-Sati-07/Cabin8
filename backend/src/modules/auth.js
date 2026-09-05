const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../core/prismaClient');
const { authenticate, authorize } = require('../middleware/rbac');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const VALID_ROLES = ['ADMIN', 'ACCOUNTANT', 'USER'];

function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
  return regex.test(password);
}

// Maps a Prisma unique-constraint violation (P2002) to a friendly message.
// Acts as a safety net behind the pre-checks below for race conditions
// (e.g. two signups with the same email/loginId submitted at once).
function friendlyUniqueError(err) {
  const target = err.meta?.target;
  const field = Array.isArray(target) ? target[0] : target;

  if (field?.includes('loginId')) return 'Login Id already exists';
  if (field?.includes('email')) return 'Email already exists';
  if (field?.includes('contactId')) return 'This contact is already linked to another user account';
  return 'A user with these details already exists';
}

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Login Id and Password are required' });
    }

    const user = await prisma.user.findUnique({ where: { loginId } });
    if (!user) return res.status(401).json({ error: 'Invalid Login Id or Password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid Login Id or Password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, contactId: user.contactId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIGN UP -> always creates an ACCOUNTANT (per spec)
router.post('/signup', async (req, res) => {
  try {
    const { name, loginId, email, password } = req.body;

    if (!name || !loginId || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (loginId.length < 6 || loginId.length > 12) {
      return res.status(400).json({ error: 'Login Id must be 6-12 characters' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password needs uppercase, lowercase, special character, min 8 characters'
      });
    }

    const loginExists = await prisma.user.findUnique({ where: { loginId } });
    if (loginExists) return res.status(400).json({ error: 'Login Id already exists' });

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, loginId, email, password: hashed, role: 'ACCOUNTANT' }
    });

    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: friendlyUniqueError(err) });
    res.status(500).json({ error: err.message });
  }
});

// CREATE USER -> Admin only, any role (e.g. creates a portal USER linked to a Contact)
router.post('/users', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, loginId, email, password, role, contactId } = req.body;

    if (!name || !loginId || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (loginId.length < 6 || loginId.length > 12) {
      return res.status(400).json({ error: 'Login Id must be 6-12 characters' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password needs uppercase, lowercase, special character, min 8 characters'
      });
    }

    const loginExists = await prisma.user.findUnique({ where: { loginId } });
    if (loginExists) return res.status(400).json({ error: 'Login Id already exists' });

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        loginId,
        email,
        password: hashed,
        role,
        contactId: contactId ? parseInt(contactId) : null
      }
    });

    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: friendlyUniqueError(err) });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;