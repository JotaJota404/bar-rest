/**
 * Utilitários de formatação — Buteco da Gente PDV
 */

/**
 * Formata um número como moeda brasileira (R$)
 * @param {number} value
 * @returns {string} ex: "R$ 12,90"
 */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data ISO para exibição brasileira
 * @param {string} isoString
 * @returns {string} ex: "18/07/2026 14:30"
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

/**
 * Divide um valor total por número de pessoas
 * @param {number} total
 * @param {number} pessoas
 * @returns {{ porPessoa: number, resto: number }}
 */
export function dividirConta(total, pessoas) {
  if (!pessoas || pessoas <= 0) return { porPessoa: 0, resto: 0 }
  const porPessoa = Math.floor((total / pessoas) * 100) / 100
  const resto = Math.round((total - porPessoa * pessoas) * 100) / 100
  return { porPessoa, resto }
}
