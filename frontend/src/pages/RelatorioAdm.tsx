import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Menu.module.css";

type Metric = {
  label: string;
  value: string;
};

type SectionField = {
  label: string;
  value: string;
};

type SectionData = {
  title: string;
  badge: string;
  fields: SectionField[];
  accentClass: string;
};

export default function RelatorioAdm() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Média", value: "0,0" },
    { label: "Mediana", value: "0,0" },
    { label: "Desvio", value: "0,0" },
  ]);

  const [summary, setSummary] = useState({
    title: "Sessões registradas",
    badge: "10 Sessões",
    description: "Exportar relatório",
  });

  const [sections, setSections] = useState<SectionData[]>([
    {
      title: "Modalidade: ",
      badge: "10 Sessões",
      accentClass: styles.sectionCardGreen,
      fields: [
        { label: "Duração", value: "-" },
        { label: "Intensidade", value: "-" },
        { label: "Balanço Hídrico", value: "-" },
        { label: "Taxa de Sudorese", value: "-" },
        { label: "Variação de Massa Corporal", value: "-" },
      ],
    },
    {
      title: "Equipe: ",
      badge: "10 Sessões",
      accentClass: styles.sectionCardPink,
      fields: [
        { label: "Balanço Hídrico", value: "-" },
        { label: "Taxa de Sudorese", value: "-" },
        { label: "Variação de Massa Corporal", value: "-" },
      ],
    },
    {
      title: "Clima: ",
      badge: "10 Sessões",
      accentClass: styles.sectionCardYellow,
      fields: [
        { label: "Temperatura média", value: "-" },
        { label: "Umidade", value: "-" },
        { label: "Balanço Hídrico", value: "-" },
        { label: "Taxa de Sudorese", value: "-" },
        { label: "Variação de Massa Corporal", value: "-" },
      ],
    },
  ]);

  //fiquei em divida de qual endereço colocar então deixei o link gerado pelo vite, mas precisa substituir dps
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5173";

    async function loadReport() {
      try {
        const response = await fetch(`${apiUrl}/report`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setMetrics([
          { label: "Média", value: data.average ?? "0,0" },
          { label: "Mediana", value: data.median ?? "0,0" },
          { label: "Desvio", value: data.stdDeviation ?? "0,0" },
        ]);

        setSummary({
          title: data.summary?.title ?? "Sessões registradas",
          badge: data.summary?.badge ?? "10 Sessões",
          description: data.summary?.description ?? "Exportar relatório geral",
        });

        setSections(
          (data.sections ?? sections).map((section: any, index: number) => ({
            title: section.title,
            badge: section.badge,
            accentClass:
              index === 0
                ? styles.sectionCardGreen
                : index === 1
                  ? styles.sectionCardPink
                  : styles.sectionCardYellow,
            fields: section.fields ?? [],
          })),
        );
      } catch {

      }
    }

    loadReport();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <svg
          className={styles.userIconSvg}
          viewBox="0 0 24 24"
          fill="currentColor"
          onClick={() => navigate("/dados-atleta")}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </header>

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
            Gráfico: Tempo X taxa de sudorese
          </span>
          <div className={styles.chartPlaceholder}>
            colocar gráfico aqui
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitle}>{summary.title}</span>
            <span className={styles.sectionBadge}>{summary.badge}</span>
          </div>
          <div className={styles.sectionText}>{summary.description}</div>
        </div>

        {sections.map((section) => (
          <div
            key={section.title}
            className={`${styles.sectionCard} ${section.accentClass}`}
          >
            <div className={styles.sectionTitleRow}>
              <span className={styles.sectionTitle}>{section.title}</span>
              <span className={styles.sectionBadge}>{section.badge}</span>
            </div>
            {section.fields.map((field) => (
              <div key={field.label} className={styles.sectionItem}>
                <span className={styles.sectionItemLabel}>{field.label}:</span>
                <span className={styles.sectionItemValue}>{field.value}</span>
              </div>
            ))}
          </div>
        ))}

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.reportsBtn}
            onClick={() => navigate("/menu-adm")}
          >
            Voltar
          </button>
        </div>
      </main>
    </div>
  );
}