import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useState } from "react";
import * as yup from "yup";
import { cadastroSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";
import styles from "../styles/Auth.module.css";

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
  
  const [isLoading, setIsLoading] = useState(false);

  async function validateEmail(valor: string) {
    try {
      await yup.string().email().validate(valor);
      setErroEmail("");
    } catch {
      setErroEmail("Email inválido");
    }
  }

  async function validatePassword(valor: string) {
    if (valor !== password) { 
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

      setIsLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
        })
      });

      const data = await res.json();

      if (!res.ok) {
      
        throw new Error(data.error || "Erro ao realizar cadastro.");
      }

      setAlertType("success");
      setAlertMessage("Cadastro realizado com sucesso! Redirecionando para o login...");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message || "Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Logo />
        <h1 className={styles.title}>AQUOS</h1>

        <input
          className={styles.input}
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          disabled={isLoading}
        />
        {erroEmail && <div className={styles.errorText}>{erroEmail}</div>}

        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Confirmar senha"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            validatePassword(e.target.value);
          }}
          disabled={isLoading}
        />
        {erroPassword && <div className={styles.errorText}>{erroPassword}</div>}

        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={validateCadastro}
          disabled={isLoading}
        >
          {isLoading ? "Registrando..." : "Registrar"}
        </button>

        {alertMessage && (
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={() => setAlertMessage("")}
          />
        )}

        <button 
          className={`${styles.btn} ${styles.btnBack}`} 
          onClick={() => navigate("/")}
          disabled={isLoading}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}