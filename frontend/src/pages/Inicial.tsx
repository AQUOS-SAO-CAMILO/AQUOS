import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import styles from "../styles/Auth.module.css";

export default function Inicial() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.logoWrapper}>
          <Logo />
        </div>

        <h1 className={styles.title}>AQUOS</h1>

        <button className={styles.btn} onClick={() => navigate("/Cadastro")}>
          Criar conta
        </button>

        <button className={styles.btn} onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
}