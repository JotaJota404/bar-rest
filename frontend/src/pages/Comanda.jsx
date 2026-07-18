import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { ChevronLeft, CheckCircle2, AlertCircle, Users, Minus, Plus } from 'lucide-react';
import Toast from '../components/Toast';

export default function Comanda() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const { mesas, getComanda } = useAppContext();
  
  const [showToast, setShowToast] = useState(false);
  const [mesaObservacao, setMesaObservacao] = useState('');
  const [numPessoas, setNumPessoas] = useState(1);
  
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
  const valorPorPessoa = totalComanda / numPessoas;

  const handleConfirmarPedido = () => {
    // MOCK: Num fluxo real, faria um POST pra API confirmando o pedido/pagamento
    setShowToast(true);
    // Após 1.5s, volta pro mapa de mesas
    setTimeout(() => {
      navigate('/mesas');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col pb-72">
      <Toast 
        visible={showToast} 
        onClose={() => setShowToast(false)} 
        message="Ação confirmada com sucesso!" 
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

      {/* Main content */}
      <main className="flex-1 p-4 space-y-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          
          {/* Seção 1: Itens da Comanda */}
          <section>
            <h2 className="text-slate-300 font-semibold mb-3">Itens Consumidos</h2>
            {comanda.itens.length === 0 ? (
              <p className="text-slate-400 text-center mt-4">Nenhum item adicionado ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {comanda.itens.map((item, index) => (
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
                ))}
              </div>
            )}
          </section>

          {/* Seção 2: Observações da Mesa */}
          <section>
            <h2 className="text-slate-300 font-semibold mb-3">Observações Gerais (Opcional)</h2>
            <textarea
              value={mesaObservacao}
              onChange={(e) => setMesaObservacao(e.target.value)}
              placeholder="Ex: Quebrou 3 copos, cliente pediu pra embalar a sobra..."
              className="w-full bg-[#16213e] text-white p-4 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none resize-none h-24 shadow-inner"
            />
          </section>
        </div>
      </main>

      {/* Rodapé Fixo (Área de Pagamento) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#16213e] shadow-[0_-4px_15px_rgba(0,0,0,0.3)] border-t border-[#0f3460]">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          
          {/* Seção: Dividir Conta */}
          <div className="flex items-center justify-between bg-[#0f3460] p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300 font-medium text-sm">Dividir por:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setNumPessoas(Math.max(1, numPessoas - 1))}
                className="w-10 h-10 flex items-center justify-center bg-[#16213e] rounded-lg text-white hover:bg-[#1a1a2e]"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold text-white w-6 text-center">{numPessoas}</span>
              <button 
                onClick={() => setNumPessoas(numPessoas + 1)}
                className="w-10 h-10 flex items-center justify-center bg-[#16213e] rounded-lg text-white hover:bg-[#1a1a2e]"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Valores */}
          <div className="flex justify-between items-end px-2">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs">Total da Mesa</span>
              <span className="text-slate-200 text-lg font-semibold">{formatCurrency(totalComanda)}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-xs">Valor por Pessoa</span>
              <span className="text-amber-400 text-2xl font-bold">{formatCurrency(valorPorPessoa)}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmarPedido}
            disabled={comanda.itens.length === 0}
            className="w-full bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg active:scale-95 transition-all mt-2"
          >
            <CheckCircle2 className="w-6 h-6" />
            Finalizar Ação
          </button>
        </div>
      </div>
    </div>
  );
}
