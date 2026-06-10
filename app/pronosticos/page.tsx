'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { calcularTablasPorGrupo, resolverNombreEquipo } from '../lib/simulador'

export default function PronosticosPage() {
  const router = useRouter()

  const [usuarioId, setUsuarioId] = useState('')
  const [usuarioNombre, setUsuarioNombre] = useState('')
  const [partidos, setPartidos] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [pronosticos, setPronosticos] = useState<any>({})
  const [vistaActiva, setVistaActiva] = useState('Grupos')
  const [grupoAbierto, setGrupoAbierto] = useState('Grupo A')

  const tablasPorGrupo = calcularTablasPorGrupo(partidos, pronosticos)

  const banderas: any = {
    Ecuador: '🇪🇨',
    Argentina: '🇦🇷',
    Brasil: '🇧🇷',
    Uruguay: '🇺🇾',
    Paraguay: '🇵🇾',
    Colombia: '🇨🇴',
    México: '🇲🇽',
    Canadá: '🇨🇦',
    'Estados Unidos': '🇺🇸',
    Panamá: '🇵🇦',
    España: '🇪🇸',
    Francia: '🇫🇷',
    Alemania: '🇩🇪',
    Inglaterra: '🏴',
    Escocia: '🏴',
    Portugal: '🇵🇹',
    Italia: '🇮🇹',
    Bélgica: '🇧🇪',
    'Países Bajos': '🇳🇱',
    Suiza: '🇨🇭',
    Croacia: '🇭🇷',
    Suecia: '🇸🇪',
    Dinamarca: '🇩🇰',
    Turquía: '🇹🇷',
    'República Checa': '🇨🇿',
    Polonia: '🇵🇱',
    Marruecos: '🇲🇦',
    Egipto: '🇪🇬',
    Túnez: '🇹🇳',
    'Costa de Marfil': '🇨🇮',
    Sudáfrica: '🇿🇦',
    Nigeria: '🇳🇬',
    Camerún: '🇨🇲',
    Senegal: '🇸🇳',
    Ghana: '🇬🇭',
    Japón: '🇯🇵',
    'Corea del Sur': '🇰🇷',
    Australia: '🇦🇺',
    'Nueva Zelanda': '🇳🇿',
    'Arabia Saudita': '🇸🇦',
    Irán: '🇮🇷',
    Catar: '🇶🇦',
    'Por definir': '🏳️',
  }

  function bandera(nombre: string) {
    return banderas[nombre] || '🏳️'
  }

  function partidoBloqueado(fechaPartido: string | null) {
    if (!fechaPartido) return false

    const fechaTexto = fechaPartido.replace(' ', 'T')
    const fechaEcuador = new Date(`${fechaTexto}-05:00`)
    const cierre = new Date(fechaEcuador.getTime() - 60 * 60 * 1000)

    return new Date() >= cierre
  }

  function normalizarFase(partido: any) {
    const numero = Number(partido.numero_partido)

    if (numero >= 1 && numero <= 72) return 'Grupos'
    if (numero >= 73 && numero <= 88) return '16avos'
    if (numero >= 89 && numero <= 96) return '8vos'
    if (numero >= 97 && numero <= 100) return 'Cuartos'
    if (numero >= 101 && numero <= 102) return 'Semifinales'
    if (numero >= 103 && numero <= 104) return 'Final'

    return 'Grupos'
  }

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

    const { data: partidoActual, error: errorPartido } = await supabase
      .from('partidos')
      .select('fecha')
      .eq('id', partidoId)
      .single()

    if (errorPartido) {
      alert('No se pudo verificar si el partido está cerrado.')
      return
    }

    if (partidoActual?.fecha && partidoBloqueado(partidoActual.fecha)) {
      alert('Este partido ya está cerrado para pronósticos.')
      cargarDatos(usuarioId)
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

  function medalla(index: number) {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}.`
  }

  function obtenerGrupos() {
    const grupos: any = {}

    partidos
      .filter((p) => normalizarFase(p) === 'Grupos')
      .forEach((partido) => {
        const nombre = partido.grupo || 'Otros'
        if (!grupos[nombre]) grupos[nombre] = []
        grupos[nombre].push(partido)
      })

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
    ]

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

  function obtenerPartidosPorVista() {
    return partidos
      .filter((p) => normalizarFase(p) === vistaActiva)
      .sort((a, b) => (a.numero_partido || 0) - (b.numero_partido || 0))
  }

  function TablaGrupo({ grupo }: { grupo: string }) {
    const tabla = tablasPorGrupo[grupo]

    if (!tabla) return null

    return (
      <div className="mt-5 bg-green-950 text-white rounded-2xl p-4 overflow-hidden">
        <h3 className="text-lg md:text-xl font-black mb-3">
          Tabla proyectada - {grupo}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs md:text-sm">
            <thead>
              <tr className="text-yellow-300 border-b border-green-700">
                <th className="text-left py-2">Equipo</th>
                <th>PJ</th>
                <th>PG</th>
                <th>PE</th>
                <th>PP</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>PTS</th>
              </tr>
            </thead>

            <tbody>
              {tabla.map((equipo: any, index: number) => (
                <tr key={equipo.nombre} className="border-b border-green-800">
                  <td className="py-2 font-bold">
                    {index + 1}. {bandera(equipo.nombre)} {equipo.nombre}
                  </td>
                  <td className="text-center">{equipo.pj}</td>
                  <td className="text-center">{equipo.pg}</td>
                  <td className="text-center">{equipo.pe}</td>
                  <td className="text-center">{equipo.pp}</td>
                  <td className="text-center">{equipo.gf}</td>
                  <td className="text-center">{equipo.gc}</td>
                  <td className="text-center">{equipo.dg}</td>
                  <td className="text-center font-black text-yellow-300">
                    {equipo.pts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function TarjetaPartido({ partido }: { partido: any }) {
    const cerrado = partidoBloqueado(partido.fecha)

    const equipoLocal = resolverNombreEquipo(
      partido.equipo_local,
      tablasPorGrupo
    )

    const equipoVisitante = resolverNombreEquipo(
      partido.equipo_visitante,
      tablasPorGrupo
    )

    return (
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl">{bandera(equipoLocal)}</span>
            <span className="text-lg md:text-xl font-black text-gray-900">
              {equipoLocal}
            </span>
          </div>

          <div className="flex justify-center items-center gap-3 bg-green-50 rounded-2xl p-3 md:bg-transparent md:p-0">
            <input
              type="number"
              min="0"
              disabled={cerrado}
              className={`border-2 p-2 w-20 md:w-16 rounded-xl text-center text-xl font-bold ${
                cerrado
                  ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-green-700 bg-white text-black'
              }`}
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

            <span className="font-black text-2xl text-green-900">-</span>

            <input
              type="number"
              min="0"
              disabled={cerrado}
              className={`border-2 p-2 w-20 md:w-16 rounded-xl text-center text-xl font-bold ${
                cerrado
                  ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-green-700 bg-white text-black'
              }`}
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
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            <span className="text-lg md:text-xl font-black text-gray-900">
              {equipoVisitante}
            </span>
            <span className="text-3xl md:text-4xl">
              {bandera(equipoVisitante)}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 border-t pt-3">
          <p className="text-xs md:text-sm text-gray-600">
            {partido.estadio ? partido.estadio : ''}
            {partido.ciudad ? ` · ${partido.ciudad}` : ''}
          </p>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {cerrado && (
              <span className="text-red-600 font-bold text-sm">
                🔒 Pronóstico cerrado
              </span>
            )}

            <button
              onClick={() => guardarPronostico(partido.id)}
              disabled={cerrado}
              className={`w-full md:w-auto px-5 py-3 md:py-2 rounded-full font-bold shadow text-white ${
                cerrado
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Guardar pronóstico
            </button>
          </div>
        </div>
      </div>
    )
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

  const vistas = ['Grupos', '16avos', '8vos', 'Cuartos', 'Semifinales', 'Final']

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-emerald-900 text-white px-3 py-5 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto mb-5 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="uppercase tracking-[0.25em] text-yellow-400 text-xs md:text-sm font-bold">
              Mundial 2026
            </p>
            <h1 className="text-3xl md:text-6xl font-black mt-2 leading-tight">
              🏆 Polla Mundialista
            </h1>
            <p className="text-green-100 mt-2 md:mt-3 text-sm md:text-lg">
              Pronósticos por grupos, fases y ranking en vivo.
            </p>
          </div>

          <button
            onClick={cerrarSesion}
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 md:py-2 rounded-full font-bold shadow"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="bg-white/95 text-black max-w-6xl mx-auto rounded-3xl p-5 md:p-6 mb-5 md:mb-8 shadow-2xl border border-yellow-300">
        <h2 className="text-xl md:text-2xl font-black">
          Bienvenido, {usuarioNombre}
        </h2>
        <p className="text-gray-700 mt-1 text-sm md:text-base">
          Ingresa tus marcadores y guarda tus pronósticos antes de cada partido.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mb-5 md:mb-8 overflow-x-auto">
        <div className="flex gap-2 md:gap-3 min-w-max pb-2">
          {vistas.map((vista) => (
            <button
              key={vista}
              onClick={() => setVistaActiva(vista)}
              className={`px-4 md:px-5 py-2 rounded-full font-bold shadow text-sm md:text-base ${
                vistaActiva === vista
                  ? 'bg-yellow-400 text-green-950'
                  : 'bg-white/90 text-green-900 hover:bg-yellow-100'
              }`}
            >
              {vista}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        {partidos.length === 0 ? (
          <div className="bg-white text-black rounded-3xl p-6">
            <p>No hay partidos registrados.</p>
          </div>
        ) : vistaActiva === 'Grupos' ? (
          obtenerGrupos().map((grupo) => (
            <div
              key={grupo.nombre}
              className="bg-white/95 text-black rounded-3xl mb-4 md:mb-5 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setGrupoAbierto(
                    grupoAbierto === grupo.nombre ? '' : grupo.nombre
                  )
                }
                className="w-full flex justify-between items-center gap-3 p-4 md:p-5 text-left"
              >
                <span className="text-2xl md:text-3xl font-black text-green-900">
                  {grupo.nombre}
                </span>

                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
                  {grupoAbierto === grupo.nombre ? 'Cerrar' : 'Abrir'} ·{' '}
                  {grupo.partidos.length}
                </span>
              </button>

              {grupoAbierto === grupo.nombre && (
                <div className="p-4 md:p-5 border-t grid grid-cols-1 gap-4">
                  {grupo.partidos.map((partido: any) => (
                    <TarjetaPartido key={partido.id} partido={partido} />
                  ))}

                  <TablaGrupo grupo={grupo.nombre} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white/95 text-black rounded-3xl p-4 md:p-7 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b pb-4 mb-5">
              <h2 className="text-2xl md:text-3xl font-black text-green-900">
                {vistaActiva}
              </h2>

              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap">
                {obtenerPartidosPorVista().length} partidos
              </span>
            </div>

            {obtenerPartidosPorVista().length === 0 ? (
              <p className="text-gray-600">
                No hay partidos registrados en esta fase.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {obtenerPartidosPorVista().map((partido: any) => (
                  <TarjetaPartido key={partido.id} partido={partido} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white/95 text-black max-w-6xl mx-auto rounded-3xl p-5 md:p-6 shadow-2xl border border-yellow-300">
        <h2 className="text-2xl md:text-3xl font-black mb-5 text-green-900">
          🏆 Ranking
        </h2>

        {ranking.length === 0 ? (
          <p>No hay participantes aprobados todavía.</p>
        ) : (
          ranking.map((usuario, index) => (
            <div
              key={usuario.id}
              className="flex justify-between items-center gap-3 border-b py-3"
            >
              <span className="font-bold text-sm md:text-lg">
                {medalla(index)} {usuario.nombre}
              </span>
              <span className="font-black text-green-800 text-sm md:text-base whitespace-nowrap">
                {usuario.totalPuntos} pts
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  )
}