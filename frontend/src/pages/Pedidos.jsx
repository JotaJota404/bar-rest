import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { ChevronLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import Modal from '../components/Modal';

export default function Pedidos() {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const { mesas, produtos, abrirMesa, adicionarItem, getComanda } = useAppContext();
  
  const [categoria, setCategoria] = useState('BEBIDA');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  
  const idMesaNum = parseInt(mesaId);
  const mesa = mesas.find(m => m.id === idMesaNum);
  const comanda = getComanda(idMesaNum);

  // Se a mesa estiver LIVRE, abrimos ao entrar nesta página
  useEffect(() => {
    if (mesa && mesa.status === 'LIVRE') {
      abrirMesa(idMesaNum);
    }
  }, [mesa, idMesaNum, abrirMesa]);

  if (!mesa) return <div className="p-4 text-white">Mesa não encontrada</div>;

  const produtosFiltrados = produtos.filter(p => p.categoria === categoria);

  const handleOpenModal = (produto) => {
    setProdutoSelecionado(produto);
    setQuantidade(1);
    setObservacao('');
  };

  const handleConfirmarItem = () => {
    adicionarItem(idMesaNum, {
      id: Date.now(),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      quantidade,
      observacao,
      precoUnitario: produtoSelecionado.preco,
      subtotal: produtoSelecionado.preco * quantidade
    });
    setProdutoSelecionado(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col pb-24">
      {/* Header */}
      <header className="bg-[#16213e] p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/mesas')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-amber-400">Mesa {mesa.numero}</h1>
            <p className="text-slate-400 text-xs">Novo Pedido</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-2">
        {['BEBIDA', 'COMIDA'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              categoria === cat 
                ? 'bg-amber-500 text-[#1a1a2e]' 
                : 'bg-[#0f3460] text-slate-400 hover:bg-[#16213e]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      <main className="flex-1 p-4 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {produtosFiltrados.map(produto => (
            <button
              key={produto.id}
              onClick={() => handleOpenModal(produto)}
              className="bg-[#16213e] p-4 rounded-2xl border border-[#0f3460] hover:border-amber-500/50 flex flex-col text-left transition-all active:scale-95"
            >
              <h3 className="text-white font-semibold text-lg leading-tight mb-1">{produto.nome}</h3>
              <p className="text-amber-400 font-medium mt-auto">{formatCurrency(produto.preco)}</p>
            </button>
          ))}
        </div>
      </main>

      {/* FAB (Floating Action Button) para a comanda */}
      {comanda && comanda.itens.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1a1a2e] to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
            <button
              onClick={() => navigate(`/comanda/${mesa.id}`)}
              className="bg-amber-500 hover:bg-amber-400 text-[#1a1a2e] flex items-center gap-3 px-6 py-4 rounded-full font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-amber-500">
                  {comanda.itens.length}
                </span>
              </div>
              <span>Ver Comanda</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Item */}
      <Modal 
        isOpen={!!produtoSelecionado} 
        onClose={() => setProdutoSelecionado(null)}
        title="Adicionar Item"
      >
        {produtoSelecionado && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl text-white font-semibold">{produtoSelecionado.nome}</h3>
              <p className="text-amber-400 text-lg">{formatCurrency(produtoSelecionado.preco)}</p>
            </div>

            <div className="flex items-center justify-between bg-[#0f3460] p-2 rounded-xl">
              <button 
                onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                className="w-12 h-12 flex items-center justify-center bg-[#16213e] rounded-lg text-white hover:bg-[#1a1a2e]"
              >
                <Minus className="w-6 h-6" />
              </button>
              <span className="text-2xl font-bold text-white">{quantidade}</span>
              <button 
                onClick={() => setQuantidade(quantidade + 1)}
                className="w-12 h-12 flex items-center justify-center bg-[#16213e] rounded-lg text-white hover:bg-[#1a1a2e]"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Observação (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Sem gelo, limão espremido..."
                className="w-full bg-[#0f3460] text-white p-3 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none resize-none h-24"
              />
            </div>

            <button
              onClick={handleConfirmarItem}
              className="w-full bg-amber-500 text-[#1a1a2e] font-bold py-4 rounded-xl flex items-center justify-between px-6 hover:bg-amber-400 active:scale-95 transition-transform"
            >
              <span>Adicionar</span>
              <span>{formatCurrency(produtoSelecionado.preco * quantidade)}</span>
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
