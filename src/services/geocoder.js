const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Geocode a single address string.
 * Returns { lat, lng } or null if not found.
 */
async function geocodeOne(address) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(address)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'et,en' },
  })
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`)
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

/**
 * Geocode an array of stop objects sequentially (1 req/sec).
 * Calls onProgress(done, total) after each request.
 * Returns a new array where each stop gains { lat, lng } or { error: true }.
 */
export async function geocodeStops(stops, onProgress) {
  const results = []
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    try {
      const coords = await geocodeOne(stop.address)
      if (coords) {
        results.push({ ...stop, ...coords })
      } else {
        results.push({ ...stop, error: true })
      }
    } catch {
      results.push({ ...stop, error: true })
    }
    onProgress(i + 1, stops.length)
    // rate-limit: 1 request per second (skip delay after last one)
    if (i < stops.length - 1) await delay(1000)
  }
  return results
}
