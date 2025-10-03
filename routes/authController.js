const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Email y password son requeridos' });

    const result = await db.query('SELECT id, nombre, apellido, email, password_hash, estado FROM users WHERE email = $1', [email]);
    if(result.rows.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if(!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    res.json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, estado: user.estado }});
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
