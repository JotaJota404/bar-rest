import { createContext, useState, useContext, useEffect } from 'react';
import { MESAS_MOCK, PRODUTOS_MOCK } from '../mocks/data';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [mesas, setMesas] = useState(MESAS_MOCK);
  const [comandas, setComandas] = useState({});
  const [produtos] = useState(PRODUTOS_MOCK);

  // Exemplo de estrutura de comanda:
  // comandas = {
  //   1: { id: 101, mesaId: 1, itens: [{ id: 1, produtoId: 1, quantidade: 2, observacao: 'Sem colarinho', subtotal: 19.8 }] }
  // }

  const abrirMesa = (mesaId) => {
    setMesas((prev) =>
      prev.map((m) => (m.id === mesaId ? { ...m, status: 'OCUPADA' } : m))
    );
    if (!comandas[mesaId]) {
      setComandas((prev) => ({
        ...prev,
        [mesaId]: { id: Date.now(), mesaId, itens: [] },
      }));
    }
  };

  const getComanda = (mesaId) => comandas[mesaId] || null;

  const adicionarItem = (mesaId, item) => {
    setComandas((prev) => {
      const comanda = prev[mesaId];
      if (!comanda) return prev; // Comanda precisa estar aberta
      return {
        ...prev,
        [mesaId]: {
          ...comanda,
          itens: [...comanda.itens, item],
        },
      };
    });
  };

  return (
    <AppContext.Provider
      value={{ mesas, produtos, comandas, abrirMesa, getComanda, adicionarItem }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
