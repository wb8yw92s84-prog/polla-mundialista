'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  const router = useRouter()

  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([])
  const [partidos, setPartidos] = useState<any[]>([])
  const [resultados, setResultados] = useState<any>({})

  const [equipoLocal, setEquipoLocal] = useState('')
  const [equipoVisitante, setEquipoVisitante] = useState('')
  const [fecha, setFecha] = useState('')
  const [fase, setFase] = useState('Fase de grupos')
  const [grupo, setGrupo] = useState('')

  async function cargarDatos() {
    await cargarUsuariosPendientes()
    await cargarPartidos()
  }

  async function cargarUsuariosPendientes() {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('aprobado', false)

    setUsuariosPendientes(data || [])
  }

  async function cargarPartidos() {
    const { data } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: true })

    setPartidos(data || [])
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

    alert('Participante aprobado')
    cargarUsuariosPendientes()
  }

  async function agregarPartido() {
    if (!equipoLocal || !equipoVisitante) {
      alert('Debes ingresar los dos equipos')
      return
    }

    const { error } = await supabase.from('partidos').insert({
      equipo_local: equipoLocal,
      equipo_visitante: equipoVisitante,
      fecha: fecha || null,
      fase,
      grupo,
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Partido agregado')
    setEquipoLocal('')
    setEquipoVisitante('')
    setFecha('')
    setGrupo('')
    setFase('Fase de grupos')
    cargarPartidos()
  }

  async function guardarResultado(partidoId: string) {
    const local = resultados[partidoId]?.local ?? 0
    const visitante = resultados[partidoId]?.visitante ?? 0

    const { error } = await supabase.from('resultados_oficiales').upsert(
      {
        partido_id: partidoId,
        goles_local: Number(local),
        goles_visitante: Number(visitante),
      },
      { onConflict: 'partido_id' }
    )

    if (error) {
      alert(error.message)
      return
    }

    const { data: pronosticos } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('partido_id', partidoId)

    for (const p of pronosticos || []) {
      let puntos = 0

      if (
        p.pronostico_local === Number(local) &&
        p.pronostico_visitante === Number(visitante)
      ) {
        puntos = 5
      } else {
        const ganadorPronostico =
          p.pronostico_local > p.pronostico_visitante
            ? 'local'
            : p.pronostico_local < p.pronostico_visitante
            ? 'visitante'
            : 'empate'

        const ganadorReal =
          Number(local) > Number(visitante)
            ? 'local'
            : Number(local) < Number(visitante)
            ? 'visitante'
            : 'empate'

        if (ganadorPronostico === ganadorReal) puntos = 3
      }

      await supabase
        .from('pronosticos')
        .update({ puntos })
        .eq('id', p.id)
    }

    alert('Resultado guardado y puntos actualizados')
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Panel Admin</h1>

        <button
          onClick={cerrarSesion}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="bg-white text-black max-w-4xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Solicitudes pendientes</h2>

        {usuariosPendientes.length === 0 ? (
          <p>No hay participantes pendientes.</p>
        ) : (
          usuariosPendientes.map((u) => (
            <div key={u.id} className="border-b py-4">
              <p className="font-bold">{u.nombre}</p>
              <p>{u.email}</p>

              <button
                onClick={() => aprobarUsuario(u.id)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg mt-2"
              >
                Aprobar
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white text-black max-w-4xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Agregar partido</h2>

        <input
          className="border p-3 w-full mb-3"
          placeholder="Equipo local"
          value={equipoLocal}
          onChange={(e) => setEquipoLocal(e.target.value)}
        />

        <input
          className="border p-3 w-full mb-3"
          placeholder="Equipo visitante"
          value={equipoVisitante}
          onChange={(e) => setEquipoVisitante(e.target.value)}
        />

        <input
          className="border p-3 w-full mb-3"
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <input
          className="border p-3 w-full mb-3"
          placeholder="Grupo, ejemplo: Grupo A"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
        />

        <input
          className="border p-3 w-full mb-3"
          placeholder="Fase"
          value={fase}
          onChange={(e) => setFase(e.target.value)}
        />

        <button
          onClick={agregarPartido}
          className="bg-blue-700 text-white px-4 py-3 rounded-lg"
        >
          Agregar partido
        </button>
      </div>

      <div className="bg-white text-black max-w-4xl mx-auto rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Partidos y resultados</h2>

        {partidos.length === 0 ? (
          <p>No hay partidos registrados.</p>
        ) : (
          partidos.map((p) => (
            <div key={p.id} className="border-b py-4">
              <p className="font-bold">
                {p.equipo_local} vs {p.equipo_visitante}
              </p>

              <p className="text-sm text-gray-600">
                {p.fase} {p.grupo ? `- ${p.grupo}` : ''}
              </p>

              <div className="flex gap-3 items-center mt-3">
                <input
                  type="number"
                  className="border p-2 w-20"
                  value={resultados[p.id]?.local ?? 0}
                  onChange={(e) =>
                    setResultados({
                      ...resultados,
                      [p.id]: {
                        ...resultados[p.id],
                        local: e.target.value,
                      },
                    })
                  }
                />

                <span>-</span>

                <input
                  type="number"
                  className="border p-2 w-20"
                  value={resultados[p.id]?.visitante ?? 0}
                  onChange={(e) =>
                    setResultados({
                      ...resultados,
                      [p.id]: {
                        ...resultados[p.id],
                        visitante: e.target.value,
                      },
                    })
                  }
                />

                <button
                  onClick={() => guardarResultado(p.id)}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Guardar resultado
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}