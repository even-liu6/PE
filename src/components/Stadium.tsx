import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Box, EllipseBand, EllipseLine, Hoop } from './Primitives'
import type { Simulation } from '../hooks/useSimulation'

function courtTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1536; canvas.height = 768
  const c = canvas.getContext('2d')!
  c.fillStyle = '#224b50'; c.fillRect(0, 0, 1536, 768)
  for (let x = 0; x < 1536; x += 18) {
    c.fillStyle = x % 36 === 0 ? '#234d52' : '#21494e'; c.fillRect(x, 0, 17, 768)
    c.strokeStyle = '#2a5559'; c.lineWidth = 1
    for (let y = (x % 5) * 30; y < 768; y += 140) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y); c.stroke() }
  }
  c.fillStyle = '#18333e'; c.fillRect(35, 250, 300, 268); c.fillRect(1201, 250, 300, 268)
  c.strokeStyle = '#a0dcd1'; c.lineWidth = 5; c.strokeRect(35, 35, 1466, 698)
  c.beginPath(); c.moveTo(768, 35); c.lineTo(768, 733); c.stroke()
  c.beginPath(); c.arc(768, 384, 145, 0, Math.PI * 2); c.stroke()
  c.strokeRect(35, 250, 300, 268); c.strokeRect(1201, 250, 300, 268)
  c.beginPath(); c.arc(335, 384, 134, -Math.PI / 2, Math.PI / 2); c.stroke()
  c.beginPath(); c.arc(1201, 384, 134, Math.PI / 2, Math.PI * 1.5); c.stroke()
  c.beginPath(); c.arc(90, 384, 325, -Math.PI / 2, Math.PI / 2); c.stroke()
  c.beginPath(); c.arc(1446, 384, 325, Math.PI / 2, Math.PI * 1.5); c.stroke()
  c.fillStyle = '#a2e8d7'; c.font = '600 60px Arial'; c.textAlign = 'center'; c.fillText('A', 768, 405)
  c.fillStyle = '#81bfb5'; c.font = '500 19px Arial'; c.fillText('ARENA OS', 768, 690)
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}

function Seats() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const count = 8 * 210
  useEffect(() => {
    if (!mesh.current) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    let id = 0
    for (let row = 0; row < 8; row++) {
      for (let i = 0; i < 210; i++) {
        const angle = i / 210 * Math.PI * 2
        const aisle = i % 26 < 2
        dummy.position.set(Math.cos(angle) * (48 + row * 1.3), 1.6 + row * 0.68, Math.sin(angle) * (31 + row * 1.2))
        dummy.rotation.y = -angle + Math.PI / 2
        dummy.scale.set(aisle ? 0 : 0.85, 0.6, 0.8)
        dummy.updateMatrix(); mesh.current.setMatrixAt(id, dummy.matrix)
        color.set(i % 52 < 26 ? '#21566d' : '#182d43')
        if (row % 3 === 0) color.multiplyScalar(1.25)
        mesh.current.setColorAt(id, color); id++
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow><boxGeometry /><meshStandardMaterial roughness={0.6} metalness={0.25} /></instancedMesh>
}

function LiveScreen({ sim }: { sim: Simulation }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1536; c.height = 640
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  }, [])
  useEffect(() => {
    const c = (texture.image as HTMLCanvasElement).getContext('2d')!
    const bg = c.createLinearGradient(0, 0, 1536, 640); bg.addColorStop(0, '#061d29'); bg.addColorStop(1, '#0d152d')
    c.fillStyle = bg; c.fillRect(0, 0, 1536, 640)
    c.fillStyle = '#62f5d2'; c.font = 'bold 40px Arial'; c.fillText('ARENA OS', 76, 90)
    c.fillStyle = '#89a3b7'; c.font = '22px Arial'; c.fillText('LIVE OPERATIONS  /  未来智慧场馆', 76, 133)
    c.fillStyle = '#6febd1'; c.font = '22px Arial'; c.fillText('●  SYSTEM ONLINE', 1190, 90)
    const values = [sim.visitors.toLocaleString(), `${sim.utilization}%`, `${sim.saved}%`, String(sim.score)]
    const labels = ['今日入场人数', '设备利用率', '能源节约', 'AI 运营评分']
    values.forEach((v, i) => {
      const x = 76 + i * 365
      c.fillStyle = i === 2 ? '#72f6d0' : '#d8f1ee'; c.font = 'bold 83px Arial'; c.fillText(v, x, 322)
      c.fillStyle = '#8ab4ba'; c.font = '27px Arial'; c.fillText(labels[i], x, 380)
    })
    c.strokeStyle = '#183d4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(76, 445); c.lineTo(1460, 445); c.stroke()
    c.fillStyle = '#59c6ba'; c.font = '22px Arial'; c.fillText('INTELLIGENT. AUTONOMOUS. CONNECTED.', 76, 540)
    for (let y = 0; y < 640; y += 4) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, y, 1536, 1) }
    texture.needsUpdate = true
  }, [sim.visitors, sim.utilization, sim.saved, sim.score, texture])
  useEffect(() => () => texture.dispose(), [texture])
  return <group position={[0, 12, -27]}>
    <Box position={[0, 0, 0]} size={[26.8, 11.2, 0.75]} color="#0a151e" />
    <mesh position={[0, 0, 0.4]}><planeGeometry args={[26, 10.8]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <Box position={[0, 5.65, 0.4]} size={[26.8, 0.05, 0.06]} glow="#50f3ec" />
    <Box position={[0, -5.65, 0.4]} size={[26.8, 0.05, 0.06]} glow="#50f3ec" />
    {[-11, 11].map(x => <Box key={x} position={[x, 6.6, -0.3]} size={[0.25, 3, 0.25]} color="#35505c" />)}
  </group>
}

function Gym() {
  return <group position={[29, 0, 0]}>
    <Box position={[0, 0.03, 0]} size={[12, 0.12, 19]} color="#1b2737" />
    <Line points={[[-6, 0.15, -9.5], [6, 0.15, -9.5], [6, 0.15, 9.5], [-6, 0.15, 9.5], [-6, 0.15, -9.5]]} color="#7792db" />
    {[-4, 0, 4].map(z => [-2.5, 2.5].map(x => <group key={`${x}${z}`} position={[x, 0, z]}>
      <Box position={[0, 0.25, 0]} size={[1.65, 0.4, 3]} color="#172d38" />
      <Box position={[0, 0.48, 0]} size={[1.25, 0.1, 2.6]} color="#080f18" />
      <Box position={[-0.7, 1.2, -1.1]} size={[0.12, 1.7, 0.12]} color="#6d899d" />
      <Box position={[0.7, 1.2, -1.1]} size={[0.12, 1.7, 0.12]} color="#6d899d" />
      <Box position={[0, 2.05, -1.1]} size={[1.5, 0.65, 0.15]} color="#263b47" />
      <Box position={[0, 2.1, -1]} size={[0.7, 0.4, 0.02]} glow="#68c9ef" />
    </group>))}
  </group>
}

function Badminton() {
  return <group position={[-29, 0, -2]}>
    {[-4.5, 4.5].map((x, i) => <group key={i} position={[x, 0, 0]}>
      <Box position={[0, 0.02, 0]} size={[7.7, 0.08, 17]} color="#254e57" />
      <Line points={[[-3.5, 0.1, -7.8], [3.5, 0.1, -7.8], [3.5, 0.1, 7.8], [-3.5, 0.1, 7.8], [-3.5, 0.1, -7.8]]} color="#9dd8d1" lineWidth={1} />
      {[-5, 0, 5].map(z => <Line key={z} points={[[-3.5, 0.1, z], [3.5, 0.1, z]]} color="#81bfb9" />)}
      <Line points={[[0, 0.1, -7.8], [0, 0.1, 7.8]]} color="#81bfb9" />
      {[-3.8, 3.8].map(p => <Box key={p} position={[p, 1.15, 0]} size={[0.1, 2.3, 0.1]} glow="#c6eeff" />)}
      <mesh position={[0, 1.8, 0]}><planeGeometry args={[7.6, 0.9, 24, 4]} /><meshBasicMaterial color="#8bcedc" wireframe transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
    </group>)}
  </group>
}

export default function Stadium({ sim }: { sim: Simulation }) {
  const court = useMemo(courtTexture, [])
  const light = useRef<THREE.PointLight>(null)
  useFrame((_, dt) => { if (light.current) light.current.intensity = THREE.MathUtils.damp(light.current.intensity, sim.energySaving ? 65 : 110, 1.4, dt) })
  useEffect(() => () => court.dispose(), [court])
  return <group>
    <mesh position={[0, -1.4, 0]} scale={[67, 1, 47]} receiveShadow><cylinderGeometry args={[1, 1.025, 1.7, 128]} /><meshStandardMaterial color="#142532" metalness={0.8} roughness={0.35} /></mesh>
    <EllipseLine rx={68} rz={48} y={-1.4} color="#43617d" />
    <EllipseLine rx={67} rz={47} y={-0.6} color="#45ccc7" width={1.8} />
    <mesh position={[0, -0.36, 0]} scale={[61, 1, 42]} receiveShadow><cylinderGeometry args={[1, 1, 0.5, 128]} /><meshStandardMaterial color="#101d29" metalness={0.65} roughness={0.32} /></mesh>
    <EllipseBand rx={46} rz={29.5} thickness={8} y={0.015} color="#30294d" />
    {[0, 1, 2, 3, 4].map(i => <EllipseLine key={i} rx={39 + i * 1.6} rz={22.5 + i * 1.6} y={0.055} color={i === 4 ? '#867ac0' : '#5e507a'} width={i === 4 ? 1.3 : 0.55} />)}
    <EllipseLine rx={46.5} rz={30} y={0.07} color="#9d76f4" width={1.8} />
    <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[37, 20]} /><meshStandardMaterial map={court} roughness={0.46} metalness={0.3} /></mesh>
    <Hoop position={[-18.5, 0, 0]} rotation={Math.PI / 2} />
    <Hoop position={[18.5, 0, 0]} rotation={-Math.PI / 2} />
    <Badminton /><Gym />
    {Array.from({ length: 9 }, (_, i) => <EllipseBand key={i} rx={48.5 + i * 1.35} rz={31.5 + i * 1.2} thickness={1.7} y={0.8 + i * 0.68} color={i % 2 ? '#263747' : '#213344'} />)}
    <Seats />
    <EllipseBand rx={62} rz={43.2} thickness={2.2} y={7.2} color="#243b4a" />
    <EllipseLine rx={61} rz={42} y={7.35} color="#66d9ed" width={1.8} />
    <EllipseLine rx={61.8} rz={42.8} y={8.4} color="#3b7796" />
    {Array.from({ length: 64 }, (_, i) => {
      const a = i / 64 * Math.PI * 2
      return <group key={i} position={[Math.cos(a) * 61, 3.6, Math.sin(a) * 42]} rotation={[0, -a, 0]}>
        <Box position={[0, 0, 0]} size={[0.22, 7.5, 0.55]} color="#2d4859" />
        {i % 4 === 0 && <Box position={[0.2, 0.1, 0]} size={[0.06, 5.5, 0.13]} glow={i % 8 ? '#4188d4' : '#39c9d3'} />}
      </group>
    })}
    {[-24, 0, 24].map((z, idx) => {
      const span = idx === 1 ? 61 : 51
      const points = Array.from({ length: 65 }, (_, i) => { const a = i / 64 * Math.PI; return [Math.cos(a) * span, 7.5 + Math.sin(a) * (idx === 1 ? 21 : 16), z] as [number, number, number] })
      return <group key={z}>
        <Line points={points} color="#20374a" lineWidth={9} />
        <Line points={points.map(p => [p[0], p[1] - 0.18, p[2] + 0.08] as [number, number, number])} color={idx === 1 ? '#67d6ea' : '#466a9b'} lineWidth={1.4} />
        {[0.2, 0.35, 0.5, 0.65, 0.8].map(a => <Box key={a} position={[Math.cos(a * Math.PI) * span, 6.9 + Math.sin(a * Math.PI) * (idx === 1 ? 21 : 16), z]} size={[2, 0.12, 0.75]} glow={sim.energySaving ? '#659293' : '#c1f4ff'} />)}
      </group>
    })}
    <LiveScreen sim={sim} />
    <pointLight ref={light} position={[0, 20, 0]} color="#b8eaff" intensity={110} distance={85} decay={1.6} />
    <pointLight position={[-30, 9, 5]} color="#42dfea" intensity={70} distance={65} decay={1.8} />
    <pointLight position={[35, 12, -4]} color="#866cf6" intensity={95} distance={65} decay={1.7} />
  </group>
}
