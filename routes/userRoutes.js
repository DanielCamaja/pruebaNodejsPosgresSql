import express from "express";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/usersController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Listar usuarios
router.get("/list", authenticateToken, listUsers);

// Crear usuario
router.post("/create", authenticateToken, createUser);

// Actualizar usuario
router.put("/update/:id", authenticateToken, updateUser);

// Eliminar usuario
router.delete("/delete/:id", authenticateToken, deleteUser);

export default router;
