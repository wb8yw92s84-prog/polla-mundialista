'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function iniciarSesion() {
    const correo = email.trim().toLowerCase()

    if (correo !== 'jxav_91@hotmail.com') {
      alert('No tienes permisos para acceder como administrador.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    })

    if (error) {
      alert('Correo o contraseña de administrador incorrectos.')
      return
    }

    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl shadow-2xl border border-yellow-500">
        <h1 className="text-3xl font-black text-white text-center mb-2">
          Login Administrador
        </h1>

        <p className="text-yellow-400 text-center mb-6 font-bold">
          Panel privado de la Polla Mundialista
        </p>

        <input
          type="email"
          placeholder="Correo administrador"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-600 bg-slate-800 text-white placeholder-gray-400 p-4 w-full mb-4 rounded-xl outline-none focus:border-yellow-400"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-600 bg-slate-800 text-white placeholder-gray-400 p-4 w-full mb-6 rounded-xl outline-none focus:border-yellow-400"
        />

        <button
          onClick={iniciarSesion}
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-4 rounded-xl w-full font-bold"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => router.push('/login')}
          className="mt-4 text-gray-300 w-full text-sm"
        >
          Volver al login de participantes
        </button>
      </div>
    </main>
  )
}