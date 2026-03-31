function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Nearest-neighbor TSP starting from the first routable stop.
// Returns all stops reordered: routable first (optimized), then errored ones at the end.
export function optimizeStops(stops) {
  const routable = stops.filter(s => s.lat != null && s.lng != null)
  const errors = stops.filter(s => s.lat == null || s.lng == null)

  if (routable.length <= 1) return [...routable, ...errors]

  const unvisited = [...routable]
  const ordered = [unvisited.shift()] // keep first stop as starting point

  while (unvisited.length > 0) {
    const current = ordered[ordered.length - 1]
    let nearestIdx = 0
    let nearestDist = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const d = haversine(current, unvisited[i])
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    }

    ordered.push(unvisited.splice(nearestIdx, 1)[0])
  }

  return [...ordered, ...errors]
}
