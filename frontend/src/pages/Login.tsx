import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <Logo />
        <h1 className="auth-title">AQUOS</h1>

        <input className="auth-input" type="email" placeholder="Email" />
        <input className="auth-input" type="password" placeholder="Senha" />

        <div className="auth-forgot">Esqueceu a sua senha?</div>

        <button className="auth-btn primary">Próximo</button>

        <button className="auth-btn back" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>
    </div>
  );
}