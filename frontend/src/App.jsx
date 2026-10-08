import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  function handleLogout() {
    localStorage.removeItem("zemen_token");
    setUser(null);
  }

  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
