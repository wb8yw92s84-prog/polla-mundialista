'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id')
    if (usuarioId) {
      router.push('/pronosticos')
    }
  }, [router])

  return (
    <main className="min-h-screen bg-green-800 text-white flex items-center justify-center p-6">
      <div className="bg-white text-black rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          🏆 POLLA MUNDIALISTA 2026
        </h1>

        <p className="mb-6">
          Inicia sesión o regístrate para participar.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="bg-green-700 text-white w-full py-3 rounded-lg mb-4"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="bg-blue-700 text-white w-full py-3 rounded-lg"
        >
          Regístrate aquí
        </button>
      </div>
    </main>
  )
}