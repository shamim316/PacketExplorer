import { BLOCKS, FLAG_IDS, SCENARIOS } from '../data/tcp.js'

const LIST_FIELDS = BLOCKS.filter((b) => !b.flag)

export default function Sidebar({ selected, onSelect, scenarioId, onScenario }) {
  return (
    <aside className="panel sidebar">
      <section>
        <h4>Segment Fields</h4>
        <ul className="field-list">
          {LIST_FIELDS.map((b) => (
            <li key={b.id}>
              <button
                className={selected === b.id ? 'active' : ''}
                onClick={() => onSelect(selected === b.id ? null : b.id)}
              >
                <span className="swatch" style={{ background: b.color }} />
                {b.label}
                <span className="bits">{b.id === 'options' || b.id === 'payload' ? 'var' : `${b.bits}b`}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Control Flags</h4>
        <div className="flag-grid">
          {FLAG_IDS.map((f) => {
            const b = BLOCKS.find((x) => x.id === f)
            return (
              <button
                key={f}
                className={`flag-btn ${selected === f ? 'active' : ''}`}
                style={{ '--c': b.color }}
                onClick={() => onSelect(selected === f ? null : f)}
              >
                {f}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h4>Scenarios · A Connection’s Life</h4>
        <ul className="scenario-list">
          {SCENARIOS.map((s) => (
            <li key={s.id}>
              <button
                className={scenarioId === s.id ? 'active' : ''}
                onClick={() => onScenario(scenarioId === s.id ? null : s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
