/// <reference types="vite/client" />

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001'

export default API