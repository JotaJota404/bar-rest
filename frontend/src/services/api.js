import axios from 'axios'

/**
 * Instância centralizada do Axios.
 * Todas as requisições ao backend passam por aqui,
 * com injeção automática do token JWT no cabeçalho Authorization.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição — injeta JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pdv_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de resposta — redireciona para login se token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pdv_token')
      localStorage.removeItem('pdv_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
