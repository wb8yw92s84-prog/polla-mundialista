'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [partidos, setPartidos] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [usuarioId, setUsuarioId] = useState('')
  const [pronosticos, setPronosticos] = useState<any>({})

  async function cargarDatos() {
    const { data: usuariosData } = await supabase.from('usuarios').select('*')
    const { data: partidosData } = await supabase.from('partidos').select('*')

    setUsuarios(usuariosData || [])
    setPartidos(partidosData || [])
    cargarRanking(usuariosData || [])
  }

  async function cargarRanking(listaUsuarios: any[]) {
    const { data: pronosticosData } = await supabase
      .from('pronosticos')
      .select('*')

    const rankingCalculado = listaUsuarios
      .map((usuario) => {
        const totalPuntos = (pronosticosData || [])
          .filter((p) => p.usuario_id === usuario.id)
          .reduce((total, p) => total + (p.puntos || 0), 0)

        return { ...usuario, totalPuntos }
      })
      .sort((a, b) => b.totalPuntos - a.totalPuntos)

    setRanking(rankingCalculado)
  }

  async function cargarPronosticosUsuario(idUsuario: string) {
    setUsuarioId(idUsuario)

    const { data } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('usuario_id', idUsuario)

    const cargados: any = {}

    data?.forEach((p) => {
      cargados[p.partido_id] = {
        local: p.pronostico_local,
        visitante: p.pronostico_visitante,
      }
    })

    setPronosticos(cargados)
  }

  async function guardarPronostico(partidoId: string) {
    if (!usuarioId) {
      alert('Selecciona un participante')
      return
    }

    const predLocal = pronosticos[partidoId]?.local ?? 0
    const predVisitante = pronosticos[partidoId]?.visitante ?? 0

    const { error } = await supabase.from('pronosticos').upsert(
      {
        usuario_id: usuarioId,
        partido_id: partidoId,
        pronostico_local: Number(predLocal),
        pronostico_visitante: Number(predVisitante),
        puntos: 0,
      },
      { onConflict: 'usuario_id,partido_id' }
    )

    if (error) {
      alert('Error guardando pronóstico: ' + error.message)
      return
    }

    alert('Pronóstico guardado correctamente')
    cargarRanking(usuarios)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <main className="min-h-screen bg-green-800 text-white p-10">
      <h1 className="text-5xl font-bold text-center mb-8">
        🏆 Polla Mundialista 2026
      </h1>

      <div className="bg-white text-black max-w-2xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Seleccionar participante</h2>

        <select
          className="border p-3 w-full"
          value={usuarioId}
          onChange={(e) => cargarPronosticosUsuario(e.target.value)}
        >
          <option value="">Selecciona un participante</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white text-black max-w-2xl mx-auto rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Pronósticos</h2>

        {partidos.map((partido) => (
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
        ))}
      </div>

      <div className="bg-white text-black max-w-2xl mx-auto rounded-xl p-6 mt-8">
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