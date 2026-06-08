'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function registrar() {
    if (!nombre || !email || !password) {
      alert('Completa todos los campos')
      return
    }

    const { error } = await supabase.from('usuarios').insert([
      {
        nombre,
        email,
        password,
        aprobado: false
      }
    ])

    if (error) {
      alert(error.message)
      return
    }

    alert(
      'Registro enviado correctamente. Tu cuenta será activada cuando se confirme el pago.'
    )

    setNombre('')
    setEmail('')
    setPassword('')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#006b2d',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: 40,
          borderRadius: 20,
          width: 400
        }}
      >
        <h1>🏆 Registro Polla Mundialista</h1>

        <input
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 15 }}
        />

        <input
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 15 }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 15 }}
        />

        <button
          onClick={registrar}
          style={{
            width: '100%',
            padding: 12,
            marginTop: 20,
            background: '#006b2d',
            color: 'white',
            border: 'none',
            borderRadius: 10
          }}
        >
          Registrarme
        </button>
      </div>
    </div>
  )
}