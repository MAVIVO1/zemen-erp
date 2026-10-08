import express from "express";
import Employee from "../models/Employee.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const employees = await Employee.find().populate("department");
  res.json(employees);
});

router.get("/:id", async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate("department");
  if (!employee) return res.status(404).json({ message: "Not found" });
  res.json(employee);
});

router.post("/", requireRole("admin", "hr"), async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireRole("admin", "hr"), async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!employee) return res.status(404).json({ message: "Not found" });
  res.json(employee);
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
