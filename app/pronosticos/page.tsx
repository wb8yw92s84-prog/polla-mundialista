'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function PronosticosPage() {
  const router = useRouter()

  const [usuarioId, setUsuarioId] = useState('')
  const [usuarioNombre, setUsuarioNombre] = useState('')
  const [partidos, setPartidos] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [pronosticos, setPronosticos] = useState<any>({})

  async function cargarDatos(idUsuario: string) {
    const { data: partidosData } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: true })

    const { data: misPronosticos } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('usuario_id', idUsuario)

    const cargados: any = {}

    misPronosticos?.forEach((p) => {
      cargados[p.partido_id] = {
        local: p.pred_local,
        visitante: p.pred_visitante,
      }
    })

    setPartidos(partidosData || [])
    setPronosticos(cargados)

    cargarRanking()
  }

  async function cargarRanking() {
    const { data: usuariosData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('aprobado', true)

    const { data: pronosticosData } = await supabase
      .from('pronosticos')
      .select('*')

    const rankingCalculado = (usuariosData || [])
      .map((usuario) => {
        const totalPuntos = (pronosticosData || [])
          .filter((p) => p.usuario_id === usuario.id)
          .reduce((total, p) => total + (p.puntos || 0), 0)

        return {
          ...usuario,
          totalPuntos,
        }
      })
      .sort((a, b) => b.totalPuntos - a.totalPuntos)

    setRanking(rankingCalculado)
  }

  async function guardarPronostico(partidoId: string) {
    if (!usuarioId) {
      alert('Debes iniciar sesión')
      router.push('/login')
      return
    }

    const local = pronosticos[partidoId]?.local ?? 0
    const visitante = pronosticos[partidoId]?.visitante ?? 0

    const { error } = await supabase.from('pronosticos').upsert(
      {
        usuario_id: usuarioId,
        partido_id: partidoId,
        pred_local: Number(local),
        pred_visitante: Number(visitante),
        puntos: 0,
      },
      {
        onConflict: 'usuario_id,partido_id',
      }
    )

    if (error) {
      alert('Error guardando pronóstico: ' + error.message)
      return
    }

    alert('Pronóstico guardado')
    cargarDatos(usuarioId)
  }

  function cerrarSesion() {
    localStorage.removeItem('usuario_id')
    localStorage.removeItem('usuario_nombre')
    router.push('/login')
  }

  useEffect(() => {
    const id = localStorage.getItem('usuario_id')
    const nombre = localStorage.getItem('usuario_nombre')

    if (!id) {
      router.push('/login')
      return
    }

    setUsuarioId(id)
    setUsuarioNombre(nombre || '')
    cargarDatos(id)
  }, [])

  return (
    <main className="min-h-screen bg-green-800 text-white p-10">
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">🏆 Polla Mundialista 2026</h1>

        <button
          onClick={cerrarSesion}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Salir
        </button>
      </div>

      <div className="bg-white text-black max-w-3xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold">Bienvenido, {usuarioNombre}</h2>
        <p>Ingresa tus pronósticos para cada partido.</p>
      </div>

      <div className="bg-white text-black max-w-3xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Pronósticos</h2>

        {partidos.length === 0 ? (
          <p>No hay partidos registrados.</p>
        ) : (
          partidos.map((partido) => (
            <div key={partido.id} className="border-b py-4">
              <p className="font-bold mb-3">
                {partido.equipo_local} vs {partido.equipo_visitante}
              </p>

              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  className="border p-2 w-20"
                  value={pronosticos[partido.id]?.local ?? 0}
                  onChange={(e) =>
                    setPronosticos({
                      ...pronosticos,
                      [partido.id]: {
                        ...pronosticos[partido.id],
                        local: e.target.value,
                      },
                    })
                  }
                />

                <span>-</span>

                <input
                  type="number"
                  className="border p-2 w-20"
                  value={pronosticos[partido.id]?.visitante ?? 0}
                  onChange={(e) =>
                    setPronosticos({
                      ...pronosticos,
                      [partido.id]: {
                        ...pronosticos[partido.id],
                        visitante: e.target.value,
                      },
                    })
                  }
                />

                <button
                  onClick={() => guardarPronostico(partido.id)}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white text-black max-w-3xl mx-auto rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">🏆 Ranking</h2>

        {ranking.map((usuario, index) => (
          <div key={usuario.id} className="flex justify-between border-b py-2">
            <span>
              {index + 1}. {usuario.nombre}
            </span>
            <span>{usuario.totalPuntos} puntos</span>
          </div>
        ))}
      </div>
    </main>
  )
}