
import React from 'react';
import { useActiveConductors } from '../hooks/useActiveConductors';

// Um componente Switch simples para não dependermos de bibliotecas externas
const SimpleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={handleChange} style={{ display: 'none' }} />
      <span 
        style={{
          position: 'relative',
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: checked ? '#22c55e' : '#888',
          transition: 'background-color 0.2s',
        }}
      >
        <span 
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'white',
            transition: 'left 0.2s',
          }}
        />
      </span>
    </label>
  );
};


export const ConductorStatusManager: React.FC = () => {
  const { conductors, loading, error, updateConductorStatus } = useActiveConductors();

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    const success = await updateConductorStatus(id, newStatus);
    if (!success) {
      // Opcional: Adicionar feedback visual se a atualização falhar
      alert('Falha ao atualizar o status do condutor.');
    }
  };

  if (loading) {
    return <div>A carregar condutores...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Gestão de Condutores Ativos</h2>
      {conductors.length === 0 ? (
        <p>Nenhum condutor ativo encontrado.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {conductors.map((conductor) => (
            <li key={conductor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span>{conductor.name || `Condutor (ID: ${conductor.conductor_id.substring(0, 6)}...)`}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{conductor.is_active ? 'Ativo' : 'Inativo'}</span>
                <SimpleSwitch 
                  checked={conductor.is_active}
                  onChange={(newStatus) => handleStatusChange(conductor.id, newStatus)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p style={{ fontSize: '0.8em', color: '#555', marginTop: '16px' }}>
        As alterações são refletidas em tempo real em todos os dispositivos.
      </p>
    </div>
  );
};
