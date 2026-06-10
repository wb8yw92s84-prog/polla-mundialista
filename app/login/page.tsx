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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-4">
      <img
        src="/login-mundial-2026-v2.png"
        alt="Mundial 2026"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-black/45" />

      <div className="relative z-20 w-full max-w-md bg-black/75 backdrop-blur-md rounded-3xl border border-yellow-400 p-6 md:p-8 shadow-2xl text-white">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-2">
          Polla Mundialista
        </h1>

        <p className="text-center text-yellow-300 mb-6 font-semibold">
          FIFA World Cup 2026
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/70 border border-gray-500 text-white placeholder-gray-300 mb-4 outline-none focus:border-yellow-400"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/70 border border-gray-500 text-white placeholder-gray-300 mb-6 outline-none focus:border-yellow-400"
        />

        <button
          type="button"
          onClick={iniciarSesion}
          className="relative z-30 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-4 rounded-xl font-bold text-lg"
        >
          INGRESAR
        </button>

        <button
          type="button"
          onClick={() => router.push('/registro')}
          className="relative z-30 w-full mt-4 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black py-4 rounded-xl font-bold"
        >
          CREAR CUENTA
        </button>
      </div>

      <a
        href="https://wa.me/593987404664?text=Hola,%20estoy%20interesado%20en%20participar%20en%20la%20Polla%20Mundialista%202026."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 bg-green-500 hover:bg-green-600 text-white px-5 py-4 rounded-full shadow-2xl font-bold"
      >
        💬 WhatsApp
      </a>
    </main>
  )
}