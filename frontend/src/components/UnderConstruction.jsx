/**
 * Componente placeholder para as páginas em desenvolvimento.
 * Será removido na Fase 4.
 */

export default function UnderConstruction({ pageName }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] gap-4">
      <div className="text-6xl">🚧</div>
      <h2 className="text-xl font-semibold text-amber-400">{pageName}</h2>
      <p className="text-slate-400 text-sm">Em construção — Fase 4</p>
    </div>
  )
}
