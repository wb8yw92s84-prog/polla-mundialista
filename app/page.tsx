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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-emerald-800 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#facc15,_transparent_35%),radial-gradient(circle_at_bottom,_#22c55e,_transparent_40%)]" />

      <div className="relative bg-white/95 text-black rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-yellow-300">
        <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-xl">
          <span className="text-5xl">🏆</span>
        </div>

        <p className="uppercase tracking-[0.25em] text-green-800 font-black text-sm mb-2">
          Mundial 2026
        </p>

        <h1 className="text-4xl font-black mb-3 text-green-950">
          Polla Mundialista
        </h1>

        <p className="text-gray-700 mb-2 font-semibold">
          USA · México · Canadá
        </p>

        <p className="text-gray-600 mb-8">
          Regístrate, pronostica tus partidos y compite por el primer lugar.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="bg-green-800 hover:bg-green-900 text-white w-full py-3 rounded-full mb-4 font-bold shadow-lg"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="bg-yellow-400 hover:bg-yellow-500 text-green-950 w-full py-3 rounded-full font-black shadow-lg"
        >
          Regístrate aquí
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Acceso habilitado después de aprobación del administrador.
        </p>
      </div>
    </main>
  )
}