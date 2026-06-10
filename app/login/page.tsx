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
    <main
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: "url('/imagenes/login-mundial-2026.png')" }}
    >
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative bg-black/65 backdrop-blur-md text-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-yellow-400">
        <h1 className="text-3xl font-black text-center mb-2">
          Polla Mundialista
        </h1>

        <p className="text-center text-yellow-300 font-bold mb-6">
          USA · México · Canadá 2026
        </p>

        <input
          className="bg-black/50 border border-white/30 p-4 w-full mb-4 rounded-xl text-white placeholder-gray-300 outline-none focus:border-yellow-400"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="bg-black/50 border border-white/30 p-4 w-full mb-6 rounded-xl text-white placeholder-gray-300 outline-none focus:border-yellow-400"
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

        <p className="text-center text-xs text-gray-300 mt-5">
          Los participantes deben ser aprobados por el administrador.
        </p>
      </div>
    </main>
  )
}