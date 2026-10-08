import express from "express";
import Department from "../models/Department.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await Department.find());
});

router.post("/", requireRole("admin", "hr"), async (req, res) => {
  try {
    res.status(201).json(await Department.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
