// routes/userRoutes.js
import express from "express";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/usersController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas de usuarios
router.get("/", authenticateToken, listUsers);       // Listar usuarios
router.post("/", authenticateToken, createUser);     // Crear usuario
router.put("/:id", authenticateToken, updateUser);   // Modificar usuario
router.delete("/:id", authenticateToken, deleteUser); // Eliminar usuario

export default router;
