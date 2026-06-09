export function calcularTablasPorGrupo(partidos: any[], pronosticos: any) {
  const tablas: any = {}

  const partidosGrupo = partidos.filter((partido) => {
    const numero = Number(partido.numero_partido)
    return numero >= 1 && numero <= 72 && partido.grupo
  })

  partidosGrupo.forEach((partido) => {
    const grupo = partido.grupo
    const local = partido.equipo_local
    const visitante = partido.equipo_visitante

    if (!tablas[grupo]) tablas[grupo] = {}

    if (!tablas[grupo][local]) {
      tablas[grupo][local] = crearEquipo(local)
    }

    if (!tablas[grupo][visitante]) {
      tablas[grupo][visitante] = crearEquipo(visitante)
    }

    const pronostico = pronosticos[partido.id]

    if (!pronostico) return

    const golesLocal = Number(pronostico.local)
    const golesVisitante = Number(pronostico.visitante)

    if (Number.isNaN(golesLocal) || Number.isNaN(golesVisitante)) return

    tablas[grupo][local].pj += 1
    tablas[grupo][visitante].pj += 1

    tablas[grupo][local].gf += golesLocal
    tablas[grupo][local].gc += golesVisitante

    tablas[grupo][visitante].gf += golesVisitante
    tablas[grupo][visitante].gc += golesLocal

    tablas[grupo][local].dg =
      tablas[grupo][local].gf - tablas[grupo][local].gc

    tablas[grupo][visitante].dg =
      tablas[grupo][visitante].gf - tablas[grupo][visitante].gc

    if (golesLocal > golesVisitante) {
      tablas[grupo][local].pts += 3
      tablas[grupo][local].pg += 1
      tablas[grupo][visitante].pp += 1
    } else if (golesLocal < golesVisitante) {
      tablas[grupo][visitante].pts += 3
      tablas[grupo][visitante].pg += 1
      tablas[grupo][local].pp += 1
    } else {
      tablas[grupo][local].pts += 1
      tablas[grupo][visitante].pts += 1
      tablas[grupo][local].pe += 1
      tablas[grupo][visitante].pe += 1
    }
  })

  const tablasOrdenadas: any = {}

  Object.keys(tablas).forEach((grupo) => {
    tablasOrdenadas[grupo] = Object.values(tablas[grupo]).sort((a: any, b: any) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.dg !== a.dg) return b.dg - a.dg
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.nombre.localeCompare(b.nombre)
    })
  })

  return tablasOrdenadas
}

function crearEquipo(nombre: string) {
  return {
    nombre,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    pts: 0,
  }
}
export function resolverNombreEquipo(nombre: string, tablasPorGrupo: any) {
  if (!nombre) return nombre

  const texto = nombre.trim()

  if (texto.startsWith('Ganador Grupo ')) {
    const letra = texto.replace('Ganador Grupo ', '')
    const grupo = `Grupo ${letra}`
    return tablasPorGrupo[grupo]?.[0]?.nombre || texto
  }

  if (texto.startsWith('Segundo Grupo ')) {
    const letra = texto.replace('Segundo Grupo ', '')
    const grupo = `Grupo ${letra}`
    return tablasPorGrupo[grupo]?.[1]?.nombre || texto
  }

  if (texto === 'Mejor tercero') {
    return 'Mejor tercero'
  }

  return texto
}