// controllers/usersController.js
import pool from "../db.js";
import bcrypt from "bcryptjs";


// Listar usuarios
export async function listUsers(req, res) {
  try {
    const result = await pool.query("SELECT id, nombre, apellido, email, estado, deleted_at FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al listar usuarios", error: err.message });
  }
}

// Crear usuario
export async function createUser(req, res) {
  try {
    const { nombre, apellido, email, estado, password } = req.body;

    if (!nombre || !apellido || !email || !password)
      return res.status(400).json({ message: "Todos los campos son obligatorios" });

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: "El usuario ya existe" });

    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO users (nombre, apellido, email, estado, password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, apellido, email, estado, deleted_at",
      [nombre, apellido, email, estado || "activo", hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al crear usuario", error: err.message });
  }
}

// Actualizar usuario
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, estado, password } = req.body;

    let query, params;
    if (password) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
      const hash = await bcrypt.hash(password, saltRounds);
      query = "UPDATE users SET nombre=$1, apellido=$2, email=$3, estado=$4, password_hash=$5 WHERE id=$6 RETURNING *";
      params = [nombre, apellido, email, estado, hash, id];
    } else {
      query = "UPDATE users SET nombre=$1, apellido=$2, email=$3, estado=$4 WHERE id=$5 RETURNING *";
      params = [nombre, apellido, email, estado, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario", error: err.message });
  }
}

// Eliminar usuario
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario", error: err.message });
  }
}
