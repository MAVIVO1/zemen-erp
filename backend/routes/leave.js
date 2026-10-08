import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await LeaveRequest.find().populate("employee"));
});

router.post("/", async (req, res) => {
  try {
    res.status(201).json(await LeaveRequest.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id/status", requireRole("admin", "hr"), async (req, res) => {
  const { status } = req.body;
  const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!leave) return res.status(404).json({ message: "Not found" });
  res.json(leave);
});

export default router;
