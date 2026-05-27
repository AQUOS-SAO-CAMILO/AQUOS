import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ResultadoSessao.module.css";

interface DadosResultado {
  sessionId: number;
  taxaSudorese: string;
  variacaoMassa: string;
  balancoHidrico: string;
  faixaAlvoMin: string;
  faixaAlvoMax: string;
  intervaloMinutos: string;
  alertaMensagem: string;
}

export default function ResultadoSessao() {
  const navigate = useNavigate();

  const [resultado, setResultado] = useState<DadosResultado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados diretamente da memória do navegador
    const storedMetrics = localStorage.getItem("session_metrics");

    if (storedMetrics) {
      try {
        const data = JSON.parse(storedMetrics);
        
        // Mapeando as chaves exatas que a função calculate_session_metrics  devolve
        setResultado({
          sessionId: data.session_id,
          taxaSudorese: data.sweat_rate_lph?.toString() || "0.00",
          variacaoMassa: data.weight_loss_pct?.toString() || "0",
          balancoHidrico: data.fluid_balance_ml > 0 ? `+ ${data.fluid_balance_ml}` : data.fluid_balance_ml?.toString() || "0",
          faixaAlvoMin: Math.round(data.target_intake_min_mlh)?.toString() || "0",
          faixaAlvoMax: Math.round(data.target_intake_max_mlh)?.toString() || "0",
          intervaloMinutos: data.intervaloMinutos?.toString() || "15",
          alertaMensagem: data.notes || "Hidratação adequada."
        });
      } catch (error) {
        console.error("Erro ao processar os dados da sessão:", error);
      }
    }
    
    setLoading(false);
  }, []);

  // Função para chamar o endpoint que gera o PDF (rota /session/report/<session_id>)
  const handleExportarPDF = () => {
    if (!resultado?.sessionId) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    // Abre o PDF em uma nova aba para o usuário visualizar ou baixar
    window.open(`${apiUrl}/session/report/${resultado.sessionId}`, '_blank');
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: "center" }}>
        <h2 className={styles.sectionTitle}>Calculando resultados...</h2>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className={styles.container} style={{ justifyContent: "center", textAlign: "center" }}>
        <h2 className={styles.sectionTitle}>Nenhum dado encontrado.</h2>
        <button className={styles.actionBtn} onClick={() => navigate("/menu-atleta")}>
          Voltar ao Menu
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>RESULTADO DA SESSÃO</h1>

      {/* Card Verde - Taxa de Sudorese */}
      <div className={`${styles.resultCard} ${styles.greenCard}`}>
        <span className={styles.cardLabel}>TAXA DE SUDORESE ESTIMADA</span>
        <span className={styles.cardValue}>{resultado.taxaSudorese} l/h</span>
      </div>

      {/* Cards Brancos Lado a Lado */}
      <div className={styles.cardsRow}>
        <div className={`${styles.resultCard} ${styles.whiteCard}`}>
          <span className={styles.cardLabel}>VARIAÇÃO DE<br/>MASSA CORPORAL</span>
          <span className={styles.cardValue}>{resultado.variacaoMassa} %</span>
        </div>
        
        <div className={`${styles.resultCard} ${styles.whiteCard}`}>
          <span className={styles.cardLabel}>BALANÇO HÍDRICO</span>
          <span className={styles.cardValue}>{resultado.balancoHidrico} ml</span>
        </div>
      </div>

      {/* Seção Recomendações */}
      <h2 className={styles.sectionTitle}>RECOMENDAÇÕES</h2>
      <div className={`${styles.resultCard} ${styles.blueCard}`}>
        <div className={styles.blueCardHeader}>
          {/* Ícone de Gota D'água */}
          <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className={styles.cardLabel} style={{ marginBottom: 0 }}>
            FAIXA ALVO DE INGESTÃO DE FLUIDOS
          </span>
          <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
        
        <span className={styles.cardValue}>
          {resultado.faixaAlvoMin} - {resultado.faixaAlvoMax} ml
        </span>
        
        <span className={styles.italicText}>
          Ingerir {resultado.faixaAlvoMin} a {resultado.faixaAlvoMax} ml a cada {resultado.intervaloMinutos} min
        </span>
      </div>

      {/* Seção Alertas */}
      <h2 className={styles.sectionTitle}>ALERTAS</h2>
      {/* Condicional para mudar a cor do alerta se for grave ou não */}
      <div className={`${styles.resultCard} ${resultado.alertaMensagem.includes("adequada") ? styles.greenCard : styles.yellowCard}`}>
        <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className={styles.cardLabel}>{resultado.alertaMensagem}</span>
      </div>

      {/* Botões de Ação */}
      <div className={styles.buttonGroup}>
        <button className={styles.actionBtn} onClick={() => navigate("/menu-atleta")}>
          Menu Inicial
        </button>
        <button className={styles.actionBtn} onClick={() => navigate("/relatorio-atleta")}>
          Painel Analítico
        </button>
        <button className={styles.actionBtn} onClick={handleExportarPDF}>
          Exportar Resultado
        </button>
      </div>
    </div>
  );
}