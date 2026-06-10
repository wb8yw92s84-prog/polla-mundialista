'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function iniciarSesion() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-yellow-500">
        <h1 className="w-full border border-gray-600 bg-slate-800 text-white p-4 rounded-xl">
          Login Administrador
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 w-full mb-4"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 w-full mb-4"
        />

        <button
          onClick={iniciarSesion}
          className="bg-blue-700 text-white px-5 py-3 rounded-lg w-full"
        >
          Iniciar sesión
        </button>
      </div>
    </main>
  )
}
