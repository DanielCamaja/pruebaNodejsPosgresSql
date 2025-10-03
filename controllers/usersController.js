const db = require('../db');
const bcrypt = require('bcrypt');
const logger = require('../logger');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// Lista usuarios
async function listUsers(req, res, next) {
  try {
    const result = await db.query('SELECT id, nombre, apellido, email, estado, deleted_at FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    logger.error(err);
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { nombre, apellido, email, estado, password } = req.body;
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    // si existen
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(409).json({ message: 'Usuario ya existe' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      'INSERT INTO users (nombre, apellido, email, estado, password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, apellido, email, estado, deleted_at',
      [nombre, apellido, email, estado || 'active', hash]
    );

   
    const io = req.app.get('io');
    if (io) {
      const all = await db.query('SELECT id, nombre, apellido, email, estado, deleted_at FROM users ORDER BY id DESC');
      io.emit('usersUpdated', all.rows);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error(err);
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, estado, password } = req.body;
    if (!nombre || !apellido || !email) return res.status(400).json({ message: 'Campos requeridos faltan' });

    
    let q, params;
    if (password) {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      q = 'UPDATE users SET nombre=$1, apellido=$2, email=$3, estado=$4, password_hash=$5 WHERE id=$6 RETURNING id, nombre, apellido, email, estado, deleted_at';
      params = [nombre, apellido, email, estado || 'active', hash, id];
    } else {
      q = 'UPDATE users SET nombre=$1, apellido=$2, email=$3, estado=$4 WHERE id=$5 RETURNING id, nombre, apellido, email, estado, deleted_at';
      params = [nombre, apellido, email, estado || 'active', id];
    }
    const result = await db.query(q, params);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    
    const io = req.app.get('io');
    if (io) {
      const all = await db.query('SELECT id, nombre, apellido, email, estado, deleted_at FROM users ORDER BY id DESC');
      io.emit('usersUpdated', all.rows);
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error(err);
    next(err);
  }
}

// delete
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query('UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    // emit socket update
    const io = req.app.get('io');
    if (io) {
      const all = await db.query('SELECT id, nombre, apellido, email, estado, deleted_at FROM users ORDER BY id DESC');
      io.emit('usersUpdated', all.rows);
    }

    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
