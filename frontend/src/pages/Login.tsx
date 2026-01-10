import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        email,
        password
      });

      auth?.login(res.data.token);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={!email || !password || loading}
          style={{ marginTop: 10 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <div className="error">{error}</div>}

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
          New here?{" "}
          <Link to="/signup" style={{ fontWeight: 500 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
