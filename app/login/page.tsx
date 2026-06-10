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
      alert('Tu cuenta aún no ha sido aprobada.')
      return
    }

    localStorage.setItem('usuario_id', data.id)
    localStorage.setItem('usuario_nombre', data.nombre)

    router.push('/pronosticos')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <img
        src="/login-mundial-2026-v2.png"
        alt="Mundial 2026"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md bg-black/70 backdrop-blur-md rounded-3xl border border-yellow-400 p-8 shadow-2xl">

        <h1 className="text-white text-4xl font-black text-center mb-2">
          Polla Mundialista
        </h1>

        <p className="text-center text-yellow-300 mb-8 font-semibold">
          FIFA World Cup 2026
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/60 border border-gray-500 text-white mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/60 border border-gray-500 text-white mb-6"
        />

        <button
          onClick={iniciarSesion}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg"
        >
          INGRESAR
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-xl font-bold"
        >
          CREAR CUENTA
        </button>

      </div>
    </main>
  )
}