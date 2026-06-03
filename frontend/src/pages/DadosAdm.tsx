import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';
import formStyles from '../styles/Form.module.css';

const DadosAdm = () => {
  const navigate = useNavigate();

  // 1. Estados para controlar cada campo do formulário
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [cargo, setCargo] = useState("");
  const [equipe, setEquipe] = useState("");

  // 2. Estados para as opções que podem vir do banco de dados
  const [listaCargos, setListaCargos] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);

  // 3. Busca os dados atuais do Administrador assim que a tela abre (GET)
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
          "Authorization": `Bearer ${token}` // Autenticação para rotas protegidas
        };

        // Dispara as 3 chamadas simultaneamente
        const [resPerfil, resCargos, resEquipes] = await Promise.all([
          fetch(`${apiUrl}/api/adm/perfil`, { headers }), // Ajuste a rota se necessário
          fetch(`${apiUrl}/api/cargos`, { headers }),
          fetch(`${apiUrl}/api/equipes`, { headers })
        ]);

        // Verifica se todas as respostas deram sucesso (status 200-299)
        if (!resPerfil.ok || !resCargos.ok || !resEquipes.ok) {
          throw new Error("Falha ao carregar alguns dados do servidor.");
        }

        // Extrai o JSON das respostas (A correção principal está aqui!)
        const dadosPerfil = await resPerfil.json();
        const dadosCargos = await resCargos.json();
        const dadosEquipes = await resEquipes.json();

        // Preenche os estados com as listas
        setListaCargos(dadosCargos);
        setListaEquipes(dadosEquipes);

        // Preenche os estados com as informações do perfil
        setNome(dadosPerfil.nome || "");
        setDataNascimento(dadosPerfil.dataNascimento || "");
        setGenero(dadosPerfil.genero || "");
        setCargo(dadosPerfil.cargoId || "");
        setEquipe(dadosPerfil.equipeId || "");

      } catch (error) {
        console.error("Erro ao buscar os dados do administrador:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDadosAdm();
  }, [navigate]);

  // 4. Função acionada ao clicar em "Salvar" (PUT/PATCH)
  async function handleSalvar() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const token = localStorage.getItem("token");

      const dadosAtualizados = {
        nome,
        dataNascimento,
        genero,
        cargoId: cargo,
        equipeId: equipe
      };

      console.log("Enviando para o Banco (ADM):", dadosAtualizados);
      
      const response = await fetch(`${apiUrl}/api/adm/perfil`, {
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
            
            {/* NOME COMPLETO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>NOME COMPLETO</label>
              <input 
                type="text" 
                className={formStyles.input} 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* DATA DE NASCIMENTO */}
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

            {/* GÊNERO */}
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

            {/* CARGO */}
            <div className={formStyles.fieldGroup}>
              <label className={formStyles.label}>CARGO</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={formStyles.input} 
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      {listaCargos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

            {/* EQUIPE(S) */}
            <div className={`${formStyles.fieldGroup} ${equipe !== "" ? formStyles.fieldGroupActive : ''}`}>
              <label className={formStyles.label}>EQUIPE(S)</label>
              <div className={formStyles.selectWrapper}>
                  <select 
                    className={`${formStyles.input} ${equipe !== "" ? formStyles.inputActive : ''}`} 
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                  >
                      <option value="" disabled hidden>Selecione</option>
                      {listaEquipes.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nome}
                        </option>
                      ))}
                  </select>
              </div>
            </div>

          </div>

          {/* BOTÕES */}
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

        </div>
      </div>
    </div>
  );
};

export default DadosAdm;