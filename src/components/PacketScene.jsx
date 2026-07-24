import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges, OrbitControls, Text } from '@react-three/drei'
// .woff (not .woff2): troika-three-text, which powers drei's <Text>, parses woff/ttf only
import interFont from '@fontsource/inter/files/inter-latin-600-normal.woff?url'
import { BLOCKS, GAP, blockLayout } from '../data/tcp.js'

// How far things travel at full explosion
const ROW_SPREAD = 0.95 // vertical separation between rows
const BIT_SPREAD = 0.55 // horizontal separation within a row
const POP_Z = 0.55 // forward pop for selected / scenario-active blocks

function FieldBlock({ block, explode, selected, activeFlags, onSelect }) {
  const group = useRef()
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)

  const base = useMemo(() => blockLayout(block), [block])
  const isSelected = selected === block.id
  const isActive = activeFlags.includes(block.id)
  const dimmed =
    (selected && !isSelected) || (activeFlags.length > 0 && !isActive && !isSelected)

  const color = useMemo(() => new THREE.Color(block.color), [block.color])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Exploded position: rows spread vertically, blocks spread from center-x,
    // and selected / scenario-active blocks pop toward the camera.
    const tx = base.x * (1 + explode * BIT_SPREAD)
    const ty = base.y * (1 + explode * ROW_SPREAD)
    const tz = (isSelected || isActive ? POP_Z : 0) + (hovered ? 0.12 : 0)
    const k = 8 // damping speed
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, k, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, k, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, k, dt)

    const m = matRef.current
    if (m) {
      const pulse = isActive ? 0.55 + 0.3 * Math.sin(state.clock.elapsedTime * 4) : 0
      const target = isSelected ? 0.75 : hovered ? 0.4 : pulse + 0.08
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, target, k, dt)
      m.opacity = THREE.MathUtils.damp(m.opacity, dimmed ? 0.22 : 1, k, dt)
    }
  })

  const w = Math.max(base.w - GAP, 0.1)
  const h = base.h - GAP
  const d = base.d - GAP
  const labelFits = !block.flag && base.w > 2.2

  return (
    <group ref={group} position={[base.x, base.y, 0]}>
      <mesh
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect(block.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.08}
          metalness={0.15}
          roughness={0.4}
          transparent
        />
        <Edges
          scale={1.001}
          color={isSelected ? '#ffffff' : '#0b0d12'}
          lineWidth={isSelected ? 2 : 1}
        />
      </mesh>

      {/* Label on the front face; flag labels rotate to fit their 1-bit slab */}
      <Text
        font={interFont}
        position={[0, 0, d / 2 + 0.015]}
        rotation={block.flag ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        fontSize={block.flag ? 0.145 : labelFits ? 0.26 : 0.17}
        maxWidth={block.flag ? base.h : w * 0.94}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineWidth={0.008}
        outlineColor="#00000088"
      >
        {block.label}
      </Text>
    </group>
  )
}

export default function PacketScene({
  explode,
  selected,
  activeFlags,
  autoRotate,
  onSelect,
  controlsRef,
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [7, 3.5, 14], fov: 42 }}
      onPointerMissed={() => onSelect(null)}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0b0d12']} />
      <fog attach="fog" args={['#0b0d12', 22, 42]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 8]} intensity={1.4} castShadow />
      <directionalLight position={[-8, -4, -6]} intensity={0.35} color="#7aa2ff" />
      <pointLight position={[0, 0, 9]} intensity={0.5} />

      <group>
        {BLOCKS.map((b) => (
          <FieldBlock
            key={b.id}
            block={b}
            explode={explode}
            selected={selected}
            activeFlags={activeFlags}
            onSelect={onSelect}
          />
        ))}
      </group>

      {/* subtle grid floor for spatial grounding */}
      <gridHelper
        args={[60, 60, '#1d2330', '#141926']}
        position={[0, -6.2, 0]}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        enablePan={false}
        minDistance={6}
        maxDistance={26}
      />
    </Canvas>
  )
}
