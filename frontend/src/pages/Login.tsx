import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useState } from "react";
import * as yup from "yup";
import { loginSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  async function validateLogin() {
    try {
      await loginSchema.validate({ email, password });
      setAlertType("success");
      setAlertMessage("Login realizado com sucesso!");
      setTimeout(() => {
        navigate("/menu-atleta"); //ou adm
      }, 1500);
    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <Logo />
        <h1 className="auth-title">AQUOS</h1>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="auth-forgot">Esqueceu a sua senha?</div>

        <button className="auth-btn primary" onClick={validateLogin}>
          Entrar
        </button>

        {alertMessage && (
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={() => setAlertMessage("")}
          />
        )}

        <button className="auth-btn back" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>
    </div>
  );
}
