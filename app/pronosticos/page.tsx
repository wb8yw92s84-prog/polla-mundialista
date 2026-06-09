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
      .order('numero_partido', { ascending: true })

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

        return { ...usuario, totalPuntos }
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
      { onConflict: 'usuario_id,partido_id' }
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

  function obtenerSecciones() {
    const orden = [
      'Grupo A',
      'Grupo B',
      'Grupo C',
      'Grupo D',
      'Grupo E',
      'Grupo F',
      'Grupo G',
      'Grupo H',
      'Grupo I',
      'Grupo J',
      'Grupo K',
      'Grupo L',
      'Grupo M',
      'Grupo N',
      'Grupo O',
      'Grupo P',
      'Dieciseisavos de final',
      'Octavos de final',
      'Cuartos de final',
      'Semi-finals',
      'Semifinales',
      'Tercer puesto',
      'Final',
    ]

    const grupos: any = {}

    partidos.forEach((partido) => {
      const nombreSeccion =
        partido.grupo ||
        partido.fase ||
        'Otros partidos'

      if (!grupos[nombreSeccion]) grupos[nombreSeccion] = []
      grupos[nombreSeccion].push(partido)
    })

    return Object.keys(grupos)
      .sort((a, b) => {
        const ia = orden.indexOf(a)
        const ib = orden.indexOf(b)

        if (ia === -1 && ib === -1) return a.localeCompare(b)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
      .map((nombre) => ({
        nombre,
        partidos: grupos[nombre].sort(
          (a: any, b: any) => (a.numero_partido || 0) - (b.numero_partido || 0)
        ),
      }))
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
    <main className="min-h-screen bg-green-900 text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">🏆 Polla Mundialista 2026</h1>
          <p className="text-green-100 mt-2">Pronósticos por grupos y fases</p>
        </div>

        <button
          onClick={cerrarSesion}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Salir
        </button>
      </div>

      <div className="bg-white text-black max-w-5xl mx-auto rounded-xl p-6 mb-8 shadow">
        <h2 className="text-2xl font-bold">Bienvenido, {usuarioNombre}</h2>
        <p className="text-gray-700">Ingresa tus marcadores para cada partido y guarda tus pronósticos.</p>
      </div>

      <div className="max-w-5xl mx-auto mb-8">
        {partidos.length === 0 ? (
          <div className="bg-white text-black rounded-xl p-6">
            <p>No hay partidos registrados.</p>
          </div>
        ) : (
          obtenerSecciones().map((seccion) => (
            <div key={seccion.nombre} className="bg-white text-black rounded-xl p-6 mb-8 shadow">
              <h2 className="text-2xl font-bold mb-4 text-green-800">
                {seccion.nombre}
              </h2>

              {seccion.partidos.map((partido: any) => (
                <div key={partido.id} className="border-b py-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                    <div>
                      <p className="font-bold text-xl">
  {partido.equipo_local} vs {partido.equipo_visitante}
</p>

                      <p className="text-sm text-gray-600">
                        {partido.estadio ? partido.estadio : ''}
                        {partido.ciudad ? ` - ${partido.ciudad}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <input
                      type="number"
                      min="0"
                      className="border p-2 w-20 rounded"
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

                    <span className="font-bold">-</span>

                    <input
                      type="number"
                      min="0"
                      className="border p-2 w-20 rounded"
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
          ))
        )}
      </div>

      <div className="bg-white text-black max-w-5xl mx-auto rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">🏆 Ranking</h2>

        {ranking.map((usuario, index) => (
          <div key={usuario.id} className="flex justify-between border-b py-2">
            <span>{index + 1}. {usuario.nombre}</span>
            <span>{usuario.totalPuntos} puntos</span>
          </div>
        ))}
      </div>
    </main>
  )
}