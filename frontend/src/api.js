const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("zemen_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

export async function getEmployees() {
  const res = await fetch(`${API_URL}/employees`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load employees");
  return res.json();
}

export async function runPayroll(periodMonth, periodYear) {
  const res = await fetch(`${API_URL}/payroll/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ periodMonth, periodYear }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Payroll run failed");
  return res.json();
}

export async function getPayrollRuns() {
  const res = await fetch(`${API_URL}/payroll/runs`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load payroll runs");
  return res.json();
}
