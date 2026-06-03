import { useNavigate } from "react-router-dom";
// Corrigido o erro de importar o useState duas vezes
import { useState } from "react";
import Logo from "../components/Logo";
<<<<<<< HEAD
=======
import * as yup from "yup";
import { loginSchema } from "../schemas/authSchemas";
>>>>>>> frontend
import Alert from "../components/Alert";
import styles from "../styles/Auth.module.css";
import API from '../config'


type AlertType = "success" | "error" | "info" | "warning";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("error");

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const res = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

      const contentType = res.headers.get("Content-Type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Resposta do servidor não é JSON");
      }

      if (res.ok) {
        const tokenString = data.token;
        localStorage.setItem("token", tokenString);

        const decodedToken = parseJwt(tokenString);

        setAlertMessage("Login realizado!");
        setAlertType("success");

        setTimeout(() => {
          if (data.user?.is_admin === 1) {
            navigate("/menu-adm");
          } else {
            navigate("/menu-atleta"); 
          }
        }, 1000);

      } else {
        setAlertMessage(data.error || "Erro no login");
        setAlertType("error");
      }
    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("Erro ao conectar com o servidor");
    }
  };
=======
  
  // Estados para o alerta
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  // Função que combina a Validação (Yup) e o Fetch (Backend)
  const handleLogin = async () => {
    try {
      // 1. Primeiro valida localmente com o Yup
      await loginSchema.validate({ email, password });
      
      // 2. Se a validação passar, tenta conectar com o servidor
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // 3. Sucesso!
        localStorage.setItem("token", data.token);
        setAlertType("success");
        setAlertMessage("Login realizado com sucesso!");
        
        // Timeout para dar tempo do usuário ver a mensagem de sucesso
        setTimeout(() => {
          navigate("/menu-atleta"); // Ou a rota correta baseada no perfil
        }, 1500);
      } else {
        // Erro retornado pelo backend (ex: senha incorreta)
        setAlertType("error");
        setAlertMessage(data.error || "Falha no login");
      }
    } catch (erro: any) {
      // Erro do Yup (ex: email em branco) ou erro de conexão com o servidor
      setAlertType("error");
      setAlertMessage(erro.message || "Erro ao conectar com o servidor");
    }
  };
>>>>>>> frontend

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Logo />
        <h1 className={styles.title}>AQUOS</h1>

<<<<<<< HEAD
=======
        {/* Inputs utilizando o CSS module da branch frontend */}
>>>>>>> frontend
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
<<<<<<< HEAD
        
=======

>>>>>>> frontend
        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

<<<<<<< HEAD
=======
        <div className={styles.forgot}>Esqueceu a sua senha?</div>

        {/* Botão chamando a nossa função unificada handleLogin */}
>>>>>>> frontend
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
