import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function MesaCard({ mesa, totalItens = 0 }) {
  const navigate = useNavigate();
  const isLivre = mesa.status === 'LIVRE';

  const handleClick = () => {
    navigate(`/pedidos/${mesa.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-lg active:scale-95 ${
        isLivre
          ? 'bg-[#0f3460] hover:bg-[#16213e] border border-[#1a1a2e]'
          : 'bg-amber-500 hover:bg-amber-400 border border-amber-600'
      }`}
    >
      {/* Badge de Itens (se ocupada) */}
      {!isLivre && totalItens > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
          {totalItens}
        </div>
      )}

      <Users className={`w-8 h-8 ${isLivre ? 'text-slate-400' : 'text-[#1a1a2e]'}`} />
      
      <span className={`text-3xl font-bold ${isLivre ? 'text-white' : 'text-[#1a1a2e]'}`}>
        {mesa.numero}
      </span>
      
      <span className={`text-sm font-medium ${isLivre ? 'text-green-400' : 'text-[#1a1a2e] opacity-90'}`}>
        {isLivre ? 'LIVRE' : 'OCUPADA'}
      </span>
    </button>
  );
}
