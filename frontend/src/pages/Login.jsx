/**
 * Página de Login — Buteco da Gente PDV
 * Placeholder para a Fase 4 (implementação completa).
 * PIN numérico + autenticação JWT via /api/auth/login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePinPress = (digit) => {
    if (pin.length < 6) setPin((prev) => prev + digit)
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('PIN deve ter no mínimo 4 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    
    // MOCK: Qualquer PIN >= 4 dígitos entra
    setTimeout(() => {
      localStorage.setItem('pdv_token', 'mock_token_123');
      localStorage.setItem('pdv_user', JSON.stringify({ nome: 'João Garçom', role: 'GARCOM' }));
      setLoading(false);
      navigate('/mesas');
    }, 500); // Simulando delay de rede
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="bg-[#16213e] rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo / Título */}
        <div className="text-center">
          <div className="text-5xl mb-2">🍺</div>
          <h1 className="text-2xl font-bold text-amber-400">Buteco da Gente</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema PDV — Digite seu PIN</p>
        </div>

        {/* Display do PIN */}
        <div className="flex gap-3 my-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? 'bg-amber-400 border-amber-400'
                  : 'bg-transparent border-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              id={`pin-btn-${d}`}
              onClick={() => handlePinPress(String(d))}
              className="h-14 rounded-xl bg-[#0f3460] text-white text-xl font-semibold
                         hover:bg-amber-400 hover:text-[#1a1a2e] active:scale-95
                         transition-all duration-150 shadow"
            >
              {d}
            </button>
          ))}
          <button
            id="pin-btn-clear"
            onClick={handleClear}
            className="h-14 rounded-xl bg-[#0f3460] text-slate-400 text-sm font-medium
                       hover:bg-red-600 hover:text-white active:scale-95
                       transition-all duration-150 shadow"
          >
            Limpar
          </button>
          <button
            id="pin-btn-0"
            onClick={() => handlePinPress('0')}
            className="h-14 rounded-xl bg-[#0f3460] text-white text-xl font-semibold
                       hover:bg-amber-400 hover:text-[#1a1a2e] active:scale-95
                       transition-all duration-150 shadow"
          >
            0
          </button>
          <button
            id="pin-btn-enter"
            onClick={handleSubmit}
            disabled={loading}
            className="h-14 rounded-xl bg-amber-400 text-[#1a1a2e] text-sm font-bold
                       hover:bg-amber-300 active:scale-95 disabled:opacity-50
                       transition-all duration-150 shadow"
          >
            {loading ? '...' : 'Entrar'}
          </button>
        </div>

        {/* Erro */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
