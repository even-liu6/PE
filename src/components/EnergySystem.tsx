import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Box } from './Primitives'

export default function EnergySystem({ saving, onSelect }: { saving: boolean; onSelect: () => void }) {
  const particles = useRef<THREE.InstancedMesh>(null)
  const paths = useMemo(() => [
    new THREE.CatmullRomCurve3([new THREE.Vector3(-32, 9, -32), new THREE.Vector3(-22, 22, -18), new THREE.Vector3(0, 27, 0), new THREE.Vector3(28, 17, 9)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(-32, 9, -32), new THREE.Vector3(-20, 18, -9), new THREE.Vector3(0, 22, 10), new THREE.Vector3(30, 4, 22)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(-32, 9, -32), new THREE.Vector3(-15, 15, -28), new THREE.Vector3(14, 17, -22), new THREE.Vector3(26, 9, -30)]),
  ], [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!particles.current) return
    for (let i = 0; i < 24; i++) {
      const pos = paths[i % 3].getPoint((clock.elapsedTime * (saving ? 0.11 : 0.075) + i / 8) % 1)
      dummy.position.copy(pos); dummy.scale.setScalar(i % 3 === 0 ? 0.16 : 0.09); dummy.updateMatrix(); particles.current.setMatrixAt(i, dummy.matrix)
    }
    particles.current.instanceMatrix.needsUpdate = true
  })
  return <group>
    <group position={[-33, 8.5, -31]} rotation={[0, 0.25, 0]} onClick={e => { e.stopPropagation(); onSelect() }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <Box position={[0, -0.8, 0]} size={[12, 0.5, 7]} color="#273d50" />
      {Array.from({ length: 10 }, (_, i) => <group key={i} position={[(i % 5 - 2) * 2.2, 0, Math.floor(i / 5) * 3 - 1.5]} rotation={[-0.2, 0, 0]}>
        <Box position={[0, 0, 0]} size={[2.02, 0.15, 2.6]} color="#244e7b" />
        {[-0.6, 0, 0.6].map(x => <Box key={x} position={[x, 0.085, 0]} size={[0.015, 0.012, 2.55]} color="#69a6cb" />)}
        {[-0.85, 0, 0.85].map(z => <Box key={z} position={[0, 0.085, z]} size={[2, 0.012, 0.015]} color="#69a6cb" />)}
      </group>)}
      <Box position={[-7, 0.5, 0]} size={[2, 3.5, 2.8]} color="#324c5b" />
      <Box position={[-7, 0.6, 1.42]} size={[1.2, 1.7, 0.03]} glow={saving ? '#63fcbf' : '#538ee8'} />
    </group>
    {paths.map((path, i) => <Line key={i} points={path.getPoints(70)} color={saving ? '#79f8c7' : '#528cbb'} lineWidth={0.6} transparent opacity={saving ? 0.24 : 0.1} />)}
    <instancedMesh ref={particles} args={[undefined, undefined, 24]}><sphereGeometry args={[1, 6, 6]} /><meshBasicMaterial color={saving ? '#83ffd0' : '#58b8e7'} toneMapped={false} /></instancedMesh>
    <group position={[27, 8, -30]}>
      {[0, 4].map(x => <group key={x} position={[x, 0, 0]}>
        <Box position={[0, 0.5, 0]} size={[3.4, 2.6, 4]} color="#3c5163" />
        <mesh position={[0, 1.84, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.2, 20]} /><meshStandardMaterial color="#0b1d29" /></mesh>
        <Box position={[0, 0.5, 2.02]} size={[2.8, 0.06, 0.03]} glow={saving ? '#67d9a9' : '#6399e2'} />
      </group>)}
    </group>
  </group>
}
