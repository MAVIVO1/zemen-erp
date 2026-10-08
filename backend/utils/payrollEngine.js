// Ethiopian payroll calculation engine.
// Figures below are seeded as configurable defaults and should be verified
// against the current proclamations before production use:
//   - PAYE brackets: Income Tax Proclamation No. 979/2016
//   - Pension: Proclamation No. 907/2015 (7% employee / 11% employer of basic salary)
//   - Overtime: Labour Proclamation No. 1156/2019

export const PAYE_BRACKETS = [
  { upTo: 600, rate: 0, deduction: 0 },
  { upTo: 1650, rate: 0.1, deduction: 60 },
  { upTo: 3200, rate: 0.15, deduction: 142.5 },
  { upTo: 5250, rate: 0.2, deduction: 302.5 },
  { upTo: 7800, rate: 0.25, deduction: 565 },
  { upTo: 10900, rate: 0.3, deduction: 955 },
  { upTo: Infinity, rate: 0.35, deduction: 1500 },
];

export const PENSION_EMPLOYEE_RATE = 0.07;
export const PENSION_EMPLOYER_RATE = 0.11;

export function calculatePAYE(taxableIncomeETB) {
  const bracket = PAYE_BRACKETS.find((b) => taxableIncomeETB <= b.upTo);
  const paye = taxableIncomeETB * bracket.rate - bracket.deduction;
  return Math.max(0, Math.round(paye * 100) / 100);
}

// Overtime multipliers per Labour Proclamation No. 1156/2019, Art. 68:
//   - Weekday overtime: 1.25x hourly rate
//   - Night work (10pm-6am): 1.5x
//   - Weekly rest day: 2x
//   - Public holiday: 2.5x
export function calculateOvertimePay(baseSalaryETB, overtimeHours, multiplier = 1.25) {
  const monthlyWorkingHours = 22 * 8; // 22 working days x 8 hours
  const hourlyRate = baseSalaryETB / monthlyWorkingHours;
  return Math.round(hourlyRate * overtimeHours * multiplier * 100) / 100;
}

export function runPayrollForEmployee(employee, overtimeHours = 0, overtimeMultiplier = 1.25) {
  const baseSalaryETB = employee.baseSalaryETB;
  const overtimePayETB = calculateOvertimePay(baseSalaryETB, overtimeHours, overtimeMultiplier);
  const grossSalaryETB = baseSalaryETB + overtimePayETB;

  const pensionEmployeeETB = employee.pensionEnrolled
    ? Math.round(baseSalaryETB * PENSION_EMPLOYEE_RATE * 100) / 100
    : 0;
  const pensionEmployerETB = employee.pensionEnrolled
    ? Math.round(baseSalaryETB * PENSION_EMPLOYER_RATE * 100) / 100
    : 0;

  // Pension contribution is deducted before PAYE (pre-tax).
  const taxablePayETB = grossSalaryETB - pensionEmployeeETB;
  const payeETB = calculatePAYE(taxablePayETB);

  const netPayETB = Math.round((grossSalaryETB - pensionEmployeeETB - payeETB) * 100) / 100;

  return {
    employee: employee._id,
    grossSalaryETB: Math.round(grossSalaryETB * 100) / 100,
    overtimePayETB,
    taxablePayETB: Math.round(taxablePayETB * 100) / 100,
    payeETB,
    pensionEmployeeETB,
    pensionEmployerETB,
    netPayETB,
  };
}
