import { BLOCKS, FIELD_INFO } from '../data/tcp.js'

export default function InfoPanel({ selected, scenario }) {
  const block = BLOCKS.find((b) => b.id === selected)
  const info = FIELD_INFO[selected] ?? FIELD_INFO.overview
  const accent = block?.color ?? '#3e63dd'

  return (
    <aside className="panel info-panel">
      {scenario && (
        <div className="scenario-card">
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <div className="scenario-flags">
            {scenario.flags.map((f) => (
              <span
                key={f}
                className="flag-chip"
                style={{ background: BLOCKS.find((b) => b.id === f)?.color }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="info-head" style={{ borderColor: accent }}>
        <h2 style={{ color: accent }}>{info.name}</h2>
        <span className="info-size">{info.size}</span>
      </div>

      <section>
        <h4>Definition</h4>
        <p>{info.definition}</p>
      </section>

      <section>
        <h4>{selected ? 'Details' : 'How to use this page'}</h4>
        <p>{info.details}</p>
      </section>

      {selected === null && (
        <section className="hint">
          <p>
            💡 The header is drawn exactly as in RFC 9293: each row is 32 bits
            wide, read left to right, top to bottom.
          </p>
        </section>
      )}
    </aside>
  )
}
