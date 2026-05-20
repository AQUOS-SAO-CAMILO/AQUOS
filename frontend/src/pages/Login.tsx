import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useState } from "react";
import * as yup from "yup";
import { loginSchema } from "../schemas/authSchemas";
import Alert from "../components/Alert";
import styles from "../styles/Auth.module.css";

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
    // 2. Substituição das strings (ex: "auth-container") por styles.container
    <div className={styles.container}>
      {/* Removi a classe "login-card" pois ela não tinha estilos específicos no seu CSS original */}
      <div className={styles.card}>
        <Logo />
        <h1 className={styles.title}>AQUOS</h1>

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.forgot}>Esqueceu a sua senha?</div>

        {/* 3. Para combinar a classe base (btn) com a variante (btnPrimary), usamos template literals (crases) */}
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={validateLogin}
        >
          Entrar
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
