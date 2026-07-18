import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Toast from '../components/Toast';

export default function Comanda() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const { mesas, getComanda } = useAppContext();
  
  const [showToast, setShowToast] = useState(false);
  
  const idMesaNum = parseInt(mesaId);
  const mesa = mesas.find(m => m.id === idMesaNum);
  const comanda = getComanda(idMesaNum);

  if (!mesa || !comanda) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-white text-xl font-bold">Comanda não encontrada</h2>
        <button 
          onClick={() => navigate('/mesas')}
          className="mt-6 bg-[#0f3460] text-white px-6 py-3 rounded-xl font-medium"
        >
          Voltar ao Mapa
        </button>
      </div>
    );
  }

  const totalComanda = comanda.itens.reduce((acc, item) => acc + item.subtotal, 0);

  const handleConfirmarPedido = () => {
    // MOCK: Num fluxo real, faria um POST pra API confirmando os novos itens
    setShowToast(true);
    // Após 1.5s, volta pro mapa de mesas
    setTimeout(() => {
      navigate('/mesas');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col pb-28">
      <Toast 
        visible={showToast} 
        onClose={() => setShowToast(false)} 
        message="Pedido enviado para a cozinha!" 
      />

      {/* Header */}
      <header className="bg-[#16213e] p-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => navigate(`/pedidos/${mesa.id}`)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-amber-400">Comanda - Mesa {mesa.numero}</h1>
          <p className="text-slate-400 text-xs">{comanda.itens.length} itens lançados</p>
        </div>
      </header>

      {/* Lista de Itens */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {comanda.itens.length === 0 ? (
            <p className="text-slate-400 text-center mt-10">Nenhum item adicionado ainda.</p>
          ) : (
            comanda.itens.map((item, index) => (
              <div key={item.id + index} className="bg-[#16213e] p-4 rounded-xl flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0f3460] text-amber-400 font-bold px-2 py-1 rounded-md text-sm">
                      {item.quantidade}x
                    </span>
                    <h3 className="text-white font-medium">{item.nome}</h3>
                  </div>
                  {item.observacao && (
                    <p className="text-slate-400 text-sm mt-1 flex items-start gap-1">
                      <span className="text-amber-500/70">↳</span> {item.observacao}
                    </p>
                  )}
                </div>
                <div className="text-right pl-4">
                  <p className="text-white font-medium">{formatCurrency(item.subtotal)}</p>
                  {item.quantidade > 1 && (
                    <p className="text-slate-500 text-xs">{formatCurrency(item.precoUnitario)} cada</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Rodapé Fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#16213e] shadow-[0_-4px_15px_rgba(0,0,0,0.3)] border-t border-[#0f3460]">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-slate-300 text-lg">Total do Pedido</span>
            <span className="text-amber-400 text-2xl font-bold">{formatCurrency(totalComanda)}</span>
          </div>
          
          <button
            onClick={handleConfirmarPedido}
            disabled={comanda.itens.length === 0}
            className="w-full bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-6 h-6" />
            Confirmar e Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
