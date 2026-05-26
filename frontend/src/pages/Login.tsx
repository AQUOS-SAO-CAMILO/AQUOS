import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../components/Logo";
import Alert from "../components/Alert";
import styles from "../styles/Auth.module.css";
import API from '../config'


type AlertType = "success" | "error" | "info" | "warning";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("error");

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          password
        })
      });

      const contentType = res.headers.get("Content-Type");
      let data = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Resposta do servidor não é JSON");
      }

      if (res.ok) {
        localStorage.setItem("token", data.token.token);

        setAlertMessage("Login realizado!");
        setAlertType("success");
        navigate("/menu-atleta"); 
      } else {
        setAlertMessage(data.error);
        setAlertType("error");
      }
    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className={styles.container}>
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

        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          onClick={handleLogin}
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
