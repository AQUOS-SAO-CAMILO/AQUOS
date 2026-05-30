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
  

  const [chartData, setChartData] = useState<{ sessao: string; media: number; mediana: number; limiteMin: number; limiteMax: number; }[]>([]);
  
  const [modalidadesCards, setModalidadesCards] = useState<CardData[]>([]);
  const [equipesCards, setEquipesCards] = useState<CardData[]>([]);
  const [climasCards, setClimasCards] = useState<CardData[]>([]);

  const [loading, setLoading] = useState(true);

  //  Função  para extrair o ID do Atleta direto do Token de segurança
  const getAtletaIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).User_id; 
    } catch (e) {
      return null;
    }
  };

  // Exportação do PDF conectada ao Backend
  const handleExportar = async () => {
    try {
      const atletaId = getAtletaIdFromToken();
      if (!atletaId) throw new Error("Usuário não autenticado");

      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
      // Conecta com a rota de exportação específica do atleta
      const exportUrl = `${apiUrl}/report/export?atleta=${atletaId}`;

      const response = await fetch(exportUrl, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (!response.ok) throw new Error("Erro ao gerar relatório");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `relatorio_pessoal_atleta.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar relatório", error);
      alert("Não foi possível exportar o relatório no momento.");
    }
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

    async function loadAthleteReport() {
      try {
        const atletaId = getAtletaIdFromToken();

        if (!atletaId) {
          navigate("/");
          return;
        }

     
        const fetchUrl = `${apiUrl}/report/atleta/${atletaId}`;
        console.log("Buscando dados pessoais em:", fetchUrl);

        const response = await fetch(fetchUrl, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        
        if (!response.ok) throw new Error("Erro na requisição");
        const dadosRelatorio = await response.json();

        setMetrics([
          { label: "MÉDIA", value: dadosRelatorio.geral.average },
          { label: "MEDIANA", value: dadosRelatorio.geral.median },
          { label: "DESVIO", value: dadosRelatorio.geral.stdDeviation },
        ]);

        setSummary({ title: "MINHAS SESSÕES", quantidadeSessoes: dadosRelatorio.geral.totalSessoes });
        
        setChartData(
          dadosRelatorio.grafico.map((item: any) => ({
            sessao: item.sessao,
            media: item.media,
            mediana: item.mediana,
            limiteMin: item.limite[0],
            limiteMax: item.limite[1]
          }))
        );

        setModalidadesCards(dadosRelatorio.modalidades.map((item: any) => ({
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

        setEquipesCards(dadosRelatorio.equipes.map((item: any) => ({
          title: item.nome, badge: `${item.sessoes} Sessões`, 
          accentClass: styles.sectionCardPink,
          fields: [
            { label: "Balanço Hídrico", value: item.balancoHidrico },
            { label: "Taxa de Sudorese", value: item.taxaSudorese },
            { label: "Variação de Massa", value: item.variacaoMassa },
          ]
        })));

        setClimasCards(dadosRelatorio.climas.map((item: any) => ({
          title: item.nome, badge: `${item.sessoes} Sessões`, 
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
  }, [navigate]);

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
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
            
                <Area 
                  type="monotone" 
                  dataKey="limiteMax" 
                  baseValue={0}
                  stroke="none" 
                  fill="var(--brand-primary, #b71c1c)" 
                  fillOpacity={0.15} 
                  name="Variação Pessoal" 
                />
                
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