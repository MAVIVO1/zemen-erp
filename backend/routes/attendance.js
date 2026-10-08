import express from "express";
import Attendance from "../models/Attendance.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { employee, from, to } = req.query;
  const filter = {};
  if (employee) filter.employee = employee;
  if (from || to) filter.date = {};
  if (from) filter.date.$gte = new Date(from);
  if (to) filter.date.$lte = new Date(to);
  res.json(await Attendance.find(filter).populate("employee"));
});

router.post("/", requireRole("admin", "hr"), async (req, res) => {
  try {
    res.status(201).json(await Attendance.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
