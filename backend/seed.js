// Seeds a demo Ethiopian client (Tana Textile & Garment PLC) with sample
// departments, employees, and a default admin login.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./models/User.js";
import Department from "./models/Department.js";
import Employee from "./models/Employee.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await Promise.all([User.deleteMany({}), Department.deleteMany({}), Employee.deleteMany({})]);

  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@zemen-erp.local",
    passwordHash,
    role: "admin",
  });

  const production = await Department.create({ name: "Production", description: "Textile production floor" });
  const admin = await Department.create({ name: "Administration", description: "HR & finance" });

  await Employee.insertMany([
    {
      fullName: "Selamawit Bekele",
      employeeId: "TTG-001",
      department: production._id,
      position: "Machine Operator",
      region: "Bahir Dar",
      baseSalaryETB: 6500,
    },
    {
      fullName: "Yonas Alemu",
      employeeId: "TTG-002",
      department: admin._id,
      position: "HR Officer",
      region: "Bahir Dar",
      baseSalaryETB: 9500,
    },
    {
      fullName: "Hiwot Tesfaye",
      employeeId: "TTG-003",
      department: production._id,
      position: "Line Supervisor",
      region: "Bahir Dar",
      baseSalaryETB: 11000,
    },
  ]);

  console.log("Seed complete. Login with admin@zemen-erp.local / admin123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
