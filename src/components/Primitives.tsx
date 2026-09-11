import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export function EllipseLine({ rx, rz, y = 0, color = '#5fe9e8', width = 1, start = 0, end = Math.PI * 2 }: { rx: number; rz: number; y?: number; color?: string; width?: number; start?: number; end?: number }) {
  const points = useMemo(() => Array.from({ length: 129 }, (_, i) => {
    const a = start + (end - start) * i / 128
    return [Math.cos(a) * rx, y, Math.sin(a) * rz] as [number, number, number]
  }), [rx, rz, y, start, end])
  return <Line points={points} color={color} lineWidth={width} transparent opacity={0.8} />
}

export function EllipseBand({ rx, rz, thickness, y, color, emissive = '#000000' }: { rx: number; rz: number; thickness: number; y: number; color: string; emissive?: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0)
    const hole = new THREE.Path()
    hole.absellipse(0, 0, rx - thickness, rz - thickness, 0, Math.PI * 2, true, 0)
    s.holes.push(hole)
    return s
  }, [rx, rz, thickness])
  return <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <shapeGeometry args={[shape, 128]} /><meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} metalness={0.5} roughness={0.6} side={THREE.DoubleSide} />
  </mesh>
}

export function Box({ position, size, color = '#182934', glow, ...props }: { position: [number, number, number]; size: [number, number, number]; color?: string; glow?: string; rotation?: [number, number, number] }) {
  return <mesh position={position} {...props} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} emissive={glow || '#000000'} emissiveIntensity={glow ? 1.8 : 0} />
  </mesh>
}

export function Hoop({ position = [0, 0, 0], rotation = 0, miniature = false }: { position?: [number, number, number]; rotation?: number; miniature?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]} scale={miniature ? 0.65 : 1}>
    <Box position={[0, 0.2, 0]} size={[1.7, 0.4, 2]} color="#263c49" />
    <Box position={[0, 2, -0.5]} size={[0.3, 3.8, 0.35]} color="#e0f0f5" />
    <Box position={[0, 3.8, 0.4]} size={[0.25, 0.25, 2]} color="#c3e2e6" />
    <Box position={[0, 4.1, 1.4]} size={[2.5, 1.5, 0.12]} color="#7799ac" />
    <Line points={[[-1.25, 3.35, 1.48], [-1.25, 4.85, 1.48], [1.25, 4.85, 1.48], [1.25, 3.35, 1.48], [-1.25, 3.35, 1.48]]} color="#89f9ff" lineWidth={1.5} />
    <Line points={[[-0.45, 3.7, 1.5], [-0.45, 4.25, 1.5], [0.45, 4.25, 1.5], [0.45, 3.7, 1.5]]} color="#ffffff" lineWidth={1.2} />
    <mesh position={[0, 3.65, 1.95]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.46, 0.05, 8, 32]} /><meshStandardMaterial color="#ff9051" emissive="#ff712b" emissiveIntensity={1} /></mesh>
    <mesh position={[0, 3.35, 1.95]}><cylinderGeometry args={[0.46, 0.3, 0.6, 12, 3, true]} /><meshBasicMaterial color="#d9eeee" wireframe transparent opacity={0.6} /></mesh>
  </group>
}
