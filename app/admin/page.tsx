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
    try {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setCargando(false)
        router.push('/adminlogin')
        return
      }

      const emailAdmin = data.session.user.email?.toLowerCase()

      if (emailAdmin !== 'jxav_91@hotmail.com') {
        await supabase.auth.signOut()
        setCargando(false)
        alert('No tienes permisos para acceder al panel administrativo.')
        router.push('/adminlogin')
        return
      }

      await cargarPartidos()
      await cargarUsuariosPendientes()
      setCargando(false)
    } catch (error) {
      console.error(error)
      setCargando(false)
      alert('Error cargando el panel administrativo.')
      router.push('/adminlogin')
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/adminlogin')
  }

  async function cargarPartidos() {
    const { data } = await supabase
      .from('partidos')
      .select('*')
      .order('numero_partido', { ascending: true })

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
    predLocal: number,
    predVisitante: number,
    realLocal: number,
    realVisitante: number
  ) {
    if (predLocal === realLocal && predVisitante === realVisitante) {
      return 5
    }

    const predGanador =
      predLocal > predVisitante
        ? 'local'
        : predLocal < predVisitante
        ? 'visitante'
        : 'empate'

    const realGanador =
      realLocal > realVisitante
        ? 'local'
        : realLocal < realVisitante
        ? 'visitante'
        : 'empate'

    return predGanador === realGanador ? 3 : 0
  }

  async function guardarResultado(partidoId: string) {
    const golesLocal = resultados[partidoId]?.local ?? 0
    const golesVisitante = resultados[partidoId]?.visitante ?? 0

    const { error: errorResultado } = await supabase
      .from('resultados_oficiales')
      .upsert(
        {
          partido_id: partidoId,
          goles_local: Number(golesLocal),
          goles_visitante: Number(golesVisitante),
        },
        { onConflict: 'partido_id' }
      )

    if (errorResultado) {
      alert('Error guardando resultado: ' + errorResultado.message)
      return
    }

    const { error: errorPartido } = await supabase
      .from('partidos')
      .update({
        goles_local: Number(golesLocal),
        goles_visitante: Number(golesVisitante),
      })
      .eq('id', partidoId)

    if (errorPartido) {
      alert('Resultado guardado, pero no se actualizó la tabla partidos.')
    }

    const { data: pronosticosData, error: errorPronosticos } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('partido_id', partidoId)

    if (errorPronosticos) {
      alert('Error buscando pronósticos: ' + errorPronosticos.message)
      return
    }

    for (const p of pronosticosData || []) {
      const puntos = calcularPuntos(
        Number(p.pred_local),
        Number(p.pred_visitante),
        Number(golesLocal),
        Number(golesVisitante)
      )

      await supabase
        .from('pronosticos')
        .update({ puntos })
        .eq('id', p.id)
    }

    alert('Resultado guardado y puntos actualizados')
    await cargarPartidos()
  }

  useEffect(() => {
    verificarSesion()

    const timeout = setTimeout(async () => {
      await supabase.auth.signOut()
      alert('Tu sesión administrativa ha expirado.')
      router.push('/adminlogin')
    }, 15 * 60 * 1000)

    return () => clearTimeout(timeout)
  }, [])

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Panel Admin</h1>

        <button
          onClick={cerrarSesion}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="bg-white text-black max-w-4xl mx-auto rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Solicitudes pendientes</h2>

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

      <div className="bg-white text-black max-w-4xl mx-auto rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Resultados Oficiales</h2>

        {partidos.map((partido) => (
          <div key={partido.id} className="border-b py-4">
            <p className="font-bold mb-1">
              {partido.equipo_local} vs {partido.equipo_visitante}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              {partido.grupo || partido.fase || ''}
            </p>

            <div className="flex gap-3 items-center">
              <input
                type="number"
                className="border p-2 w-20"
                value={resultados[partido.id]?.local ?? partido.goles_local ?? 0}
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
                value={
                  resultados[partido.id]?.visitante ??
                  partido.goles_visitante ??
                  0
                }
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