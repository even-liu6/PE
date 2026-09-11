import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronRight, CircleHelp, Compass, Expand, Layers3, LocateFixed, MousePointer2, Pause, Play, RotateCcw, ScanLine, Settings2, ShieldCheck, Sparkles, Truck, X, Zap } from 'lucide-react'
import AIAssistant from './components/AIAssistant'
import ControlPanel from './components/ControlPanel'
import { movementKeys } from './hooks/movement'
import { STORY, useSimulation } from './hooks/useSimulation'
import { ZONES } from './types'
import type { CameraView, EquipmentId, Panel, Zone } from './types'
const Scene3D = lazy(() => import('./components/Scene3D'))

function Minimap({ position, view, onZone }: { position: { x: number; z: number }; view: CameraView; onZone: (zone: Zone) => void }) {
  return <div className="minimap"><div className="minimap-heading"><span><LocateFixed size={13} /> 场馆定位</span><span>01 / FLOOR 1</span></div><svg viewBox="0 0 230 116" role="img" aria-label="场馆区域地图"><ellipse cx="115" cy="57" rx="104" ry="48" fill="#0e1b24" stroke="#2b4652" /><ellipse cx="115" cy="57" rx="94" ry="39" fill="none" stroke="#3d3e59" strokeWidth="4" /><ellipse cx="115" cy="57" rx="88" ry="33" fill="none" stroke="#405565" strokeWidth="0.7" /><rect x="78" y="38" width="75" height="39" fill={view.zone === 'basketball' ? '#396f67' : '#1c4041'} stroke="#53968b" /><path d="M115 38v39M78 47h15v21H78M153 47h-15v21h15" stroke="#62a79c" fill="none" strokeWidth="0.7" /><circle cx="115" cy="57" r="9" fill="none" stroke="#62a79c" strokeWidth="0.7" /><rect x="41" y="39" width="27" height="37" fill={view.zone === 'badminton' ? '#397484' : '#203945'} stroke="#406779" /><path d="M54 39v37M41 57h27" stroke="#406779" /><rect x="165" y="41" width="25" height="34" fill={view.zone === 'fitness' ? '#605391' : '#2b3147'} stroke="#5e5481" /><circle cx={115 + Math.max(-56, Math.min(position.x, 56)) * 1.5} cy={57 + Math.max(-28, Math.min(position.z, 28)) * 1.2} r="3.5" fill="#9dffdb" stroke="#133d33" strokeWidth="3" /><path d="M217 16v-8m-3 4 3-4 3 4" stroke="#8398a9" fill="none" /></svg><div className="map-zones"><button onClick={() => onZone('badminton')}>羽毛球</button><button onClick={() => onZone('basketball')}>篮球馆</button><button onClick={() => onZone('fitness')}>健身区</button></div></div>
}

export default function App() {
  const [ready, setReady] = useState(false)
  const sim = useSimulation(ready)
  const [view, setView] = useState<CameraView>({ mode: 'overview', zone: 'overview', revision: 0 })
  const [panel, setPanel] = useState<Panel>(null)
  const [selected, setSelected] = useState<EquipmentId>('hoop')
  const [assistantExpanded, setAssistantExpanded] = useState(false)
  const [quality, setQuality] = useState(() => window.innerWidth > 700)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [position, setPosition] = useState({ x: 0, z: 0 })
  const [fullscreen, setFullscreen] = useState(false)
  const [toast, setToast] = useState('')
  const autoCamera = useRef(true)
  const manual = useCallback(() => { autoCamera.current = false }, [])
  const onPosition = useCallback((x: number, z: number) => setPosition({ x, z }), [])
  const onReady = useCallback(() => setReady(true), [])
  const goZone = useCallback((zone: Zone) => { manual(); setView(v => ({ ...v, zone, revision: v.revision + 1 })); setPanel(null) }, [manual])
  const openPanel = useCallback((next: Panel) => { manual(); movementKeys.clear(); setPanel(next) }, [manual])
  const selectEquipment = useCallback((id: EquipmentId) => { setSelected(id); openPanel('equipment') }, [openPanel])
  const closePanel = useCallback(() => setPanel(null), [])
  useEffect(() => {
    if (!autoCamera.current || sim.storyStage < 0) return
    const zones: Zone[] = ['basketball', 'basketball', 'overview', 'energy', 'overview']
    setView(v => ({ mode: 'overview', zone: zones[sim.storyStage], revision: v.revision + 1 }))
  }, [sim.storyStage])
  useEffect(() => {
    const listener = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', listener)
    return () => document.removeEventListener('fullscreenchange', listener)
  }, [])
  useEffect(() => { if (toast) { const t = window.setTimeout(() => setToast(''), 3500); return () => window.clearTimeout(t) } }, [toast])
  const enter = () => {
    manual(); setPanel(null)
    setView(v => ({ mode: v.mode === 'walk' ? 'overview' : 'walk', zone: 'overview', revision: v.revision + 1 }))
  }
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else setToast('此浏览器暂不支持全屏，请横屏体验。') }
    catch { setToast('全屏暂不可用，可在浏览器菜单中开启全屏。') }
  }
  const stage = sim.storyStage >= 0 ? STORY[sim.storyStage] : null
  return <main className={`arena-app ${view.mode === 'walk' ? 'walking' : ''} ${reducedMotion ? 'reduce-motion' : ''}`}>
    <div className="scene-container"><Suspense fallback={null}><Scene3D sim={sim} view={view} panel={panel} onSelect={selectEquipment} onPanel={openPanel} onZone={goZone} onManual={manual} onPosition={onPosition} onReady={onReady} reducedMotion={reducedMotion} quality={quality} /></Suspense></div>
    <div className="scene-vignette" /><div className="noise-overlay" />
    {!ready && <div className="loading-screen"><div className="loading-mark">A</div><h1>Arena<span>OS</span></h1><p>正在连接未来场馆</p><div className="loading-line" /></div>}
    <header className="topbar">
      <button className="brand" onClick={() => { manual(); setView(v => ({ mode: 'overview', zone: 'overview', revision: v.revision + 1 })) }} aria-label="ArenaOS 返回场馆全景"><span className="brand-mark"><Layers3 size={25} strokeWidth={2} /></span><span>Arena<b>OS</b><small>未来智慧场馆操作系统</small></span></button>
      <nav className="zone-nav" aria-label="场馆区域">{ZONES.map(zone => <button key={zone.id} className={view.zone === zone.id ? 'active' : ''} onClick={() => goZone(zone.id)}>{zone.id === 'overview' && <Layers3 size={14} />}{zone.name}</button>)}</nav>
      <div className="top-status"><span className="online-label"><span className="status-dot" /> ONLINE</span><span className="ai-core"><CpuIcon /> AI 核心运行中</span><div className="topbar-divider" /><button className="icon-button" aria-label={fullscreen ? '退出全屏' : '全屏展示'} title="全屏展示" onClick={toggleFullscreen}><Expand size={18} /></button></div>
    </header>
    <div className="breadcrumb"><span>数字孪生空间</span><ChevronRight size={12} /><span>{ZONES.find(z => z.id === view.zone)?.name || (view.zone === 'energy' ? '能源中心' : '智能器材仓')}</span><span className="breadcrumb-live">LIVE</span></div>
    <nav className="side-rail" aria-label="系统工具"><button className={!panel ? 'active' : ''} onClick={() => { goZone('overview'); setView(v => ({ ...v, mode: 'overview' })) }} aria-label="全馆视图" title="全馆视图"><Layers3 size={20} /></button><button onClick={() => openPanel('inspection')} aria-label="AI 巡检" title="AI 巡检"><ScanLine size={20} /></button><button onClick={() => openPanel('dispatch')} aria-label="器材调度" title="器材调度"><Truck size={20} /></button><button onClick={() => openPanel('energy')} aria-label="能源管理" title="能源管理"><Zap size={20} /></button><span /><button onClick={() => openPanel('help')} aria-label="操作指南与设置" title="操作指南与设置"><Settings2 size={19} /></button></nav>
    <section className="scene-intro"><div className="eyebrow"><span className="short-line" /> ARENA DIGITAL TWIN</div><h1>未来场馆<span>自主运行。</span></h1><p>感知每一处 · 智联每一刻</p><div className="scene-badge"><span className="status-dot" /> 01 号智慧示范场馆 <span>运行中</span></div><div className="intro-divider" /><div className="scene-metric"><div><span>在线智能设备</span><strong>128<small>台</small></strong></div><span className="metric-sparkline"><Activity size={32} strokeWidth={1} /></span></div><div className="scene-metric secondary"><div><span>今日入场人数</span><strong>{sim.visitors.toLocaleString()}<small>人</small></strong></div><span className="metric-change">↗ 12.8%</span></div><div className="ai-score"><ShieldCheck size={15} /><span>AI 运营评分</span><b>{sim.score}</b><small>/ 100</small></div></section>
    <div className="space-coordinates"><span>X {position.x.toFixed(1)}</span><span>Y 0.0</span><span>Z {position.z.toFixed(1)}</span><i /> DIGITAL TWIN · REALTIME</div>
    <AIAssistant sim={sim} onInspect={() => openPanel('inspection')} expanded={assistantExpanded} onToggle={() => setAssistantExpanded(v => !v)} />
    <div className="scene-tools"><button className="icon-button" onClick={() => { manual(); setView(v => ({ mode: 'overview', zone: 'overview', revision: v.revision + 1 })) }} title="重置镜头" aria-label="重置镜头"><LocateFixed size={17} /></button><button className="icon-button" onClick={() => openPanel('help')} title="操作说明" aria-label="操作说明"><CircleHelp size={17} /></button></div>
    <section className="story-panel" aria-label="自动演示进度"><div className="story-heading"><div><span className={`story-dot ${sim.storyPlaying ? 'playing' : ''}`} /><b>{sim.storyCompleted ? '无人化运营闭环已完成' : '自主运营演示'}</b><span className="story-mode">{sim.storyCompleted ? 'COMPLETE' : sim.storyPlaying ? 'LIVE DEMO' : 'PAUSED'}</span></div><button onClick={() => { if (sim.storyCompleted) autoCamera.current = true; sim.toggleStory() }} aria-label={sim.storyCompleted ? '重播演示' : sim.storyPlaying ? '暂停演示' : '继续演示'} title={sim.storyCompleted ? '重播演示' : sim.storyPlaying ? '暂停演示' : '继续演示'}>{sim.storyCompleted ? <RotateCcw size={15} /> : sim.storyPlaying ? <Pause size={15} /> : <Play size={15} />}</button></div><p>{stage ? stage.subtitle : `${sim.countdown} 秒后自动开始 · 随时探索，随时接管`}</p><div className="story-steps">{STORY.map((item, i) => <div key={item.title} className={`${i === sim.storyStage ? 'current' : ''} ${i < sim.storyStage || sim.storyCompleted ? 'done' : ''}`}><div className="story-step-track"><i style={{ width: i < sim.storyStage || sim.storyCompleted ? '100%' : i === sim.storyStage ? `${sim.stageProgress * 100}%` : '0%' }} /></div><span><small>0{i + 1}</small>{item.title}</span></div>)}</div></section>
    <Minimap position={position} view={view} onZone={goZone} />
    {view.mode === 'walk' && <><div className="crosshair"><i /><i /></div><div className="walk-hint"><MousePointer2 size={14} /> 拖动转向 <span>·</span> WASD 移动 <span>·</span> Shift 加速</div><div className="mobile-pad" aria-label="移动控制">{[{ key: 'KeyW', icon: <ArrowUp size={20} />, cls: 'up', label: '向前移动' }, { key: 'KeyA', icon: <ArrowLeft size={20} />, cls: 'left', label: '向左移动' }, { key: 'KeyS', icon: <ArrowDown size={20} />, cls: 'down', label: '向后移动' }, { key: 'KeyD', icon: <ArrowRight size={20} />, cls: 'right', label: '向右移动' }].map(item => <button key={item.key} className={item.cls} aria-label={item.label} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); movementKeys.add(item.key) }} onPointerUp={() => movementKeys.delete(item.key)} onPointerCancel={() => movementKeys.delete(item.key)} onLostPointerCapture={() => movementKeys.delete(item.key)}>{item.icon}</button>)}</div></>}
    <div className="bottom-controls"><button className={`enter-button ${view.mode === 'walk' ? 'entered' : ''}`} onClick={enter}><Compass size={19} /><span>{view.mode === 'walk' ? '返回全景' : '进入场馆'}</span><ArrowUpRightIcon /></button><button className="nav-action" onClick={() => openPanel('dispatch')}><Truck size={18} /><span>智能调度</span></button><button className="nav-action" onClick={() => openPanel('energy')}><Zap size={18} /><span>能源中心</span>{sim.energySaving && <span className="nav-indicator" />}</button></div>
    <footer className="bottom-status"><div><span className="status-dot" /><span>全部系统运行正常</span><i /><span>实时模拟数据</span></div><div className="interaction-tip"><MousePointer2 size={12} /> 拖拽旋转 <span>·</span> 滚轮缩放 <span>·</span> 点击设备探索</div><time>{new Date(sim.now).toLocaleDateString('zh-CN').replaceAll('/', '.')} <span>{new Date(sim.now).toLocaleTimeString('zh-CN', { hour12: false })}</span></time></footer>
    <ControlPanel panel={panel} onClose={closePanel} sim={sim} selected={selected} quality={quality} onQuality={() => setQuality(v => !v)} reducedMotion={reducedMotion} onReducedMotion={() => setReducedMotion(v => !v)} />
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="关闭提示"><X size={14} /></button></div>}
  </main>
}

function CpuIcon() { return <Sparkles size={13} /> }
function ArrowUpRightIcon() { return <ArrowRight size={16} className="enter-arrow" /> }
