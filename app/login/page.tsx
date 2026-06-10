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
      alert('Tu cuenta aún no ha sido aprobada. Se activará cuando se confirme el pago.')
      return
    }

    localStorage.setItem('usuario_id', data.id)
    localStorage.setItem('usuario_nombre', data.nombre)
    router.push('/pronosticos')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <img
        src="/login-mundial-2026.png"
        alt="Fondo Mundial 2026"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 w-full max-w-sm bg-black/35 backdrop-blur-sm text-white rounded-3xl shadow-2xl p-6 border border-yellow-400 mt-28">
        <input
          className="bg-black/70 border border-white/40 p-4 w-full mb-4 rounded-xl text-white placeholder-gray-300 outline-none focus:border-yellow-400"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="bg-black/70 border border-white/40 p-4 w-full mb-5 rounded-xl text-white placeholder-gray-300 outline-none focus:border-yellow-400"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={iniciarSesion}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-4 rounded-xl font-black shadow-lg"
        >
          INGRESAR
        </button>

        <button
          onClick={() => router.push('/registro')}
          className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black w-full py-3 rounded-xl font-black"
        >
          CREAR CUENTA
        </button>
      </div>
    </main>
  )
}