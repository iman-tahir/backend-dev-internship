require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const users = []; // in-memory demo store

const signAccess = (u) =>
  jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES || '15m',
  });

const signRefresh = (u) =>
  jwt.sign({ sub: u.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    jwtid: crypto.randomUUID(), // makes every refresh token unique
  });

// ---------- Middleware ----------
const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  next();
};

// ---------- Routes ----------
// DEMO ONLY: letting the client choose its role is unsafe in a real app
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const user = {
    id: String(users.length + 1),
    email,
    password: await bcrypt.hash(password, 10),
    role: role === 'admin' ? 'admin' : 'user',
    refreshToken: null,
  };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  user.refreshToken = signRefresh(user);
  res.json({ accessToken: signAccess(user), refreshToken: user.refreshToken });
});

app.get('/profile', protect, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub);
  res.json({ id: user.id, email: user.email, role: user.role });
});

app.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin. Only admins can see this.' });
});

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    });
    const user = users.find((u) => u.id === decoded.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    user.refreshToken = signRefresh(user); // rotation: old one stops working
    res.json({ accessToken: signAccess(user), refreshToken: user.refreshToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

app.post('/logout', protect, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub);
  if (user) user.refreshToken = null;
  res.json({ message: 'Logged out' });
});

app.listen(process.env.PORT, () =>
  console.log(`JWT demo running on port ${process.env.PORT}`)
);