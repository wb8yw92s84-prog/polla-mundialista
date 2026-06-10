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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
      <img
        src="/login-mundial-2026-v2.png"
        alt="Mundial 2026"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md bg-black/70 backdrop-blur-md rounded-3xl border border-yellow-400 p-8 shadow-2xl text-white text-center">
        <h1 className="text-4xl font-black mb-2">
          Polla Mundialista
        </h1>

        <p className="text-yellow-300 font-bold mb-4">
          USA · México · Canadá 2026
        </p>

        <p className="text-gray-200 mb-8">
          Regístrate, pronostica tus partidos y compite por el primer lugar.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-4 rounded-xl font-black mb-4"
        >
          INICIAR SESIÓN
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="bg-yellow-400 hover:bg-yellow-500 text-black w-full py-4 rounded-xl font-black"
        >
          REGÍSTRATE AQUÍ
        </button>

        <p className="text-xs text-gray-300 mt-6">
          Acceso habilitado después de aprobación del administrador.
        </p>
      </div>
    </main>
  )
}