
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Corrigido o caminho para o cliente supabase

// O tipo de dados com base na sua tabela active_conductors e a relação com conductors
export type ActiveConductor = {
  id: string; // uuid
  conductor_id: string; // uuid
  is_active: boolean;
  name: string | null;
  conductors: {
    whatsapp: string | null;
  } | null;
};

export const useActiveConductors = () => {
  const [conductors, setConductors] = useState<ActiveConductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Função para buscar os dados iniciais
    const fetchInitialConductors = async () => {
      setLoading(true);
      // Query com JOIN para ir buscar o whatsapp à tabela 'conductors'
      const { data, error } = await supabase
        .from('active_conductors')
        .select('id, conductor_id, is_active, name, conductors(whatsapp)');

      if (error) {
        console.error('Erro ao buscar condutores:', error.message);
        setError(error.message);
        setConductors([]);
      } else {
        // Mapear os dados para o tipo correto, lidando com o array de conductors
        const mappedData = (data || []).map(item => ({
          id: item.id,
          conductor_id: item.conductor_id,
          is_active: item.is_active,
          name: item.name,
          conductors: Array.isArray(item.conductors) && item.conductors.length > 0 
            ? { whatsapp: item.conductors[0].whatsapp }
            : null
        }));
        setConductors(mappedData);
      }
      setLoading(false);
    };

    fetchInitialConductors();

    // 2. Configurar a subscrição em tempo real
    const channel = supabase
      .channel('active_conductors_realtime')
      .on<ActiveConductor>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_conductors' },
        async (payload) => {
          console.log('Realtime event received:', payload);
          // Como o payload não contém os dados do JOIN, vamos refazer a query para obter os dados completos
          // É uma abordagem simples e garante consistência de dados.
          await fetchInitialConductors();
        }
      )
      .subscribe();

    // 3. Limpar a subscrição ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Função para atualizar o status de um condutor
  const updateConductorStatus = async (conductorId: string, newStatus: boolean) => {
    console.log('Tentando atualizar condutor:', conductorId, 'para status:', newStatus);
    
    // Atualização otimista do estado local para feedback imediato
    setConductors(prevConductors =>
      prevConductors.map(conductor =>
        conductor.id === conductorId
          ? { ...conductor, is_active: newStatus }
          : conductor
      )
    );
    
    const { data, error } = await supabase
      .from('active_conductors')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', conductorId)
      .select();

    console.log('Resultado da atualização:', { data, error });

    if (error) {
      console.error('Erro ao atualizar status:', error.message);
      setError(error.message);
      // Reverter a atualização otimista em caso de erro
      setConductors(prevConductors =>
        prevConductors.map(conductor =>
          conductor.id === conductorId
            ? { ...conductor, is_active: !newStatus } // Reverte para o estado anterior
            : conductor
        )
      );
      return false;
    }
    
    console.log('Atualização bem-sucedida:', data);
    return true;
  };

  return { conductors, loading, error, updateConductorStatus };
};
