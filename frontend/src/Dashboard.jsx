import { useEffect, useState } from "react";
import { getEmployees, runPayroll, getPayrollRuns } from "./api";

export default function Dashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [runs, setRuns] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setEmployees(await getEmployees());
      setRuns(await getPayrollRuns());
    } catch (err) {
      setMessage(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRunPayroll() {
    setMessage("Running payroll...");
    try {
      await runPayroll(Number(month), Number(year));
      setMessage("Payroll run complete.");
      loadData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>Zemen ERP — Payroll & HR</h1>
        <div>
          <span style={{ marginRight: 16 }}>{user.name} ({user.role})</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      </div>
      <div className="content">
        {message && <p className="error">{message}</p>}

        <div className="card">
          <h2 className="section-title">Employees ({employees.length})</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Position</th><th>Base Salary (ETB)</th></tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id}>
                  <td>{e.employeeId}</td>
                  <td>{e.fullName}</td>
                  <td>{e.position}</td>
                  <td>{e.baseSalaryETB?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="section-title">Run Payroll</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input style={{ width: 100 }} type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" />
            <input style={{ width: 120 }} type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
            <button onClick={handleRunPayroll}>Run Payroll</button>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Payroll Runs</h2>
          <table>
            <thead><tr><th>Period</th><th>Status</th><th>Employees Paid</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r._id}>
                  <td>{r.periodMonth}/{r.periodYear}</td>
                  <td>{r.status}</td>
                  <td>{r.lines.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
