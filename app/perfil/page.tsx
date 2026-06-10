'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function PerfilPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<any>(null)
  const [posicion, setPosicion] = useState(0)
  const [puntos, setPuntos] = useState(0)
  const [pronosticos, setPronosticos] = useState(0)
  const [cargando, setCargando] = useState(true)

  async function cargarPerfil() {
    const usuarioId = localStorage.getItem('usuario_id')

    if (!usuarioId) {
      router.push('/login')
      return
    }

    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .single()

    const { data: todosPronosticos } = await supabase
      .from('pronosticos')
      .select('*')

    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('*')
      .eq('aprobado', true)

    const ranking = (usuarios || [])
      .map((u) => {
        const total = (todosPronosticos || [])
          .filter((p) => p.usuario_id === u.id)
          .reduce((sum, p) => sum + (p.puntos || 0), 0)

        return {
          ...u,
          totalPuntos: total,
        }
      })
      .sort((a, b) => b.totalPuntos - a.totalPuntos)

    const miPosicion =
      ranking.findIndex((u) => u.id === usuarioId) + 1

    const misPronosticos = (todosPronosticos || []).filter(
      (p) => p.usuario_id === usuarioId
    )

    const misPuntos = misPronosticos.reduce(
      (sum, p) => sum + (p.puntos || 0),
      0
    )

    setUsuario(usuarioData)
    setPosicion(miPosicion)
    setPronosticos(misPronosticos.length)
    setPuntos(misPuntos)
    setCargando(false)
  }

  useEffect(() => {
    cargarPerfil()
  }, [])

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Cargando...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-emerald-900 p-4 text-white">
      <div className="max-w-xl mx-auto">

        <div className="bg-white/95 text-black rounded-3xl p-6 shadow-2xl">

          <h1 className="text-3xl font-black text-green-900 mb-6">
            👤 Mi Perfil
          </h1>

          <div className="space-y-4">

            <div>
              <p className="text-gray-500 text-sm">Nombre</p>
              <p className="font-bold text-lg">
                {usuario?.nombre}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Correo</p>
              <p className="font-bold">
                {usuario?.email}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Posición en el Ranking
              </p>
              <p className="font-black text-2xl text-green-700">
                #{posicion}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Puntos acumulados
              </p>
              <p className="font-black text-2xl text-yellow-600">
                {puntos} pts
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Pronósticos guardados
              </p>
              <p className="font-black text-2xl text-blue-700">
                {pronosticos}
              </p>
            </div>

          </div>

          <button
            onClick={() => router.push('/pronosticos')}
            className="w-full mt-8 bg-green-700 text-white py-3 rounded-xl font-bold"
          >
            Volver a Pronósticos
          </button>

        </div>
      </div>
    </main>
  )
}