import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ResultadoSessao.module.css";

// Interface para garantir que o TypeScript entenda o formato dos dados
interface DadosResultado {
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

  // 1. Estados para armazenar o resultado e o status de carregamento
  const [resultado, setResultado] = useState<DadosResultado | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Busca os dados no backend assim que a tela é montada
  useEffect(() => {
    async function fetchResultado() {
      try {
        // Substitua pela URL da sua API que retorna os cálculos da sessão finalizada
        const response = await fetch("https://seu-backend.com/api/sessoes/resultado-atual");
        const data = await response.json();

        // Atualiza o estado com os dados vindos do BD
        setResultado({
          taxaSudorese: data.taxaSudorese || "0.00",
          variacaoMassa: data.variacaoMassa || "0",
          balancoHidrico: data.balancoHidrico || "- 000",
          faixaAlvoMin: data.faixaAlvoMin || "000",
          faixaAlvoMax: data.faixaAlvoMax || "000",
          intervaloMinutos: data.intervaloMinutos || "00",
          alertaMensagem: data.alertaMensagem || "RISCO DE PERDA EXCESSIVA"
        });
      } catch (error) {
        console.error("Erro ao buscar os resultados da sessão:", error);
        // Em caso de erro, definimos valores de fallback (padrão)
        setResultado({
          taxaSudorese: "0.00",
          variacaoMassa: "0",
          balancoHidrico: "000",
          faixaAlvoMin: "000",
          faixaAlvoMax: "000",
          intervaloMinutos: "00",
          alertaMensagem: "ERRO AO CARREGAR DADOS"
        });
      } finally {
        // Ao final (dando certo ou erro), tiramos a tela de loading
        setLoading(false);
      }
    }

    fetchResultado();
  }, []);

  // 3. Renderização de estado de "Carregando"
  if (loading || !resultado) {
    return (
      <div className={styles.container} style={{ justifyContent: "center" }}>
        <h2 className={styles.sectionTitle}>Calculando resultados...</h2>
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
          {resultado.faixaAlvoMin} - {resultado.faixaAlvoMax} ml/h
        </span>
        
        <span className={styles.italicText}>
          Ingerir {resultado.faixaAlvoMin} - {resultado.faixaAlvoMax} ml a cada {resultado.intervaloMinutos}min
        </span>
      </div>

      {/* Seção Alertas */}
      <h2 className={styles.sectionTitle}>ALERTAS</h2>
      <div className={`${styles.resultCard} ${styles.yellowCard}`}>
        {/* Ícone de Alerta */}
        <svg className={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {/* Texto do alerta vindo do backend */}
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
        <button className={styles.actionBtn} onClick={() => console.log("Exportar...")}>
          Exportar Resultado
        </button>
      </div>
    </div>
  );
}