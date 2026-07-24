import { useMemo, useRef, useState } from 'react'
import PacketScene from './components/PacketScene.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import Sidebar from './components/Sidebar.jsx'
import { SCENARIOS } from './data/tcp.js'

export default function App() {
  const [explode, setExplode] = useState(0)
  const [selected, setSelected] = useState(null)
  const [scenarioId, setScenarioId] = useState(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const controlsRef = useRef()

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? null,
    [scenarioId]
  )
  const activeFlags = scenario?.flags ?? []

  const select = (id) => {
    setSelected(id)
    if (id) setScenarioId(null)
  }
  const runScenario = (id) => {
    setScenarioId(id)
    if (id) setSelected(null)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>
            TCP Packet Explorer <span className="badge">3D</span>
          </h1>
          <p>An interactive exploded view of the Transmission Control Protocol segment</p>
        </div>

        <div className="controls">
          <label className="slider">
            Explode
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explode}
              onChange={(e) => setExplode(parseFloat(e.target.value))}
            />
          </label>
          <button
            className="btn"
            onClick={() => setExplode((v) => (v > 0.5 ? 0 : 1))}
          >
            {explode > 0.5 ? 'Assemble' : 'Explode'}
          </button>
          <button
            className={`btn ${autoRotate ? 'toggled' : ''}`}
            onClick={() => setAutoRotate((v) => !v)}
          >
            Auto-rotate
          </button>
          <button className="btn" onClick={() => controlsRef.current?.reset()}>
            Reset view
          </button>
        </div>
      </header>

      <main className="layout">
        <Sidebar
          selected={selected}
          onSelect={select}
          scenarioId={scenarioId}
          onScenario={runScenario}
        />

        <div className="viewport">
          <PacketScene
            explode={explode}
            selected={selected}
            activeFlags={activeFlags}
            autoRotate={autoRotate}
            onSelect={select}
            controlsRef={controlsRef}
          />
          <div className="viewport-hint">
            drag to orbit · scroll to zoom · click a block to inspect
          </div>
        </div>

        <InfoPanel selected={selected} scenario={scenario} />
      </main>

      <footer className="footer">
        Built for teaching network engineering fundamentals · Header layout per
        RFC 9293 (originally RFC 793)
      </footer>
    </div>
  )
}
