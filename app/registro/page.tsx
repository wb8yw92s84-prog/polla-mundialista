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
        background:
          'linear-gradient(135deg, #006b2d 0%, #004d1f 50%, #002b11 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.85)',
          padding: '40px',
          borderRadius: '24px',
          width: '420px',
          border: '2px solid #facc15',
          boxShadow: '0 0 30px rgba(0,0,0,0.4)'
        }}
      >
        <h1
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: 'bold'
          }}
        >
          🏆 Polla Mundialista
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#facc15',
            marginBottom: '30px',
            fontWeight: 'bold'
          }}
        >
          Registro de Participantes
        </p>

        <input
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '15px',
            background: '#111',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '12px'
          }}
        />

        <input
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '15px',
            background: '#111',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '12px'
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '20px',
            background: '#111',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '12px'
          }}
        />

        <button
          onClick={registrar}
          style={{
            width: '100%',
            padding: '14px',
            background: '#facc15',
            color: 'black',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          REGISTRARME
        </button>

        <p
          style={{
            textAlign: 'center',
            color: '#d1d5db',
            marginTop: '20px',
            fontSize: '12px'
          }}
        >
          Tu cuenta quedará pendiente de aprobación hasta confirmar el pago.
        </p>
      </div>
    </div>
  )
}