import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import authStyles from '../styles/Auth.module.css';
import API from '../config';

export default function FiltroRelatorios() {
  const navigate = useNavigate();

  const [modalidades, setModalidades] = useState<string[]>([]);
  const [equipes, setEquipes] = useState<string[]>([]);
  const [atletas, setAtletas] = useState<string[]>([]);

  const [listaModalidades, setListaModalidades] = useState<{ id: string, nome: string }[]>([]);
  const [listaEquipes, setListaEquipes] = useState<{ id: string, nome: string }[]>([]);
  const [listaAtletas, setListaAtletas] = useState<{ id: string, nome: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiltros() {
      try {
                const token = localStorage.getItem("token");
        const headers: HeadersInit = { "Authorization": `Bearer ${token}` };

        const [resMod, resEq, resAtl] = await Promise.all([
          fetch(`${API}/api/modalidades`, { headers }),
          fetch(`${API}/api/equipes`, { headers }),
          fetch(`${API}/api/atletas`, { headers })
        ]);

        if (!resMod.ok || !resEq.ok || !resAtl.ok) {
          throw new Error("Erro ao carregar filtros do servidor.");
        }

        const [dataMod, dataEq, dataAtl] = await Promise.all([
          resMod.json(), resEq.json(), resAtl.json()
        ]);

        setListaModalidades(dataMod);
        setListaEquipes(dataEq);
        setListaAtletas(dataAtl);
      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
        setErro("Não foi possível carregar os filtros. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    fetchFiltros();
  }, []);

  const toggleSelection = (
    id: string, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  };

  const handleAvancar = () => {
    const params = new URLSearchParams();
    if (modalidades.length > 0) params.append('modality', modalidades.join(','));
    if (equipes.length > 0) params.append('team_id', equipes.join(','));
    if (atletas.length > 0) params.append('athlete_id', atletas.join(','));

    navigate(`/relatorio-adm?${params.toString()}`);
  };

  const cardListStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '8px 16px',
    maxHeight: '160px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0,0,0,0.02)'
  };

  const renderItem = (
    item: { id: string, nome: string }, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const isSelected = list.includes(item.id);
    return (
      <div 
        key={item.id} 
        onClick={() => toggleSelection(item.id, list, setList)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
        }}
      >
        <span style={{ 
          color: isSelected ? '#b71c1c' : '#555', 
          fontSize: '1rem', 
          fontWeight: isSelected ? '700' : '500' }}>
          {item.nome}
        </span>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          border: isSelected ? 'none' : '2px solid #ccc',
          backgroundColor: isSelected ? '#b71c1c' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isSelected && 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline></svg>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={authStyles.container} style={{ justifyContent: 'center' }}>
        <h2 style={{ color: '#000' }}>Carregando filtros...</h2>
      </div>
    );
  }

  if (erro) {
      return (
        <div className={authStyles.container} style={{ justifyContent: 'center' }}>
          <p style={{ color: '#b71c1c' }}>{erro}</p>
          <button onClick={() => navigate("/menu-adm")}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 24, border: '2px solid #b71c1c', color: '#b71c1c', background: 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>
            Voltar
          </button>
        </div>
      );
    }

  return (
    <div className={authStyles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
      <p style={{ color: '#000', fontSize: '18px', marginBottom: '32px' }}>SELECIONE OS DADOS PARA ANÁLISE</p>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '340px', gap: '28px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, marginLeft: '8px' }}>MODALIDADES</label>
          <div style={cardListStyle}>{listaModalidades.length === 0
              ? <p style={{ color: '#aaa', fontSize: '0.85rem', padding: '8px 0' }}>Nenhuma modalidade cadastrada.</p>
              : listaModalidades.map(m => renderItem(m, modalidades, setModalidades))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, marginLeft: '8px' }}>EQUIPES</label>
          <div style={cardListStyle}>{listaEquipes.length === 0
              ? <p style={{ color: '#aaa', fontSize: '0.85rem', padding: '8px 0' }}>Nenhuma equipe cadastrada.</p>
              : listaEquipes.map(eq => renderItem(eq, equipes, setEquipes))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 800, marginLeft: '8px' }}>ATLETAS</label>
          <div style={cardListStyle}>{listaAtletas.length === 0
              ? <p style={{ color: '#aaa', fontSize: '0.85rem', padding: '8px 0' }}>Nenhum atleta cadastrado.</p> 
              : listaAtletas.map(atl => renderItem(atl, atletas, setAtletas))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <button type="button" onClick={() => navigate("/menu-adm")} 
            style={{ flex: 1, backgroundColor: 'transparent', color: '#b71c1c', padding: '14px 0', borderRadius: '24px', border: '2px solid #b71c1c', fontWeight: 'bold' }}>
              Cancelar
          </button>
          <button type="button" onClick={handleAvancar} 
            style={{ flex: 1, backgroundColor: '#b71c1c', color: '#fff', padding: '14px 0', borderRadius: '24px', border: 'none', fontWeight: 'bold' }}>
              Avançar
          </button>
        </div>
      </div>
    </div>
  );
}