import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../components/Logo";
import Alert from "../components/Alert";
import styles from "../styles/Auth.module.css";

type AlertType = "success" | "error" | "info" | "warning";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("error");

  // Função auxiliar para decodificar o token JWT e ler os dados de dentro dele
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
    // Puxa a URL base do arquivo .env. Se não existir, usa o localhost como padrão.
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
        // 1. Salva o token no navegador (corrigido para data.token)
        const tokenString = data.token;
        localStorage.setItem("token", tokenString);

        // 2. Decodifica o token para saber quem acabou de logar
        const decodedToken = parseJwt(tokenString);

        setAlertMessage("Login realizado!");
        setAlertType("success");

        // 3. Redirecionamento baseado na "role" do usuário (aguarda 1 segundo para mostrar a mensagem de sucesso)
        setTimeout(() => {
          if (decodedToken && (decodedToken.role === "admin" || decodedToken.role === "adm")) {
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
