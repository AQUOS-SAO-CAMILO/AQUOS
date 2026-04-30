import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        alert("Login realizado!");
        navigate("/home"); 
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <Logo />
        <h1 className="auth-title">AQUOS</h1>

        <input className="auth-input" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        <input className="auth-input" type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />

        <div className="auth-forgot">Esqueceu a sua senha?</div>

        <button className="auth-btn primary" onClick={handleLogin}>Próximo</button>

        <button className="auth-btn back" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>
    </div>
  );
}