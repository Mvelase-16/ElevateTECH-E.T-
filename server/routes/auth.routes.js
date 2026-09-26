const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth.middleware');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    role = 'student',
    phone = ''
  } = req.body;

  // 1. Required field checks
  if (!first_name || !first_name.trim()) {
    return res.status(400).json({ error: 'First name is required.' });
  }
  if (!last_name || !last_name.trim()) {
    return res.status(400).json({ error: 'Last name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  // 2. Format checks
  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@wsu.ac.za).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirm_password && password !== confirm_password) {
    return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
  }

  const validRoles = ['student', 'staff', 'vendor', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'student';

  try {
    // 3. Uniqueness check
    if (db.isConnected()) {
      const existing = await db.query('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
      }

      // 4. Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [first_name.trim(), last_name.trim(), trimmedEmail, passwordHash, userRole, phone.trim()]
      );

      const userId = result.insertId;
      const fullName = `${first_name.trim()} ${last_name.trim()}`;

      // 5. Generate JWT token
      const token = jwt.sign(
        { id: userId, email: trimmedEmail, role: userRole, name: fullName },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Account registered successfully!',
        token,
        user: {
          id: userId,
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          name: fullName,
          email: trimmedEmail,
          role: userRole,
          phone: phone.trim()
        }
      });
    } else {
      // In-memory fallback
      const existing = db.memoryStore.users.find(u => u.email.toLowerCase() === trimmedEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userId = db.memoryStore.users.length + 1;
      const fullName = `${first_name.trim()} ${last_name.trim()}`;

      const newUser = {
        id: userId,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: trimmedEmail,
        password_hash: passwordHash,
        role: userRole,
        phone: phone.trim()
      };
      db.memoryStore.users.push(newUser);

      const token = jwt.sign(
        { id: userId, email: trimmedEmail, role: userRole, name: fullName },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Account registered successfully!',
        token,
        user: {
          id: userId,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          name: fullName,
          email: trimmedEmail,
          role: userRole,
          phone: newUser.phone
        }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again later.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Please enter your password.' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    let user = null;

    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } else {
      user = db.memoryStore.users.find(u => u.email.toLowerCase() === trimmedEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const fullName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : (user.name || user.email.split('@')[0]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: fullName,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// GET /api/auth/me (Verify active session)
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user = null;
    if (db.isConnected()) {
      const rows = await db.query('SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = db.memoryStore.users.find(u => u.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const fullName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : (user.name || user.email.split('@')[0]);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: fullName,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/auth/profile (Update personal details, e.g. phone number)
router.put('/profile', verifyToken, async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const userId = req.user.id;

  try {
    if (db.isConnected()) {
      await db.query(
        'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone) WHERE id = ?',
        [first_name ? first_name.trim() : null, last_name ? last_name.trim() : null, phone !== undefined ? phone.trim() : null, userId]
      );

      const rows = await db.query('SELECT id, first_name, last_name, email, role, phone, created_at FROM users WHERE id = ?', [userId]);
      const user = rows[0];
      const fullName = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : (user.name || user.email.split('@')[0]);

      return res.json({
        message: 'Personal details updated successfully!',
        user: {
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          name: fullName,
          email: user.email,
          role: user.role,
          phone: user.phone || ''
        }
      });
    } else {
      const user = db.memoryStore.users.find(u => u.id === userId);
      if (user) {
        if (first_name !== undefined) user.first_name = first_name.trim();
        if (last_name !== undefined) user.last_name = last_name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];

        return res.json({
          message: 'Personal details updated successfully!',
          user: {
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            name: fullName,
            email: user.email,
            role: user.role,
            phone: user.phone || ''
          }
        });
      }
      return res.status(404).json({ error: 'User profile not found.' });
    }
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update personal details.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    let user = null;

    if (db.isConnected()) {
      const rows = await db.query('SELECT id, first_name, last_name, email FROM users WHERE email = ?', [trimmedEmail]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = db.memoryStore.users.find(u => u.email.toLowerCase() === trimmedEmail);
    }

    let emailResult = null;

    // Security practice: Always return generic message whether user exists or not, but generate token if found
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      if (db.isConnected()) {
        // Invalidate prior unused tokens for this user
        await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE', [user.id]);

        // Insert new token
        await db.query(
          'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
          [user.id, tokenHash, expiresAt]
        );
      } else {
        db.memoryStore.passwordResetTokens = db.memoryStore.passwordResetTokens.filter(t => t.user_id !== user.id || t.used);
        db.memoryStore.passwordResetTokens.push({
          id: db.memoryStore.passwordResetTokens.length + 1,
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          used: false
        });
      }

      const recipientName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Student';
      emailResult = await sendPasswordResetEmail({
        toEmail: user.email,
        recipientName,
        resetToken: rawToken
      });
    } else {
      // Fake delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 400));
    }

    return res.json({
      message: 'If an account with that email exists, we have sent instructions to reset your password.',
      devResetLink: (emailResult && emailResult.resetLink) ? emailResult.resetLink : null
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request. Please try again later.' });
  }
});

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token || !token.trim()) {
    return res.status(400).json({ valid: false, error: 'Reset token is required.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    if (db.isConnected()) {
      const rows = await db.query(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = ? AND used = FALSE AND expires_at > NOW()',
        [tokenHash]
      );
      if (!rows || rows.length === 0) {
        return res.status(400).json({ valid: false, error: 'Password reset link is invalid or has expired.' });
      }
      return res.json({ valid: true });
    } else {
      const record = db.memoryStore.passwordResetTokens.find(
        t => t.token_hash === tokenHash && !t.used && new Date(t.expires_at) > new Date()
      );
      if (!record) {
        return res.status(400).json({ valid: false, error: 'Password reset link is invalid or has expired.' });
      }
      return res.json({ valid: true });
    }
  } catch (err) {
    console.error('Verify token error:', err);
    res.status(500).json({ valid: false, error: 'Failed to verify reset token.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, new_password, confirm_password } = req.body;

  if (!token || !token.trim()) {
    return res.status(400).json({ error: 'Password reset token is missing.' });
  }

  if (!new_password) {
    return res.status(400).json({ error: 'Please enter a new password.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirm_password && new_password !== confirm_password) {
    return res.status(400).json({ error: 'New password and confirmation do not match.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    let tokenRecord = null;

    if (db.isConnected()) {
      const rows = await db.query(
        'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = ? AND used = FALSE AND expires_at > NOW()',
        [tokenHash]
      );
      if (rows && rows.length > 0) tokenRecord = rows[0];
    } else {
      tokenRecord = db.memoryStore.passwordResetTokens.find(
        t => t.token_hash === tokenHash && !t.used && new Date(t.expires_at) > new Date()
      );
    }

    if (!tokenRecord) {
      return res.status(400).json({ 
        error: 'This password reset link is invalid or has expired. Please request a new one.' 
      });
    }

    // Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    if (db.isConnected()) {
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, tokenRecord.user_id]);
      await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [tokenRecord.id]);
    } else {
      const user = db.memoryStore.users.find(u => u.id === tokenRecord.user_id);
      if (user) user.password_hash = passwordHash;
      tokenRecord.used = true;
    }

    return res.json({
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again later.' });
  }
});

module.exports = router;
