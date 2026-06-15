import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';

const DadosAdm = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [cargo, setCargo] = useState("");

  const [listaCargos, setListaCargos] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipesAdmin, setListaEquipesAdmin] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDadosAdm() {
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

        const response = await fetch(`${apiUrl}/admin/perfil`, { headers })
          
        if (!response.ok) throw new Error("Falha ao carregar alguns dados do servidor.");

        const dadosPerfil = await response.json();

        if (dadosPerfil.data) {
          const adm = dadosPerfil.data;
          setNome(adm.name || "");
          
          if (adm.birth_date) {
            const [y, m, d] = adm.birth_date.split("-");
            setDataNascimento(`${d}/${m}/${y}`);
          }
          
          setGenero(adm.gender || "");
          setCargo(adm.role || "");
          
          setListaEquipesAdmin(adm.team_name || []);
        }

      } catch (error) {
        console.error("Erro ao buscar os dados do administrador:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDadosAdm();
  }, [navigate]);

  async function handleSalvar() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("token");

      const dadosAtualizados = {
        full_name: nome,
        birth_date: dataNascimento,
        gender: genero,
        role_title: cargo, 
        team_id: ""
      };

      console.log("Enviando para o Banco (ADM):", dadosAtualizados);
      
      const response = await fetch(`${apiUrl}/admin/perfil`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dadosAtualizados)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar os dados.");
      }

      alert("Dados do administrador atualizados com sucesso!");
      navigate("/menu-adm");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert(error.message || "Erro ao salvar os dados.");
    }
  }

  if (loading) {
    return (
      <div className={authStyles.container} style={{ justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Carregando dados...</h2>
      </div>
    );
  }

  return (
    <div className={authStyles.container}>
      <div className={authStyles.card}>
        <div className={formStyles.content}>
          <div className={formStyles.body}>
            
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME COMPLETO</label>
              <input 
                type="text" 
                className={formStyles.input} 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>DATA DE NASCIMENTO</label>
              <input 
                type="text" 
                placeholder="DD/MM/AAAA" 
                className={formStyles.input} 
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>GÊNERO</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                  </select>
              </div>
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>CARGO</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      <option value="trainer">Treinador</option>
                      <option value="nutritionist">Nutricionista</option>
                      {listaCargos.map((c) => (
                        <option key={c.id} value={c.nome}>
                          {c.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>EQUIPE(S)</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    defaultValue=""
                  >
                      {listaEquipesAdmin.length === 0 ? (
                    <option value="" disabled>Nenhuma equipe vinculada</option>
                  ) : (
                    <>
                      <option value="" disabled>Ver equipes registradas ({listaEquipesAdmin.length})</option>
                      {listaEquipesAdmin.map((eq) => (
                        <option key={eq.id} value={eq.id} disabled>
                          {eq.nome}
                        </option>
                      ))}
                    </>
                  )}
                  </select>
              </div>
            </div>

          </div>

          <div className={formStyles.buttonContainer}>
  
            <button 
              className={`${authStyles.btn}`} 
              type="button" 
              onClick={() => navigate("/menu-adm")}
    
            >
              Cancelar
            </button>
            
            <button 
              className={`${authStyles.btn} ${authStyles.btnPrimary}`} 
              type="button" 
              onClick={handleSalvar}
            >
              Salvar
            </button>
          </div>
            <div className={formStyles.buttonContainer}>
              <button className={authStyles.btn} onClick={() => navigate("/")}>Logout</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DadosAdm;