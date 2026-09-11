import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Box } from './Primitives'
import { EQUIPMENT } from '../types'
import type { EquipmentId } from '../types'

function Device({ id, position, onSelect, children }: { id: EquipmentId; position: [number, number, number]; onSelect: (id: EquipmentId) => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.3 })
  return <group position={position} onClick={e => { e.stopPropagation(); onSelect(id) }} onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}>
    {children}
    <mesh ref={ring} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.6, 1.66, 40, 1, 0, Math.PI * 1.8]} /><meshBasicMaterial color={hovered ? '#bbffeb' : '#4dc3c1'} transparent opacity={hovered ? 1 : 0.45} /></mesh>
    {hovered && <Html position={[0, 4, 0]} center zIndexRange={[8, 0]}><div className="device-tooltip">{EQUIPMENT[id].name}<span>点击查看设备</span></div></Html>}
  </group>
}

export default function Equipment({ onSelect, onControl }: { onSelect: (id: EquipmentId) => void; onControl: () => void }) {
  return <group>
    <Device id="basketball-bot" position={[-12, 0, 12]} onSelect={onSelect}>
      <mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.9, 1.1, 1, 12]} /><meshStandardMaterial color="#d0e1e6" metalness={0.6} roughness={0.3} /></mesh>
      <Box position={[0, 1.35, 0]} size={[1.1, 0.55, 0.8]} color="#182c37" />
      <Box position={[0, 1.4, 0.42]} size={[0.7, 0.12, 0.04]} glow="#63fbe2" />
      <mesh position={[0, 1.9, 0]}><sphereGeometry args={[0.42, 16, 12]} /><meshStandardMaterial color="#da742d" roughness={0.8} /></mesh>
      {[-0.8, 0.8].map(x => <Box key={x} position={[x, 0.22, 0]} size={[0.32, 0.4, 1.1]} color="#0b1520" />)}
    </Device>
    <group position={[18.5, 1.9, 0]} onClick={e => { e.stopPropagation(); onSelect('hoop') }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <mesh><boxGeometry args={[3.5, 4, 3.5]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    </group>
    <Device id="launcher" position={[-30, 0, 9.5]} onSelect={onSelect}>
      <Box position={[0, 0.55, 0]} size={[1.5, 0.9, 1.35]} color="#aebdcf" />
      <Box position={[0, 1.1, 0]} size={[1.05, 0.25, 0.9]} glow="#78a6ff" />
      <mesh position={[0, 1.65, 0]} rotation={[0.45, 0, 0]}><cylinderGeometry args={[0.45, 0.32, 1.3, 16]} /><meshStandardMaterial color="#dbe7ee" metalness={0.7} roughness={0.3} /></mesh>
    </Device>
    <Device id="locker" position={[-31, 0, 18]} onSelect={onSelect}>
      <Box position={[0, 2, 0]} size={[6, 4, 1.5]} color="#162c3c" />
      {Array.from({ length: 8 }, (_, i) => <group key={i} position={[-2.25 + i % 4 * 1.5, 1.1 + Math.floor(i / 4) * 1.9, 0.8]}>
        <Box position={[0, 0, 0]} size={[1.35, 1.7, 0.1]} color="#314b61" />
        <Box position={[0.42, 0.2, 0.08]} size={[0.08, 0.25, 0.05]} glow="#6cf6d3" />
      </group>)}
    </Device>
    <Device id="cleaner" position={[32, 0, 17]} onSelect={onSelect}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[1.1, 1.3, 0.7, 24]} /><meshStandardMaterial color="#8293a9" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.93, 0]}><cylinderGeometry args={[0.5, 0.55, 0.2, 24]} /><meshStandardMaterial color="#1a3145" /></mesh>
      <mesh position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.15, 0.04, 8, 40]} /><meshBasicMaterial color="#9b8cff" toneMapped={false} /></mesh>
    </Device>
    <group position={[0, 0, 18]} onClick={e => { e.stopPropagation(); onControl() }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[1.1, 1.6, 1, 8]} /><meshStandardMaterial color="#203b47" metalness={0.8} roughness={0.3} /></mesh>
      <Box position={[0, 1.3, 0]} size={[3.1, 0.15, 1.8]} color="#59d9d0" glow="#237c77" rotation={[-0.2, 0, 0]} />
      <mesh position={[0, 2, 0]}><cylinderGeometry args={[1.5, 0.9, 1.5, 32, 1, true]} /><meshBasicMaterial color="#51d9c6" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </group>
  </group>
}
