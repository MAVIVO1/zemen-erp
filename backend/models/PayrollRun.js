import mongoose from "mongoose";

const payslipLineSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    grossSalaryETB: Number,
    overtimePayETB: Number,
    taxablePayETB: Number,
    payeETB: Number,
    pensionEmployeeETB: Number,
    pensionEmployerETB: Number,
    netPayETB: Number,
  },
  { _id: false }
);

const payrollRunSchema = new mongoose.Schema(
  {
    periodMonth: { type: Number, required: true },
    periodYear: { type: Number, required: true },
    runDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "finalized"], default: "draft" },
    lines: [payslipLineSchema],
  },
  { timestamps: true }
);

payrollRunSchema.index({ periodMonth: 1, periodYear: 1 }, { unique: true });

export default mongoose.model("PayrollRun", payrollRunSchema);
