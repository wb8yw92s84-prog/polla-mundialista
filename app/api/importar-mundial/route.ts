import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeejjvilagtjwfbupekx.supabase.co'
const supabaseKey = 'sb_publishable_t0M1b4XZ573_jM3sC7wdYw_qKWlCkaY'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  const token = process.env.SPORTMONKS_API_TOKEN

  if (!token) {
    return NextResponse.json(
      { error: 'No existe SPORTMONKS_API_TOKEN en Vercel' },
      { status: 500 }
    )
  }

  const response = await fetch(
    `https://api.sportmonks.com/v3/football/fixtures?api_token=${token}&include=participants;venue&filters=fixtureSeasons:26618&per_page=50`
  )

  const json = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Error consultando Sportmonks', detalle: json },
      { status: 500 }
    )
  }

  const fixtures = json.data || []

  const partidos = fixtures.map((fixture: any) => {
    const participantes = fixture.participants || []

    const local =
      participantes.find((p: any) => p.meta?.location === 'home')?.name ||
      participantes[0]?.name ||
      'Por definir'

    const visitante =
      participantes.find((p: any) => p.meta?.location === 'away')?.name ||
      participantes[1]?.name ||
      'Por definir'

    return {
      match_id: String(fixture.id),
      equipo_local: local,
      equipo_visitante: visitante,
      fecha: fixture.starting_at || null,
      fase: 'Mundial 2026',
      grupo: null,
      estadio: fixture.venue?.name || null,
      ciudad: fixture.venue?.city_name || null,
    }
  })

  const { error } = await supabase
    .from('partidos')
    .upsert(partidos, { onConflict: 'match_id' })

  if (error) {
    return NextResponse.json(
      { error: 'Error guardando en Supabase', detalle: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    mensaje: 'Partidos importados correctamente',
    total: partidos.length,
  })
}