import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useState } from "react";
import * as yup from "yup";
import { cadastroSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";

// 1. Importando o arquivo de estilos de autenticação
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

  async function validateEmail(valor: string) {
    try {
      await yup.string().email().validate(valor);
      setErroEmail("");
    } catch {
      setErroEmail("Email inválido");
    }
  }

  async function validatePassword(valor: string) {
    if (valor !== password) { // Boa prática do TypeScript/JS: usar !== em vez de !=
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
    // 2. Trocando as classes para o padrão CSS Modules
    <div className={styles.container}>
      {/* Removida a classe 'register-card' pois não existia regra CSS atrelada a ela */}
      <div className={styles.card}>
        <Logo />
        <h1 className={styles.title}>AQUOS</h1>

        <input
          className={styles.input}
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        />
        {/* Usando a classe styles.errorText */}
        {erroEmail && <div className={styles.errorText}>{erroEmail}</div>}

        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        />
        {/* Usando a classe styles.errorText */}
        {erroPassword && <div className={styles.errorText}>{erroPassword}</div>}

        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={validateCadastro}
        >
          Registrar
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
        >
          Voltar
        </button>
      </div>
    </div>
  );
}