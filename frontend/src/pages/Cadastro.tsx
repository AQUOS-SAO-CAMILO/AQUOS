import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useState } from "react";
import * as yup from "yup";
import { cadastroSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";

export default function Cadastro() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [erroEmail, setErroEmail] = useState("");
  const [erroPassword, setErroPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  async function validateEmail(valor: string) {
    try {
      await yup.string().email().validate(valor);
      setErroEmail("");
    } catch {
      setErroEmail("Email inválido");
    }
  }

  async function validatePassword(valor: string) {
    if (valor != password) {
      setErroPassword("As senhas são diferentes");
    } else {
      setErroPassword("");
    }
  }

  async function validateCadastro() {
    try {
      await cadastroSchema.validate({
        name,
        email,
        password,
        passwordConfirm,
      });
      setAlertType("success");
      setAlertMessage("Cadastro realizado com sucesso!");
      setTimeout(() => {
        navigate("/menu-atleta");
      }, 1500);
    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <Logo />
        <h1 className="auth-title">AQUOS</h1>

        <input
          className="auth-input"
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
        />
        {erroEmail && <div className="error-text">{erroEmail}</div>}

        <input
          className="auth-input"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Confirmar senha"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            validatePassword(e.target.value);
          }}
        />
        {erroPassword && <div className="error-text">{erroPassword}</div>}

        <button className="auth-btn primary" onClick={validateCadastro}>
          Registrar
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
