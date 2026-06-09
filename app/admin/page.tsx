'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([])

  async function cargarUsuariosPendientes() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('aprobado', false)

    console.log('Usuarios:', data)
    console.log('Error:', error)

    setUsuariosPendientes(data || [])
  }

  async function aprobarUsuario(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ aprobado: true })
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Usuario aprobado')
    cargarUsuariosPendientes()
  }

  useEffect(() => {
    cargarUsuariosPendientes()
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        padding: '40px',
      }}
    >
      <h1 style={{ fontSize: '40px', marginBottom: '30px' }}>
        Panel Admin
      </h1>

      <div
        style={{
          background: 'white',
          color: 'black',
          padding: '20px',
          borderRadius: '12px',
        }}
      >
        <h2>Solicitudes pendientes</h2>

        {usuariosPendientes.length === 0 ? (
          <p>No hay participantes pendientes.</p>
        ) : (
          usuariosPendientes.map((usuario) => (
            <div
              key={usuario.id}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '15px 0',
              }}
            >
              <p>
                <strong>{usuario.nombre}</strong>
              </p>

              <p>{usuario.email}</p>

              <button
                onClick={() => aprobarUsuario(usuario.id)}
                style={{
                  background: 'green',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  marginTop: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Aprobar
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}