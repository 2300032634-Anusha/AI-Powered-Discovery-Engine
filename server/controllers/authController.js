import pool from '../config/db.js';
import crypto from 'crypto';

// Password hashing utility using PBKDF2
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { name, email, password, personaId = 'techie' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const emailClean = email.toLowerCase().trim();

    // Check existing user
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [emailClean]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const hashedPassword = hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, persona_id, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), emailClean, hashedPassword, personaId, avatarUrl]
    );

    const userId = result.insertId;

    // Fetch newly created user with persona info
    const [userRows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.persona_id, u.avatar_url, u.created_at, p.name as persona_name, p.color as persona_color
       FROM users u 
       LEFT JOIN user_personas p ON u.persona_id = p.id 
       WHERE u.id = ?`,
      [userId]
    );

    const newUser = userRows[0];

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        personaId: newUser.persona_id,
        personaName: newUser.persona_name,
        personaColor: newUser.persona_color,
        avatarUrl: newUser.avatar_url,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const emailClean = email.toLowerCase().trim();

    const [userRows] = await pool.execute(
      `SELECT u.*, p.name as persona_name, p.color as persona_color
       FROM users u 
       LEFT JOIN user_personas p ON u.persona_id = p.id 
       WHERE u.email = ?`,
      [emailClean]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = userRows[0];
    const isPasswordValid = verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        personaId: user.persona_id,
        personaName: user.persona_name,
        personaColor: user.persona_color,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/auth/me/:id
export async function getProfile(req, res) {
  try {
    const [userRows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.persona_id, u.avatar_url, u.created_at, p.name as persona_name, p.color as persona_color
       FROM users u 
       LEFT JOIN user_personas p ON u.persona_id = p.id 
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const u = userRows[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        personaId: u.persona_id,
        personaName: u.persona_name,
        personaColor: u.persona_color,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
