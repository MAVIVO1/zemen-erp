import express from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import PayrollRun from "../models/PayrollRun.js";
import { runPayrollForEmployee } from "../utils/payrollEngine.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// Run payroll for a given month/year across all active employees.
router.post("/run", requireRole("admin", "hr"), async (req, res) => {
  try {
    const { periodMonth, periodYear } = req.body;
    const employees = await Employee.find({ status: "active" });

    const lines = [];
    for (const employee of employees) {
      const attendance = await Attendance.find({
        employee: employee._id,
        date: {
          $gte: new Date(periodYear, periodMonth - 1, 1),
          $lt: new Date(periodYear, periodMonth, 1),
        },
      });
      const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
      lines.push(runPayrollForEmployee(employee, overtimeHours));
    }

    const run = await PayrollRun.findOneAndUpdate(
      { periodMonth, periodYear },
      { periodMonth, periodYear, lines, status: "draft", runDate: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json(run);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/runs", async (req, res) => {
  res.json(await PayrollRun.find().sort({ periodYear: -1, periodMonth: -1 }));
});

router.patch("/runs/:id/finalize", requireRole("admin"), async (req, res) => {
  const run = await PayrollRun.findByIdAndUpdate(req.params.id, { status: "finalized" }, { new: true });
  if (!run) return res.status(404).json({ message: "Not found" });
  res.json(run);
});

// Generate a PDF payslip for one employee within a payroll run.
router.get("/runs/:id/payslip/:employeeId", async (req, res) => {
  const run = await PayrollRun.findById(req.params.id);
  if (!run) return res.status(404).json({ message: "Payroll run not found" });

  const line = run.lines.find((l) => String(l.employee) === req.params.employeeId);
  if (!line) return res.status(404).json({ message: "No payslip line for this employee" });

  const employee = await Employee.findById(req.params.employeeId);

  const dir = path.resolve("payslips");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const filePath = path.join(dir, `payslip-${employee.employeeId}-${run.periodMonth}-${run.periodYear}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));
  doc.pipe(res);

  doc.fontSize(18).text("Zemen ERP — Payslip", { align: "center" });
  doc.moveDown();
  doc.fontSize(11);
  doc.text(`Employee: ${employee.fullName} (${employee.employeeId})`);
  doc.text(`Period: ${run.periodMonth}/${run.periodYear}`);
  doc.moveDown();
  doc.text(`Gross Salary: ETB ${line.grossSalaryETB.toFixed(2)}`);
  doc.text(`Overtime Pay: ETB ${line.overtimePayETB.toFixed(2)}`);
  doc.text(`Taxable Pay: ETB ${line.taxablePayETB.toFixed(2)}`);
  doc.text(`PAYE (Income Tax): ETB ${line.payeETB.toFixed(2)}`);
  doc.text(`Pension (Employee 7%): ETB ${line.pensionEmployeeETB.toFixed(2)}`);
  doc.text(`Pension (Employer 11%): ETB ${line.pensionEmployerETB.toFixed(2)}`);
  doc.moveDown();
  doc.fontSize(14).text(`Net Pay: ETB ${line.netPayETB.toFixed(2)}`, { underline: true });

  doc.end();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=payslip-${employee.employeeId}.pdf`);
});

export default router;
