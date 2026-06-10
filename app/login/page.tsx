'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function iniciarSesion() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()

    if (error || !data) {
      alert('Correo o contraseña incorrectos')
      return
    }

    if (!data.aprobado) {
      alert(
        'Tu cuenta aún no ha sido aprobada. Se activará cuando se confirme el pago.'
      )
      return
    }

    localStorage.setItem('usuario_id', data.id)
    localStorage.setItem('usuario_nombre', data.nombre)

    router.push('/pronosticos')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-emerald-800 flex items-center justify-center p-6">

      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#facc15,_transparent_35%),radial-gradient(circle_at_bottom,_#22c55e,_transparent_40%)]" />

      <div className="relative bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full border border-yellow-300">

        <div className="flex justify-center mb-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-xl">
            <span className="text-5xl">🏆</span>
          </div>
        </div>

        <p className="text-center uppercase tracking-[0.25em] text-green-800 font-black text-sm mb-2">
          FIFA World Cup 2026
        </p>

        <h1 className="text-4xl font-black text-center text-green-950 mb-2">
          Polla Mundialista
        </h1>

        <p className="text-center text-gray-700 font-semibold mb-1">
          🇺🇸 Estados Unidos · 🇲🇽 México · 🇨🇦 Canadá
        </p>

        <p className="text-center text-gray-500 mb-8 text-sm">
          Ingresa con tu cuenta para registrar tus pronósticos
        </p>

        <input
          className="border-2 border-gray-200 focus:border-green-700 outline-none p-4 w-full mb-4 rounded-xl"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border-2 border-gray-200 focus:border-green-700 outline-none p-4 w-full mb-6 rounded-xl"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={iniciarSesion}
          className="bg-green-800 hover:bg-green-900 transition text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg"
        >
          Ingresar
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="mt-4 bg-yellow-400 hover:bg-yellow-500 transition text-green-950 w-full py-3 rounded-xl font-black"
        >
          Crear cuenta
        </button>

        <p className="text-center text-xs text-gray-500 mt-6">
          Los participantes deben ser aprobados por el administrador.
        </p>

      </div>
    </main>
  )
}