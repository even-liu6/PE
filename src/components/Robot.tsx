import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Box, Hoop } from './Primitives'
import type { Simulation } from '../hooks/useSimulation'

export const AGV_ROUTE: [number, number, number][] = [[-31, 0.2, 21], [-20, 0.2, 21], [-11, 0.2, 18], [9, 0.2, 18], [19, 0.2, 13]]
export function agvPosition(progress: number) {
  const p = Math.min(progress, 0.99999) * (AGV_ROUTE.length - 1)
  const index = Math.floor(p)
  const a = new THREE.Vector3(...AGV_ROUTE[index]); const b = new THREE.Vector3(...AGV_ROUTE[index + 1])
  return { position: a.lerp(b, p - index), rotation: Math.atan2(b.x - AGV_ROUTE[index][0], b.z - AGV_ROUTE[index][2]) }
}

export default function Robot({ sim, onInspect, onAGV }: { sim: Simulation; onInspect: () => void; onAGV: () => void }) {
  const patrol = useRef<THREE.Group>(null)
  const agv = useRef<THREE.Group>(null)
  const scan = useRef<THREE.Mesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (patrol.current) {
      const a = t * 0.055 + 0.7
      patrol.current.position.set(Math.cos(a) * 24, 0.15, Math.sin(a) * 14)
      patrol.current.rotation.y = Math.atan2(-Math.sin(a) * 24, Math.cos(a) * 14)
    }
    if (scan.current) scan.current.rotation.z = Math.sin(t) * 0.3
    if (pulse.current) { const s = 1 + (t % 2) * 1.5; pulse.current.scale.set(s, s, s); (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - t % 2 / 2) * 0.45 }
    if (agv.current) {
      const progress = sim.dispatchState === 'completed' ? 1 : sim.dispatchStart ? Math.min((Date.now() - sim.dispatchStart) / 11000, 1) : 0
      const point = agvPosition(progress)
      agv.current.position.copy(point.position); agv.current.rotation.y = point.rotation
    }
  })
  return <group>
    <group ref={patrol} onClick={e => { e.stopPropagation(); onInspect() }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <Box position={[0, 0.4, 0]} size={[1.6, 0.6, 1.8]} color="#a9becb" />
      <Box position={[0, 1.15, 0]} size={[1.15, 1.1, 0.9]} color="#d8e6ed" />
      <Box position={[0, 1.4, 0.5]} size={[0.83, 0.3, 0.1]} color="#132f39" />
      <Box position={[0, 1.4, 0.56]} size={[0.6, 0.1, 0.04]} glow="#6effcf" />
      <mesh position={[0, 1.95, 0]}><sphereGeometry args={[0.22, 12, 12]} /><meshBasicMaterial color="#79ffe4" toneMapped={false} /></mesh>
      {[-0.8, 0.8].map(x => <Box key={x} position={[x, 0.26, 0]} size={[0.3, 0.4, 1.5]} color="#102333" />)}
      <mesh ref={scan} position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[sim.inspectionStart ? 8 : 5, 48, Math.PI * 0.25, Math.PI * 0.5]} /><meshBasicMaterial color="#5affbe" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh ref={pulse} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 0.93, 40]} /><meshBasicMaterial color="#7dffc9" transparent opacity={0.4} depthWrite={false} /></mesh>
    </group>
    {sim.dispatchState !== 'idle' && <Line points={AGV_ROUTE} color="#7ffbca" lineWidth={2} dashed dashSize={0.8} gapSize={0.6} transparent opacity={0.65} />}
    <group ref={agv} onClick={e => { e.stopPropagation(); onAGV() }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <Box position={[0, 0.4, 0]} size={[2.8, 0.65, 3.3]} color="#b4c0cf" />
      <Box position={[0, 0.8, 0]} size={[2.6, 0.13, 3.1]} color="#2b4656" />
      <Box position={[0, 0.35, 1.67]} size={[1.9, 0.08, 0.03]} glow="#83ffcd" />
      {[-1.3, 1.3].map(x => [-0.95, 0.95].map(z => <mesh key={`${x}${z}`} position={[x, 0.15, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.3, 12]} /><meshStandardMaterial color="#0c1722" /></mesh>))}
      {sim.dispatchState !== 'completed' && <Hoop position={[0, 0.9, -0.2]} miniature />}
    </group>
    {sim.dispatchState === 'completed' && <Hoop position={[19, 0, 10]} rotation={-Math.PI / 2} miniature />}
  </group>
}
