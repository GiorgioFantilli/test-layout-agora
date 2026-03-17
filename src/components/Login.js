import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-placeholder">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1>Datapolis</h1>
          <p>Inserisci le tue credenziali per accedere</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nome.utente"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {loginMutation.isError && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>
                {loginMutation.error.message || "Credenziali non valide"}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? (
              <span className="spinner"></span>
            ) : (
              "Accedi"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; 2026 Datapolis. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
