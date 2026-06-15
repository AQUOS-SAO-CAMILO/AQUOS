import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';

const DadosAtleta = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [listaModalidades, setListaModalidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodosOsDados() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const headers = { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        };

        const response = await fetch(`${apiUrl}/atleta/perfil`, { headers })
          
        if (!response.ok) throw new Error("Falha ao carregar alguns dados do servidor.");

        const dadosPerfil = await response.json();

        setListaModalidades([
          "Futebol", "Futsal", "Basquete", "Vôlei", "Natação",
          "Atletismo", "Ciclismo", "Tênis", "Handebol", "Rugby",
          "Corrida", "Musculação", "Jiu-Jitsu", "Judô", "Outro"
        ]);

        if (dadosPerfil.data) {
          const atleta = dadosPerfil.data;
          setNome(atleta.name || "");
          
          if (atleta.birth_date) {
            setDataNascimento(atleta.birth_date.split("T")[0]);
          }
          
          setGenero(atleta.gender || "");
          setPeso(atleta.body_weight_kg || "");
          setAltura(atleta.height_cm || "");
          setModalidade(atleta.sport_modality || "");
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTodosOsDados();
  }, [navigate]);

  async function handleSalvar() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/atleta/perfil`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: nome, 
          birth_date: dataNascimento, 
          gender: genero, 
          sport_modality: modalidade, 
          body_weight_kg: peso, 
          height_cm: altura  
        })
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      alert("Dados atualizados com sucesso!");
      navigate("/menu-atleta");
    } catch (error) {
      alert("Erro ao salvar os dados.");
    }
  }

  if (loading) {
    return <div className={authStyles.container} style={{ justifyContent: 'center' }}><h2>Carregando...</h2></div>;
  }

  return (
    <div className={authStyles.container}>
      <div className={authStyles.card}>
        <div className={formStyles.content}>
          <div className={formStyles.body}>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME</label>
              <input className={formStyles.input} type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>DATA DE NASCIMENTO</label>
              <input className={formStyles.input} type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>GÊNERO</label>
              <select className={formStyles.input} value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="" disabled>Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>PESO (kg)</label>
              <input className={formStyles.input} type="number" step="0.1" min="0" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ex: 70.5" />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>ALTURA (cm)</label>
              <input className={formStyles.input} type="number" step="0.1" min="0" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="Ex: 175" />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>MODALIDADE</label>
              <select className={formStyles.input} value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
                <option value="" disabled>Selecione</option>
                {listaModalidades.map(mod => <option key={mod} value={mod}>{mod}</option>)}
              </select>
            </div>

          </div>
          <div className={formStyles.buttonContainer}>
            <button className={authStyles.btn} onClick={() => navigate("/menu-atleta")}>Cancelar</button>
            <button className={`${authStyles.btn} ${authStyles.btnPrimary}`} onClick={handleSalvar}>Salvar</button>
          </div>
          <div className={formStyles.buttonContainer}>
            <button className={authStyles.btn} onClick={() => navigate("/")}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DadosAtleta;