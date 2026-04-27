import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Inicial() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Logo />
        <h1 className="auth-title">AQUOS</h1>

        <button className="auth-btn" onClick={() => navigate("/register")}>
          Criar conta
        </button>

        <button className="auth-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
}