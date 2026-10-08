import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    position: String,
    region: String,
    phone: String,
    email: String,
    baseSalaryETB: { type: Number, required: true },
    pensionEnrolled: { type: Boolean, default: true },
    dateHired: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "leave", "terminated"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
