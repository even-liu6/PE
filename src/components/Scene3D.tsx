import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import Stadium from './Stadium'
import Equipment from './Equipment'
import Robot from './Robot'
import EnergySystem from './EnergySystem'
import type { Simulation } from '../hooks/useSimulation'
import type { CameraView, EquipmentId, Panel, Zone } from '../types'
import { movementKeys } from '../hooks/movement'

const PRESETS: Record<Zone, { eye: [number, number, number]; target: [number, number, number]; walk: [number, number, number] }> = {
  overview: { eye: [95, 79, 110], target: [0, 1, 0], walk: [5, 2.2, 25] },
  basketball: { eye: [30, 24, 39], target: [0, 1, 0], walk: [8, 2.2, 14] },
  badminton: { eye: [-52, 22, 24], target: [-29, 1, -2], walk: [-23, 2.2, 11] },
  fitness: { eye: [51, 22, 27], target: [29, 1, 0], walk: [23, 2.2, 13] },
  energy: { eye: [-60, 33, -9], target: [-30, 9, -30], walk: [-25, 2.2, -17] },
  warehouse: { eye: [-49, 23, 44], target: [-25, 1, 18], walk: [-21, 2.2, 21] },
}

function CameraRig({ view, blocked, onManual, onPosition, reducedMotion }: { view: CameraView; blocked: boolean; onManual: () => void; onPosition: (x: number, z: number) => void; reducedMotion: boolean }) {
  const { camera, gl } = useThree()
  const orbit = useRef<OrbitControlsImpl>(null)
  const moving = useRef(true)
  const destination = useRef(new THREE.Vector3(...PRESETS.overview.eye))
  const target = useRef(new THREE.Vector3())
  const looking = useRef(new THREE.Vector3())
  const yaw = useRef(0), pitch = useRef(0), dragging = useRef(false)
  const lookPointer = useRef<number | null>(null)
  const lastPointer = useRef({ x: 0, y: 0 }), lastReport = useRef(0)
  const blockedRef = useRef(blocked)
  useEffect(() => { blockedRef.current = blocked; if (blocked) { movementKeys.clear(); dragging.current = false } }, [blocked])
  useEffect(() => {
    const preset = PRESETS[view.zone]
    destination.current.set(...(view.mode === 'walk' ? preset.walk : preset.eye))
    target.current.set(...preset.target)
    if (view.mode === 'walk') target.current.y = 2.4
    camera.getWorldDirection(looking.current).multiplyScalar(30).add(camera.position)
    moving.current = true
    movementKeys.clear()
    if (orbit.current) orbit.current.enabled = false
  }, [view, camera])
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (view.mode !== 'walk' || blockedRef.current || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft'].includes(e.code)) { e.preventDefault(); movementKeys.add(e.code); onManual() }
    }
    const keyup = (e: KeyboardEvent) => movementKeys.delete(e.code)
    const clear = () => { movementKeys.clear(); dragging.current = false; lookPointer.current = null }
    const down = (e: PointerEvent) => {
      if (blockedRef.current) return
      onManual()
      if (view.mode !== 'walk') return
      if (lookPointer.current !== null) return
      lookPointer.current = e.pointerId
      dragging.current = true; lastPointer.current = { x: e.clientX, y: e.clientY }
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== lookPointer.current || !dragging.current || moving.current || blockedRef.current || view.mode !== 'walk') return
      const dx = e.clientX - lastPointer.current.x, dy = e.clientY - lastPointer.current.y
      yaw.current -= dx * 0.0035
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0035, -1.1, 1.1)
      lastPointer.current = { x: e.clientX, y: e.clientY }
    }
    const up = (e: PointerEvent) => { if (e.pointerId === lookPointer.current) { dragging.current = false; lookPointer.current = null } }
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', clear)
    gl.domElement.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', clear)
      gl.domElement.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); clear()
    }
  }, [gl, view.mode, onManual])
  useFrame(({ clock }, dt) => {
    dt = Math.min(dt, 0.05)
    if (moving.current) {
      const alpha = reducedMotion ? 1 : 1 - Math.exp(-dt * 2.7)
      camera.position.lerp(destination.current, alpha); looking.current.lerp(target.current, alpha)
      camera.lookAt(looking.current)
      if (orbit.current) { orbit.current.target.copy(looking.current); orbit.current.enabled = false }
      if (camera.position.distanceTo(destination.current) < 0.08 && looking.current.distanceTo(target.current) < 0.08) {
        moving.current = false
        const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ'); yaw.current = e.y; pitch.current = e.x
      }
    } else if (view.mode === 'walk') {
      if (orbit.current) orbit.current.enabled = false
      camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'))
      if (!blocked) {
        const forward = Number(movementKeys.has('KeyW') || movementKeys.has('ArrowUp')) - Number(movementKeys.has('KeyS') || movementKeys.has('ArrowDown'))
        const right = Number(movementKeys.has('KeyD') || movementKeys.has('ArrowRight')) - Number(movementKeys.has('KeyA') || movementKeys.has('ArrowLeft'))
        const speed = (movementKeys.has('ShiftLeft') ? 13 : 7) * dt / Math.max(1, Math.hypot(forward, right))
        const nx = camera.position.x + (-Math.sin(yaw.current) * forward + Math.cos(yaw.current) * right) * speed
        const nz = camera.position.z + (-Math.cos(yaw.current) * forward - Math.sin(yaw.current) * right) * speed
        // Keep the visitor on the flat concourse, inside the seating bowl.
        if ((nx / 45) ** 2 + (nz / 29) ** 2 < 1) { camera.position.x = nx; camera.position.z = nz }
        camera.position.y = 2.2
      }
    } else if (orbit.current) orbit.current.enabled = !blocked
    if (clock.elapsedTime - lastReport.current > 0.3) { lastReport.current = clock.elapsedTime; onPosition(camera.position.x, camera.position.z) }
  })
  return <OrbitControls ref={orbit} makeDefault enabled={false} enablePan={false} minDistance={12} maxDistance={190} maxPolarAngle={Math.PI / 2.04} minPolarAngle={0.15} enableDamping dampingFactor={0.06} rotateSpeed={0.45} onStart={onManual} />
}

function WorldContext() {
  const buildings = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const a = i * 2.39996, r = 125 + (i % 4) * 14
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, height: 5 + (i * 7 % 19), width: 5 + i % 5 }
  }), [])
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.35, 0]} receiveShadow><planeGeometry args={[1200, 1200]} /><meshStandardMaterial color="#090f1b" metalness={0.65} roughness={0.65} /></mesh>
    <gridHelper args={[600, 100, '#1b3041', '#142130']} position={[0, -2.3, 0]} />
    {buildings.map((b, i) => <group key={i} position={[b.x, b.height / 2 - 2.4, b.z]}>
      <mesh><boxGeometry args={[b.width, b.height, b.width * 1.2]} /><meshStandardMaterial color="#0b1421" transparent opacity={0.7} /></mesh>
      <mesh><boxGeometry args={[b.width + 0.05, b.height + 0.05, b.width * 1.2 + 0.05]} /><meshBasicMaterial color="#1c344c" wireframe transparent opacity={0.3} /></mesh>
    </group>)}
  </group>
}

function Hotspot({ position, label, sub, color = 'mint', onClick }: { position: [number, number, number]; label: string; sub: string; color?: string; onClick: () => void }) {
  return <Html position={position} center zIndexRange={[15, 0]}>
    <button className={`hotspot ${color}`} onClick={e => { e.stopPropagation(); onClick() }} aria-label={label}><span className="hotspot-symbol">{color === 'violet' ? '⌁' : '◇'}</span><span>{label}<small>{sub}</small></span><span className="hotspot-dot" /></button>
    <div className={`hotspot-stem ${color}`} />
  </Html>
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  componentDidCatch() { this.props.onError() }
  render() {
    return this.state.error ? <div className="scene-error"><b>3D 场景暂时无法加载</b><p>请使用支持 WebGL 2 的浏览器，并开启硬件加速。</p><button onClick={() => window.location.reload()}>重新加载场景</button></div> : this.props.children
  }
}

export default function Scene3D({ sim, view, panel, onSelect, onPanel, onZone, onManual, onPosition, onReady, reducedMotion, quality }: {
  sim: Simulation; view: CameraView; panel: Panel; onSelect: (id: EquipmentId) => void; onPanel: (panel: Panel) => void;
  onZone: (zone: Zone) => void; onManual: () => void; onPosition: (x: number, z: number) => void; onReady: () => void; reducedMotion: boolean; quality: boolean;
}) {
  return <SceneErrorBoundary onError={onReady}><Canvas shadows={quality} dpr={quality ? [1, 1.6] : [1, 1]} camera={{ position: PRESETS.overview.eye, fov: 44, near: 0.1, far: 500 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.setClearColor('#080e19'); onReady() }} fallback={<div className="scene-error">交互式三维场馆，需要支持 WebGL 2 的浏览器。</div>}>
    <fog attach="fog" args={['#080e19', 125, 330]} />
    <ambientLight intensity={0.8} color="#8496b9" />
    <hemisphereLight args={['#8fc8df', '#162038', 1.6]} />
    <directionalLight position={[30, 70, 25]} intensity={2.2} color="#b0dbe5" castShadow={quality} shadow-mapSize={[2048, 2048]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={150} shadow-bias={-0.0008} />
    <directionalLight position={[-40, 30, -30]} intensity={1.8} color="#7493dc" />
    <Suspense fallback={null}>
      <WorldContext />
      <Stadium sim={sim} />
      <Equipment onSelect={onSelect} onControl={() => onPanel('dispatch')} />
      <Robot sim={sim} onInspect={() => onPanel('inspection')} onAGV={() => onSelect('agv')} />
      <EnergySystem saving={sim.energySaving} onSelect={() => onPanel('energy')} />
      {!reducedMotion && <Sparkles count={quality ? 95 : 28} scale={[135, 45, 95]} position={[0, 20, 0]} size={1.6} speed={0.18} opacity={0.45} color="#9cdfe2" />}
      {view.mode === 'overview' && !panel && <group>
        <Hotspot position={[14, 6, 3]} label="智能篮球馆" sub={sim.dispatchState === 'completed' ? '补给完成 · 运行正常' : '12 台设备在线'} onClick={() => onZone('basketball')} />
        <Hotspot position={[-32, 12, -31]} label="能源中心" sub={sim.energySaving ? 'AI 节能模式 · −18%' : '光储一体 · 清洁能源'} color="violet" onClick={() => onPanel('energy')} />
        <Hotspot position={[-26, 4.8, 16]} label="智能调度" sub={sim.dispatchState === 'moving' ? 'AGV-002 运输中' : '器材仓 · 随时待命'} onClick={() => onPanel('dispatch')} />
      </group>}
    </Suspense>
    <CameraRig view={view} blocked={!!panel} onManual={onManual} onPosition={onPosition} reducedMotion={reducedMotion} />
    {quality && <EffectComposer multisampling={0} frameBufferType={THREE.UnsignedByteType}><Bloom intensity={0.65} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur /><Vignette eskil={false} offset={0.18} darkness={0.5} /></EffectComposer>}
  </Canvas></SceneErrorBoundary>
}
