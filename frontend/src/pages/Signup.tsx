import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("org1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      setLoading(true);

      await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
        tenantId
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create Account</h2>
         <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
        >
          <option value="viewer">Viewer (Read only)</option>
          <option value="editor">Editor (Upload & manage videos)</option>
        </select>

        <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="tenant-select"
            >
            <option value="org1">Org 1</option>
            <option value="org2">Org 2</option>
            <option value="org3">Org 3</option>
          </select>


        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={!email || !password || loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {error && <div className="error">{error}</div>}

        <p style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
