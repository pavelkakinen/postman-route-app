const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

/**
 * Given an ordered array of geocoded stops, returns a flat array of
 * [lat, lng] pairs representing the road path (for Leaflet Polyline).
 * Returns null if fewer than 2 geocoded stops.
 */
export async function fetchRoute(stops) {
  const geocoded = stops.filter(s => s.lat != null && s.lng != null)
  if (geocoded.length < 2) return null

  const coords = geocoded.map(s => `${s.lng},${s.lat}`).join(';')
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`)

  const data = await res.json()
  if (!data.routes || data.routes.length === 0) return null

  // GeoJSON coords are [lng, lat]; Leaflet wants [lat, lng]
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
}
