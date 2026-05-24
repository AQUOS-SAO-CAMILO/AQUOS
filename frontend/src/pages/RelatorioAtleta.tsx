import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Menu.module.css";
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

type Metric = { label: string; value: string; };
type SectionField = { label: string; value: string; };

type CardData = { 
  title: string; 
  badge: string; 
  fields: SectionField[]; 
  accentClass: string; 
};

export default function RelatorioAtleta() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [summary, setSummary] = useState({ title: "MINHAS SESSÕES", quantidadeSessoes: 0 });
  const [chartData, setChartData] = useState<{ sessao: string; media: number; mediana: number; limite: [number, number] }[]>([]);
  
  const [modalidadesCards, setModalidadesCards] = useState<CardData[]>([]);
  const [equipesCards, setEquipesCards] = useState<CardData[]>([]);
  const [climasCards, setClimasCards] = useState<CardData[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5173";

    async function loadAthleteReport() {
      try {
        // 1. Pegamos a identificação do atleta que está logado
        // Isso pode vir do localStorage, Context API ou Redux
        const atletaId = localStorage.getItem("userId") || "1001"; // "1001" como fallback de segurança

        const fetchUrl = `${apiUrl}/report/atleta/${atletaId}`;
        console.log("Buscando dados pessoais em:", fetchUrl);

        // ====================================================================
        // 🔴 QUANDO CONECTAR AO BANCO: DESCOMENTE AS LINHAS ABAIXO
        // ====================================================================
        // const response = await fetch(fetchUrl, {
        //   headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        // });
        // if (!response.ok) throw new Error("Erro na requisição");
        // const dadosMock = await response.json();

        // ====================================================================
        // 🔴 SIMULAÇÃO DA ESTRUTURA DE RETORNO DO BANCO DE DADOS (DADOS DO ATLETA)
        // ====================================================================
        const dadosMock = {
          geral: { average: "1.4", median: "1.3", stdDeviation: "0.1", totalSessoes: 35 },
          
          grafico: [
            { sessao: 'S1', media: 1.2, mediana: 1.2, limite: [1.1, 1.3] },
            { sessao: 'S2', media: 1.3, mediana: 1.3, limite: [1.1, 1.5] },
            { sessao: 'S3', media: 1.5, mediana: 1.4, limite: [1.2, 1.8] },
            { sessao: 'S4', media: 1.4, mediana: 1.4, limite: [1.2, 1.6] },
            { sessao: 'S5', media: 1.4, mediana: 1.3, limite: [1.2, 1.6] },
          ],

          // As informações que o atleta participa
          modalidades: [
            {
              nome: "FUTSAL", sessoes: 35, duracao: "90 min", intensidade: "Alta",
              balancoHidrico: "-400ml", taxaSudorese: "1.4 l/h", variacaoMassa: "-1.2%"
            }
          ],
          equipes: [
            {
              nome: "WINNERS (FUTSAL)", sessoes: 35,
              balancoHidrico: "-400ml", taxaSudorese: "1.4 l/h", variacaoMassa: "-1.2%"
            }
          ],
          // O histórico de como o corpo dele reage em diferentes climas
          climas: [
            {
              nome: "QUENTE", sessoes: 15, tempMedia: "34°C", umidade: "55%",
              balancoHidrico: "-600ml", taxaSudorese: "1.8 l/h", variacaoMassa: "-1.8%"
            },
            {
              nome: "AMENO", sessoes: 20, tempMedia: "23°C", umidade: "65%",
              balancoHidrico: "-250ml", taxaSudorese: "1.1 l/h", variacaoMassa: "-0.8%"
            }
          ]
        };
        // ====================================================================

        setMetrics([
          { label: "MÉDIA", value: dadosMock.geral.average },
          { label: "MEDIANA", value: dadosMock.geral.median },
          { label: "DESVIO", value: dadosMock.geral.stdDeviation },
        ]);

        setSummary({ title: "MINHAS SESSÕES", quantidadeSessoes: dadosMock.geral.totalSessoes });
        setChartData(dadosMock.grafico);

        setModalidadesCards(dadosMock.modalidades.map((item: any) => ({
          title: item.nome, badge: `${item.sessoes} Sessões`, 
          accentClass: styles.sectionCardPurple,
          fields: [
            { label: "Duração Média", value: item.duracao },
            { label: "Intensidade", value: item.intensidade },
            { label: "Balanço Hídrico", value: item.balancoHidrico },
            { label: "Taxa de Sudorese", value: item.taxaSudorese },
            { label: "Variação de Massa", value: item.variacaoMassa },
          ]
        })));

        setEquipesCards(dadosMock.equipes.map((item: any) => ({
          title: item.nome, badge: `${item.sessoes} Sessões`, 
          accentClass: styles.sectionCardPink,
          fields: [
            { label: "Balanço Hídrico", value: item.balancoHidrico },
            { label: "Taxa de Sudorese", value: item.taxaSudorese },
            { label: "Variação de Massa", value: item.variacaoMassa },
          ]
        })));

        setClimasCards(dadosMock.climas.map((item: any) => ({
          title: item.nome, badge: `${item.sessoes} Sessões`, 
          // Se for Quente fica Laranja, se for Ameno/Frio usa o Amarelo/Azul do sistema
          accentClass: item.nome === "QUENTE" ? 'cardOrange' : styles.sectionCardYellow,
          fields: [
            { label: "Temperatura média", value: item.tempMedia },
            { label: "Umidade", value: item.umidade },
            { label: "Balanço Hídrico", value: item.balancoHidrico },
            { label: "Taxa de Sudorese", value: item.taxaSudorese },
            { label: "Variação de Massa", value: item.variacaoMassa },
          ]
        })));

      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAthleteReport();
  }, []);

  const handleExportar = () => alert("Iniciando download do seu PDF/Excel...");

  const renderCategory = (categoryTitle: string, cards: CardData[]) => {
    if (cards.length === 0) return null;
    
    return (
      <div style={{ width: '100%', marginTop: '15px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '10px' }}>
          {categoryTitle}
        </h2>
        
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`${styles.sectionCard} ${card.accentClass}`}
            // Aplica cor laranja via style caso a classe 'cardOrange' ainda não esteja no CSS
            style={card.accentClass === 'cardOrange' ? { borderTop: '5px solid #FF8A65' } : {}}
          >
            <div className={styles.sectionTitleRow}>
              <span className={styles.sectionTitle}>{card.title}</span>
              <span className={styles.sectionBadge}>{card.badge}</span>
            </div>
            
            {card.fields.map((field) => (
              <div key={field.label} className={styles.sectionItem}>
                <span className={styles.sectionItemLabel}>{field.label}:</span>
                <span className={styles.sectionItemValue}>{field.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className={styles.container}><h3>Carregando Meu Relatório...</h3></div>;

  return (
    <div className={styles.container}>

      <main className={styles.grid}>
        <h1 className={styles.welcomeText}>Painel Analítico</h1>

        <div className={styles.statsRow}>
          {metrics.map((metric) => (
            <div key={metric.label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricValue}>{metric.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.chartCard}>
          <span className={styles.chartTitle}>Taxa de Sudorese</span>
          
          <div style={{ width: '100%', height: 250, marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="sessao" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                <Area type="monotone" dataKey="limite" stroke="none" fill="var(--brand-primary, #b71c1c)" fillOpacity={0.15} name="Variação Pessoal" />
                <Line type="monotone" dataKey="media" stroke="var(--brand-primary, #b71c1c)" strokeWidth={3} dot={{ r: 4, fill: 'var(--brand-primary, #b71c1c)' }} activeDot={{ r: 6 }} name="Média" />
                <Line type="monotone" dataKey="mediana" stroke="#333" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Mediana" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitle}>{summary.title}</span>
            <span className={styles.sectionBadge} style={{ color: 'var(--brand-primary)', fontStyle: 'italic' }}>
              {summary.quantidadeSessoes} Sessões
            </span>
          </div>
          
          <button 
            type="button" 
            className={styles.reportsBtn} 
            onClick={handleExportar} 
            style={{ width: '100%', marginTop: '15px' }}
          >
            Exportar Relatório
          </button>
        </div>

        {renderCategory("MINHAS MODALIDADES", modalidadesCards)}
        {renderCategory("MINHAS EQUIPES", equipesCards)}
        {renderCategory("MEU HISTÓRICO POR CLIMA", climasCards)}

        <div className={styles.footerActions} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {/* Para o atleta, precisamos apenas de um botão centralizado para voltar ao menu dele */}
          <button 
            type="button" 
            className={styles.reportsBtn} 
            style={{ width: '260px' }} 
            onClick={() => navigate("/menu-atleta")}
          >
            Menu Inicial
          </button>
        </div>
      </main>
    </div>
  );
}