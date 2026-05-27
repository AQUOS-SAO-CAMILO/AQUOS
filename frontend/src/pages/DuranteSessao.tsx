import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import icon250ml from "../assets/250ml.svg";
import icon500ml from "../assets/500ml.svg";
import icon1L from "../assets/1L.svg";
import icon150ml from "../assets/bexiga1.svg";
import icon300ml from "../assets/bexiga2.svg";
import icon600ml from "../assets/bexiga3.svg";
import styles from "../styles/Session.module.css";

export default function DuranteSessao() {
  const navigate = useNavigate();
  
  // Estados p/ os totais acumulados
  const [aguaTotal, setAguaTotal] = useState(0);
  const [urinaTotal, setUrinaTotal] = useState(0);

  // Estados para feedback visual e carregamento
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Recupera o progresso temporário caso o usuário tenha navegado entre as telas
  useEffect(() => {
    const aguaSalva = localStorage.getItem("temp_agua");
    const urinaSalva = localStorage.getItem("temp_urina");

    if (aguaSalva) setAguaTotal(Number(aguaSalva));
    if (urinaSalva) setUrinaTotal(Number(urinaSalva));
  }, []);

  // Funções p/ somar volumes rápidos
  const addAgua = (ml: number) => setAguaTotal(prev => prev + ml);
  const addUrina = (ml: number) => setUrinaTotal(prev => prev + ml);

  // Ajuste fino de 50ml
  const ajustarAgua = (ml: number) => setAguaTotal(prev => Math.max(0, prev + ml));
  const ajustarUrina = (ml: number) => setUrinaTotal(prev => Math.max(0, prev + ml));

  // 2. Salva o estado atual localmente antes de voltar para a tela anterior
  const handleVoltar = () => {
    localStorage.setItem("temp_agua", aguaTotal.toString());
    localStorage.setItem("temp_urina", urinaTotal.toString());
    navigate("/pre-sessao");
  };

  // Função que envia os dados para o backend e avança
  const handleContinuar = async () => {
    setIsLoading(true);
    try {
      const sessionId = localStorage.getItem("current_session_id");
      
      if (!sessionId) {
        throw new Error("Sessão não encontrada. Por favor, inicie o treino novamente.");
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

      // Se o atleta registou consumo de água, envia para a API
      if (aguaTotal > 0) {
        const res = await fetch(`${apiUrl}/session/fluidIntake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            fluid_type: "water",
            volume_ml: aguaTotal,
            logged_at: new Date().toISOString().split('.')[0]
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao registrar hidratação");
      }

      // Guarda o volume de urina acumulado para o cálculo final de métricas no pós-sessão
      localStorage.setItem("urine_volume_ml", urinaTotal.toString());

      // 3. Limpa os estados temporários de navegação, pois os dados já foram processados/salvos
      localStorage.removeItem("temp_agua");
      localStorage.removeItem("temp_urina");

      navigate("/pos-sessao");

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
        <div className={`${styles.tab} ${styles.tabActive}`}>Durante a Sessão</div>
        <div className={`${styles.tab} ${styles.tabDisabled}`}>Pós-Sessão</div>
      </nav>

      <main className={`${styles.content} ${styles.duringContent}`}>
        
        {/* Bloco de ingestão de água */}
        <section className={`${styles.monitoringBlock} ${styles.waterBlock}`}>
          <div className={styles.blockHeader}>
            <h3>INGESTÃO DE ÁGUA TOTAL</h3>
            <span className={styles.totalValue}>{aguaTotal.toString().padStart(4, '0')} ml</span>
          </div>
          
          <div className={styles.iconSelectionGrid}>
            <div className={styles.iconItem} onClick={() => addAgua(250)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon250ml} alt="250ml" />
              </div>
              <span>250ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addAgua(500)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon500ml} alt="500ml" />
              </div>
              <span>500ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addAgua(1000)}>
              <div className={`${styles.iconBox} ${styles.waterBg}`}>
                <img src={icon1L} alt="1l" />
              </div>
              <span>1l</span>
            </div>
          </div>

          <div className={styles.fineAdjustment}>
            <button onClick={() => ajustarAgua(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarAgua(50)}>+</button>
          </div>
        </section>

        {/* Bloco de volume urinário */}
        <section className={`${styles.monitoringBlock} ${styles.urineBlock}`}>
          <div className={styles.blockHeader}>
            <h3>VOLUME URINÁRIO TOTAL</h3>
            <span className={styles.totalValue}>{urinaTotal.toString().padStart(4, '0')} ml</span>
          </div>

          <div className={styles.iconSelectionGrid}>
            <div className={styles.iconItem} onClick={() => addUrina(150)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon150ml} alt="150ml" />
              </div>
              <span>150ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addUrina(300)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon300ml} alt="300ml" />
              </div>
              <span>300ml</span>
            </div>
            <div className={styles.iconItem} onClick={() => addUrina(600)}>
              <div className={`${styles.iconBox} ${styles.urineBg}`}>
                <img src={icon600ml} alt="600ml" />
              </div>
              <span>600ml</span>
            </div>
          </div>

          <div className={styles.fineAdjustment}>
            <button onClick={() => ajustarUrina(-50)}>−</button>
            <span>Ajustar 50ml</span>
            <button onClick={() => ajustarUrina(50)}>+</button>
          </div>
        </section>

        <footer>
          <button 
            className={styles.continueBtn} 
            onClick={handleContinuar}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Continuar"}
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