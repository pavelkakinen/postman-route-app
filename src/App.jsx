import { useState, useCallback } from 'react'
import CsvUpload from './components/CsvUpload'
import Map from './components/Map'
import StepNavigator from './components/StepNavigator'
import { geocodeStops } from './services/geocoder'
import { optimizeStops } from './services/optimizer'
import { fetchRoute } from './services/router'
import './App.css'

function Attribution() {
  return (
    <p className="attribution">
      Geocoding by <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer">Nominatim</a> /&nbsp;
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
    </p>
  )
}

export default function App() {
  // phase: 'idle' | 'loading' | 'ready' | 'navigating' | 'done'
  const [phase, setPhase] = useState('idle')
  const [stops, setStops] = useState(null)
  const [routeLine, setRouteLine] = useState(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [currentStep, setCurrentStep] = useState(0)
  const [optimize, setOptimize] = useState(false)

  const handleStopsLoaded = useCallback(async (rawStops) => {
    setPhase('loading')
    setProgress({ done: 0, total: rawStops.length })

    const geocoded = await geocodeStops(rawStops, (done, total) =>
      setProgress({ done, total })
    )

    const ordered = optimize ? optimizeStops(geocoded) : geocoded
    setStops(ordered)

    try {
      const line = await fetchRoute(ordered)
      setRouteLine(line)
    } catch (e) {
      console.warn('OSRM routing failed, skipping route line:', e)
      setRouteLine(null)
    }

    setPhase('ready')
  }, [])

  const handleReset = () => {
    setStops(null)
    setRouteLine(null)
    setPhase('idle')
    setProgress({ done: 0, total: 0 })
    setCurrentStep(0)
  }

  const handleStartNavigation = () => {
    setCurrentStep(0)
    setPhase('navigating')
  }

  const handleDelivered = () => {
    const validStops = stops.filter(s => !s.error)
    if (currentStep + 1 >= validStops.length) {
      setPhase('done')
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  if (phase === 'idle') {
    return (
      <div className="app-idle">
        <h1>Postman Route</h1>
        <div className="route-option">
          <label>
            <input
              type="radio"
              name="optimize"
              checked={!optimize}
              onChange={() => setOptimize(false)}
            />
            Use CSV order
          </label>
          <label>
            <input
              type="radio"
              name="optimize"
              checked={optimize}
              onChange={() => setOptimize(true)}
            />
            Optimize route automatically
          </label>
        </div>
        <CsvUpload onStopsLoaded={handleStopsLoaded} />
      </div>
    )
  }

  if (phase === 'loading') {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
    return (
      <div className="app-loading">
        <h1>Postman Route</h1>
        <p className="geocoding-status">
          Geocoding {progress.done} / {progress.total} addresses…
        </p>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="geocoding-note">Checking addresses one per second (Nominatim rate limit)</p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="app-done">
        <div className="done-card">
          <div className="done-icon">✓</div>
          <h2>All deliveries complete!</h2>
          <p>{stops.filter(s => !s.error).length} stops delivered</p>
          <button className="start-nav-btn" onClick={handleReset}>Upload new CSV</button>
        </div>
      </div>
    )
  }

  const validStops = stops.filter(s => !s.error)
  const errorCount = stops.length - validStops.length

  if (phase === 'navigating') {
    return (
      <div className="app-ready">
        <aside className="stop-list">
          <StepNavigator
            stop={validStops[currentStep]}
            stepNumber={currentStep + 1}
            totalStops={validStops.length}
            onDelivered={handleDelivered}
          />
          <div className="nav-remaining">
            <h3>Remaining stops</h3>
            <ol start={currentStep + 1}>
              {validStops.slice(currentStep).map((s, i) => (
                <li key={i} className={i === 0 ? 'stop-current' : ''}>
                  <span className="address">{s.address}</span>
                  {s.newspaper && <span className="newspaper">{s.newspaper}</span>}
                </li>
              ))}
            </ol>
          </div>
          <button className="reset-btn" onClick={handleReset}>Abort & reset</button>
          <Attribution />
        </aside>
        <main className="map-area">
          <Map stops={stops} routeLine={routeLine} currentStep={currentStep} />
        </main>
      </div>
    )
  }

  // phase === 'ready'
  return (
    <div className="app-ready">
      <aside className="stop-list">
        <h2>Stops ({stops.length})</h2>
        {errorCount > 0 && (
          <p className="error-notice">{errorCount} address{errorCount > 1 ? 'es' : ''} could not be geocoded</p>
        )}
        {validStops.length > 0 && (
          <button className="start-nav-btn" onClick={handleStartNavigation}>
            Start Delivery
          </button>
        )}
        <ol>
          {stops.map((s, i) => (
            <li key={i} className={s.error ? 'stop-error' : ''}>
              <span className="address">{s.address}</span>
              {s.newspaper && <span className="newspaper">{s.newspaper}</span>}
              {s.error && <span className="error-tag">not found</span>}
            </li>
          ))}
        </ol>
        <button className="reset-btn" onClick={handleReset}>Upload new CSV</button>
        <Attribution />
      </aside>
      <main className="map-area">
        <Map stops={stops} routeLine={routeLine} />
      </main>
    </div>
  )
}
