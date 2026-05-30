import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/Menu.module.css";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Metric = { label: string; value: string };
type SectionField = { label: string; value: string };

type CardData = {
  title: string;
  badge: string;
  fields: SectionField[];
  accentClass: string;
};

export default function RelatorioAdm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [summary, setSummary] = useState({
    title: "SESSÕES REGISTRADAS",
    quantidadeSessoes: 0,
  });

  // Tipagem atualizada para separar o limite em Min e Max
  const [chartData, setChartData] = useState<{
    sessao: string;
    media: number;
    mediana: number;
    limiteMin: number;
    limiteMax: number;
  }[]>([]);

  const [modalidadesCards, setModalidadesCards] = useState<CardData[]>([]);
  const [equipesCards, setEquipesCards] = useState<CardData[]>([]);
  const [atletasCards, setAtletasCards] = useState<CardData[]>([]);
  const [climasCards, setClimasCards] = useState<CardData[]>([]);

  const [loading, setLoading] = useState(true);

  // Função para exportar o relatório com base nos filtros da URL
  const handleExport = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
      
  
      const exportUrl = `${apiUrl}/report/export?${searchParams.toString()}`;

      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `relatorio_analitico_filtrado.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar relatório", error);
    }
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

    async function loadReport() {
      try {
        const modalidadeIds = searchParams.get("modalidade");
        const equipeIds = searchParams.get("equipe");
        const atletaIds = searchParams.get("atleta");

        const queryParams = new URLSearchParams();
        if (modalidadeIds) queryParams.append("modalidade", modalidadeIds);
        if (equipeIds) queryParams.append("equipe", equipeIds);
        if (atletaIds) queryParams.append("atleta", atletaIds);

        const fetchUrl = `${apiUrl}/report?${queryParams.toString()}`;
        console.log("Buscando dados em:", fetchUrl);

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Erro na requisição");
        const dadosRelatorio = await response.json();

        setMetrics([
          { label: "MÉDIA", value: dadosRelatorio.geral.average },
          { label: "MEDIANA", value: dadosRelatorio.geral.median },
          { label: "DESVIO", value: dadosRelatorio.geral.stdDeviation },
        ]);

        setSummary({
          title: "SESSÕES REGISTRADAS",
          quantidadeSessoes: dadosRelatorio.geral.totalSessoes,
        });

        // Mapeamento corrigido: separando a array de limite em duas propriedades numéricas
        setChartData(
          dadosRelatorio.grafico.map((item: any) => ({
            sessao: item.sessao,
            media: item.media,
            mediana: item.mediana,
            limiteMin: item.limite[0],
            limiteMax: item.limite[1],
          }))
        );

        setModalidadesCards(
          dadosRelatorio.modalidades.map((item: any) => ({
            title: item.nome,
            badge: `${item.sessoes} Sessões`,
            accentClass: styles.sectionCardPurple,
            fields: [
              { label: "Duração", value: item.duracao },
              { label: "Intensidade", value: item.intensidade },
              { label: "Balanço Hídrico", value: item.balancoHidrico },
              { label: "Taxa de Sudorese", value: item.taxaSudorese },
              {
                label: "Variação de Massa Corporal",
                value: item.variacaoMassa,
              },
            ],
          }))
        );

        setEquipesCards(
          dadosRelatorio.equipes.map((item: any) => ({
            title: item.nome,
            badge: `${item.sessoes} Sessões`,
            accentClass: styles.sectionCardPink,
            fields: [
              { label: "Balanço Hídrico", value: item.balancoHidrico },
              { label: "Taxa de Sudorese", value: item.taxaSudorese },
              {
                label: "Variação de Massa Corporal",
                value: item.variacaoMassa,
              },
            ],
          }))
        );

        setAtletasCards(
          dadosRelatorio.atletas.map((item: any) => ({
            title: item.nome,
            badge: `${item.sessoes} Sessões`,
            accentClass: styles.sectionCardGreen,
            fields: [
              { label: "Modalidade", value: item.modalidade },
              { label: "Equipe", value: item.equipe },
              { label: "Balanço Hídrico", value: item.balancoHidrico },
              { label: "Taxa de Sudorese", value: item.taxaSudorese },
              {
                label: "Variação de Massa Corporal",
                value: item.variacaoMassa,
              },
            ],
          }))
        );

        setClimasCards(
          dadosRelatorio.climas.map((item: any) => ({
            title: item.nome,
            badge: `${item.sessoes} Sessões`,
            accentClass: styles.sectionCardYellow,
            fields: [
              { label: "Temperatura média", value: item.tempMedia },
              { label: "Umidade", value: item.umidade },
              { label: "Balanço Hídrico", value: item.balancoHidrico },
              { label: "Taxa de Sudorese", value: item.taxaSudorese },
              {
                label: "Variação de Massa Corporal",
                value: item.variacaoMassa,
              },
            ],
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [searchParams]);

  const renderCategory = (categoryTitle: string, cards: CardData[]) => {
    if (cards.length === 0) return null;

    return (
      <div style={{ width: "100%", marginTop: "15px" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--text-dark)",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          {categoryTitle}
        </h2>

        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${styles.sectionCard} ${card.accentClass}`}
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

  if (loading)
    return (
      <div className={styles.container}>
        <h3>Carregando Relatório...</h3>
      </div>
    );

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
          <span className={styles.chartTitle}>
            Evolução e Consistência (Taxa de Sudorese)
          </span>

          <div style={{ width: "100%", height: 250, marginTop: "10px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="sessao"
                  tick={{ fontSize: 10, fill: "#aaa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#aaa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />

            
                <Area
                  type="monotone"
                  dataKey="limiteMax"
                  baseValue={0}
                  stroke="none"
                  fill="var(--brand-primary, #b71c1c)"
                  fillOpacity={0.15}
                  name="Variação (Desvio)"
                />

                <Line
                  type="monotone"
                  dataKey="media"
                  stroke="var(--brand-primary, #b71c1c)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--brand-primary, #b71c1c)" }}
                  activeDot={{ r: 6 }}
                  name="Média"
                />

                <Line
                  type="monotone"
                  dataKey="mediana"
                  stroke="#333"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Mediana"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitle}>{summary.title}</span>
            <span
              className={styles.sectionBadge}
              style={{ color: "var(--brand-primary)", fontStyle: "italic" }}
            >
              {summary.quantidadeSessoes} Sessões
            </span>
          </div>

          <button
            type="button"
            className={styles.reportsBtn}
            onClick={handleExport}
            style={{ width: "100%", marginTop: "15px" }}
          >
            Exportar relatório geral
          </button>
        </div>

        {renderCategory("MODALIDADE", modalidadesCards)}
        {renderCategory("EQUIPE", equipesCards)}
        {renderCategory("CLIMA", climasCards)}
        {renderCategory("ATLETAS", atletasCards)}

        <div
          className={styles.footerActions}
          style={{ display: "flex", gap: "16px", marginTop: "20px" }}
        >
          <button
            type="button"
            className={styles.reportsBtn}
            style={{ flex: 1, margin: 0 }}
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
          <button
            type="button"
            className={styles.reportsBtn}
            style={{ flex: 1, margin: 0 }}
            onClick={() => navigate("/menu-adm")}
          >
            Menu Inicial
          </button>
        </div>
      </main>
    </div>
  );
}
