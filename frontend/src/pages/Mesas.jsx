import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MesaCard from '../components/MesaCard';
import { LogOut } from 'lucide-react';

export default function Mesas() {
  const { mesas, getComanda } = useAppContext();
  const navigate = useNavigate();
  
  // Pegar usuário mockado
  const user = JSON.parse(localStorage.getItem('pdv_user') || '{"nome":"Garçom"}');

  const handleLogout = () => {
    localStorage.removeItem('pdv_token');
    localStorage.removeItem('pdv_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="bg-[#16213e] p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-amber-400">Mapa de Mesas</h1>
          <p className="text-slate-400 text-xs">Olá, {user.nome}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      {/* Grid de Mesas */}
      <main className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {mesas.map((mesa) => {
            const comanda = getComanda(mesa.id);
            const totalItens = comanda ? comanda.itens.length : 0;
            
            return (
              <MesaCard 
                key={mesa.id} 
                mesa={mesa} 
                totalItens={totalItens}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
