/// <reference types="vite/client" />

const API = (import.meta as any).env?.VITE_API_URL || 'http://192.168.15.2:5001' // preciso disso pro app

export default API