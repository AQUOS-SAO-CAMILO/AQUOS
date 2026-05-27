import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import styles from "../styles/Session.module.css";

export default function PosSessao() {
  const navigate = useNavigate();
  
  // Estados p/ os inputs interativos
  const [massaCorporal, setMassaCorporal] = useState("");
  const [nivelSuor, setNivelSuor] = useState("Moderado");
  const [sintomas, setSintomas] = useState<string[]>([]);
  
  // Estados de feedback
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Recupera os dados temporários se o usuário tiver voltado de outra tela
  useEffect(() => {
    const massaSalva = localStorage.getItem("temp_pos_massa");
    const suorSalvo = localStorage.getItem("temp_pos_suor");
    const sintomasSalvos = localStorage.getItem("temp_pos_sintomas");

    if (massaSalva) setMassaCorporal(massaSalva);
    if (suorSalvo) setNivelSuor(suorSalvo);
    if (sintomasSalvos) {
      try {
        setSintomas(JSON.parse(sintomasSalvos));
      } catch (e) {
        console.error("Erro ao ler sintomas salvos");
      }
    }
  }, []);

  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const listaSintomas = [
    "Boca seca", "Fadiga", "Tontura", 
    "Dor de Cabeça", "Irritabilidade", "Cãibras", 
    "Dor abdominal", "Vômito", "Diarreia"
  ];

  // 2. Salva o estado atual localmente antes de voltar
  const handleVoltar = () => {
    localStorage.setItem("temp_pos_massa", massaCorporal);
    localStorage.setItem("temp_pos_suor", nivelSuor);
    localStorage.setItem("temp_pos_sintomas", JSON.stringify(sintomas));
    navigate("/durante-sessao");
  };

  const handleFinalizar = async () => {
    if (!massaCorporal) {
      setAlertType("error");
      setAlertMessage("Por favor, informe a massa corporal final.");
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = localStorage.getItem("current_session_id");
      const preWeight = localStorage.getItem("pre_weight_kg");

      if (!sessionId || !preWeight) {
        throw new Error("Dados da sessão perdidos. Por favor, inicie um novo treino.");
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

      const massRes = await fetch(`${apiUrl}/session/mass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          pre_weight_kg: Number(preWeight),
          post_weight_kg: Number(massaCorporal)
        })
      });
      const massData = await massRes.json();
      if (!massRes.ok) throw new Error(massData.error || "Erro ao registrar peso.");

      const endRes = await fetch(`${apiUrl}/session/end`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          session_end: new Date().toISOString().split('.')[0]
        })
      });
      const endData = await endRes.json();
      if (!endRes.ok) throw new Error(endData.error || "Erro ao finalizar treino.");

      const metricsRes = await fetch(`${apiUrl}/session/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      const metricsData = await metricsRes.json();
      if (!metricsRes.ok) throw new Error(metricsData.error || "Erro ao calcular resultados.");

      localStorage.setItem("session_metrics", JSON.stringify(metricsData));
      
      // 3. apagar todos os temporários
      localStorage.removeItem("current_session_id");
      localStorage.removeItem("pre_weight_kg");
      localStorage.removeItem("urine_volume_ml");
      localStorage.removeItem("temp_pos_massa");
      localStorage.removeItem("temp_pos_suor");
      localStorage.removeItem("temp_pos_sintomas");

      navigate("/resultado-sessao");

    } catch (erro: any) {
      setAlertType("error");
      setAlertMessage(erro.message || "Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      <nav className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>Pré-Sessão</div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>Durante a Sessão</div>
        <div className={`${styles.tab} ${styles.tabActive}`}>Pós-Sessão</div>
      </nav>

      <main className={styles.content}>
        
        <section className={styles.inputGroup}>
          <label>MASSA CORPORAL (Kg)</label>
          <input 
            type="number" 
            placeholder="EX: 70.6" 
            className={styles.input}
            value={massaCorporal}
            onChange={(e) => setMassaCorporal(e.target.value)}
          />
        </section>

        <section className={styles.inputGroup}>
          <label>NIVEL DE SUOR NAS ROUPAS</label>
          <div className={styles.optionButtons}>
            {["Pouco", "Moderado", "Encharcado"].map((n) => (
              <button 
                key={n}
                className={`${styles.optionBtn} ${nivelSuor === n ? styles.optionBtnActive : ''}`}
                onClick={() => setNivelSuor(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.inputGroup}>
          <label>SINTOMAS</label>
          <div className={styles.sintomasGrid}>
            {listaSintomas.map((s) => (
              <button 
                key={s}
                className={`${styles.sintomaBtn} ${sintomas.includes(s) ? styles.sintomaBtnActive : ''}`}
                onClick={() => toggleSintoma(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <footer>
          <button 
            className={styles.continueBtn} 
            onClick={handleFinalizar}
            disabled={isLoading}
          >
            {isLoading ? "Processando Cálculos..." : "Finalizar"}
          </button>
          <button 
            className={styles.btnBackSessao}
            onClick={handleVoltar}
            disabled={isLoading}
          >
            Voltar
          </button>
        </footer>

        {alertMessage && (
          <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage("")} />
        )}
      </main>
    </div>
  );
}