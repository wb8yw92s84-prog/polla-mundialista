'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  const [partidos, setPartidos] = useState<any[]>([])
  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([])
  const [resultados, setResultados] = useState<any>({})
  const [cargando, setCargando] = useState(true)

  async function verificarSesion() {
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.push('/adminlogin')
      return
    }

    setCargando(false)
    cargarPartidos()
    cargarUsuariosPendientes()
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  async function cargarPartidos() {
    const { data } = await supabase.from('partidos').select('*')
    setPartidos(data || [])
  }

  async function cargarUsuariosPendientes() {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('aprobado', false)

    setUsuariosPendientes(data || [])
  }

  async function aprobarUsuario(usuarioId: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ aprobado: true })
      .eq('id', usuarioId)

    if (error) {
      alert('Error aprobando usuario: ' + error.message)
      return
    }

    alert('Participante aprobado correctamente')
    cargarUsuariosPendientes()
  }

  function calcularPuntos(
    pronLocal: number,
    pronVisitante: number,
    realLocal: number,
    realVisitante: number
  ) {
    if (pronLocal === realLocal && pronVisitante === realVisitante) {
      return 5
    }

    const pronGanador =
      pronLocal > pronVisitante
        ? 'local'
        : pronLocal < pronVisitante
        ? 'visitante'
        : 'empate'

    const realGanador =
      realLocal > realVisitante
        ? 'local'
        : realLocal < realVisitante
        ? 'visitante'
        : 'empate'

    return pronGanador === realGanador ? 3 : 0
  }

  async function guardarResultado(partidoId: string) {
    const golesLocal = resultados[partidoId]?.local ?? 0
    const golesVisitante = resultados[partidoId]?.visitante ?? 0

    const { error } = await supabase.from('resultados_oficiales').upsert(
      {
        partido_id: partidoId,
        goles_local: Number(golesLocal),
        goles_visitante: Number(golesVisitante),
      },
      { onConflict: 'partido_id' }
    )

    if (error) {
      alert('Error guardando resultado: ' + error.message)
      return
    }

    const { data: pronosticosData } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('partido_id', partidoId)

    for (const p of pronosticosData || []) {
      const puntos = calcularPuntos(
        p.pronostico_local,
        p.pronostico_visitante,
        Number(golesLocal),
        Number(golesVisitante)
      )

      await supabase.from('pronosticos').update({ puntos }).eq('id', p.id)
    }

    alert('Resultado guardado y puntos actualizados')
  }

  useEffect(() => {
    verificarSesion()
  }, [])

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Panel Admin
        </h1>

        <button
          onClick={cerrarSesion}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="bg-white text-black max-w-3xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Solicitudes pendientes
        </h2>

        {usuariosPendientes.length === 0 ? (
          <p>No hay participantes pendientes.</p>
        ) : (
          usuariosPendientes.map((usuario) => (
            <div
              key={usuario.id}
              className="flex justify-between items-center border-b py-3"
            >
              <div>
                <p className="font-bold">{usuario.nombre}</p>
                <p className="text-sm text-gray-600">{usuario.email}</p>
              </div>

              <button
                onClick={() => aprobarUsuario(usuario.id)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Aprobar
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white text-black max-w-3xl mx-auto rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Resultados Oficiales
        </h2>

        {partidos.map((partido) => (
          <div key={partido.id} className="border-b py-4">
            <p className="font-bold mb-3">
              {partido.equipo_local} vs {partido.equipo_visitante}
            </p>

            <div className="flex gap-3 items-center">
              <input
                type="number"
                className="border p-2 w-20"
                value={resultados[partido.id]?.local ?? 0}
                onChange={(e) =>
                  setResultados({
                    ...resultados,
                    [partido.id]: {
                      ...resultados[partido.id],
                      local: e.target.value,
                    },
                  })
                }
              />

              <span>-</span>

              <input
                type="number"
                className="border p-2 w-20"
                value={resultados[partido.id]?.visitante ?? 0}
                onChange={(e) =>
                  setResultados({
                    ...resultados,
                    [partido.id]: {
                      ...resultados[partido.id],
                      visitante: e.target.value,
                    },
                  })
                }
              />

              <button
                onClick={() => guardarResultado(partido.id)}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Guardar resultado
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}