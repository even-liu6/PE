import { useEffect, useRef } from 'react'
import { Activity, ArrowRight, BatteryFull, Bot, Box, Check, CheckCircle2, CircleHelp, Cpu, Leaf, PackageCheck, ScanLine, ShieldCheck, Truck, X, Zap } from 'lucide-react'
import { EQUIPMENT } from '../types'
import type { EquipmentId, Panel } from '../types'
import type { Simulation } from '../hooks/useSimulation'
import { movementKeys } from '../hooks/movement'

export default function ControlPanel({ panel, onClose, sim, selected, quality, onQuality, reducedMotion, onReducedMotion }: {
  panel: Panel; onClose: () => void; sim: Simulation; selected: EquipmentId; quality: boolean; onQuality: () => void; reducedMotion: boolean; onReducedMotion: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!panel) return
    movementKeys.clear()
    dialog.current?.showModal()
    return () => dialog.current?.close()
  }, [panel])
  if (!panel) return null
  const headings = {
    dispatch: { icon: <Truck size={22} />, title: '智能器材调度', en: 'AUTONOMOUS DISPATCH' },
    energy: { icon: <Zap size={22} />, title: '数字化能源中心', en: 'INTELLIGENT ENERGY' },
    inspection: { icon: <ScanLine size={22} />, title: '无人化 AI 巡检', en: 'AUTONOMOUS INSPECTION' },
    equipment: { icon: <Cpu size={22} />, title: EQUIPMENT[selected].name, en: EQUIPMENT[selected].code },
    help: { icon: <CircleHelp size={22} />, title: '探索操作指南', en: 'WELCOME TO ARENA OS' },
  }
  const heading = headings[panel]
  const equipment = EQUIPMENT[selected]
  return <dialog ref={dialog} className="control-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }} aria-labelledby="panel-title">
    <div className="panel-inner">
      <header className="panel-header"><div className="panel-icon">{heading.icon}</div><div><span className="eyebrow">{heading.en}</span><h2 id="panel-title">{heading.title}</h2></div><button onClick={onClose} className="icon-button" aria-label="关闭面板"><X size={20} /></button></header>
      <div className="panel-body">
        {panel === 'dispatch' && <>
          <div className="panel-status"><span className="status-dot" /> 器材库在线 <span>库存同步于 {new Date(sim.now).toLocaleTimeString('zh-CN', { hour12: false })}</span></div>
          <section className="inventory"><h3>全馆器材总量 <span>INVENTORY</span></h3><div className="inventory-grid">{[['篮球', '120'], ['足球', '80'], ['羽毛球拍', '200']].map(([label, count]) => <div key={label}><Box size={20} /><strong>{count}<small>件</small></strong><span>{label}</span></div>)}</div></section>
          <div className="equipment-health"><div className="health-donut"><div><strong>95<small>%</small></strong><span>设备健康率</span></div></div><div className="health-legend"><p><i className="mint-bg" />正常设备<strong>95%</strong></p><p><i className="amber-bg" />维修设备<strong>3%</strong></p><p><i className="violet-bg" />调度中<strong>2%</strong></p></div></div>
          <section className="dispatch-task"><div className="section-heading"><h3>当前调度任务</h3><span className={`tag ${sim.dispatchState === 'completed' ? 'mint' : ''}`}>{sim.dispatchState === 'moving' ? '运输中' : sim.dispatchState === 'completed' ? '已完成' : '待调度'}</span></div><div className="route-summary"><div><PackageCheck size={20} /><strong>智能器材仓</strong><span>A-01</span></div><div className="route-link"><span>AGV-002</span><ArrowRight size={24} /></div><div><Activity size={20} /><strong>篮球场区域</strong><span>B-03</span></div></div><p>补给物资：1 组移动智能篮球架</p><div className="progress-track"><div style={{ width: `${sim.dispatchProgress * 100}%` }} /></div><div className="progress-label"><span>{sim.dispatchState === 'moving' ? '自主规划路径 · 正在运输' : sim.dispatchState === 'completed' ? '器材已卸载，调度完成' : '路线已规划，预计 11 秒送达'}</span><b>{Math.round(sim.dispatchProgress * 100)}%</b></div></section>
          <button className="primary-action" disabled={sim.dispatchState === 'moving'} onClick={sim.dispatch}>{sim.dispatchState === 'moving' ? <><span className="button-spinner" />AGV 正在运输</> : <><Truck size={18} />{sim.dispatchState === 'completed' ? '再次自动调度' : '启动自动调度'}<ArrowRight size={18} /></>}</button>
          <p className="panel-footnote">运输动画将在场景中同步呈现，可关闭面板观察。</p>
        </>}
        {panel === 'energy' && <>
          <div className="panel-status"><span className="status-dot" /> 光储网一体化运行中 <Leaf size={15} /></div>
          <div className="energy-total"><span>今日场馆总能耗</span><strong>{sim.energyValue.toFixed(1)}<small>kWh</small></strong><p className={sim.energySaving ? 'text-mint' : ''}>{sim.energySaving ? '↓ 18% AI 优化已生效' : '照明、空调与设备实时协同'}</p></div>
          <div className="energy-chart"><div className="chart-caption"><span>能耗趋势</span><span>今日 06:00 — 22:00</span></div><svg viewBox="0 0 360 100" role="img" aria-label={sim.energySaving ? '节能模式下能耗呈下降趋势' : '标准运行能耗趋势'}><defs><linearGradient id="energy-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6af4c9" stopOpacity="0.28" /><stop offset="100%" stopColor="#6af4c9" stopOpacity="0" /></linearGradient></defs><path d="M0 25H360M0 55H360M0 85H360" stroke="#203038" strokeDasharray="3 5" /><path d={sim.energySaving ? 'M0 72 25 62 50 67 75 40 100 47 125 26 150 34 175 41 200 54 225 58 250 70 275 76 300 78 330 80 360 83V100H0Z' : 'M0 72 25 62 50 67 75 40 100 47 125 26 150 34 175 20 200 27 225 21 250 34 275 22 300 29 330 19 360 23V100H0Z'} fill="url(#energy-fill)" /><polyline points={sim.energySaving ? '0,72 25,62 50,67 75,40 100,47 125,26 150,34 175,41 200,54 225,58 250,70 275,76 300,78 330,80 360,83' : '0,72 25,62 50,67 75,40 100,47 125,26 150,34 175,20 200,27 225,21 250,34 275,22 300,29 330,19 360,23'} fill="none" stroke="#79edcc" strokeWidth="2" /></svg></div>
          <section className="energy-distribution"><h3>能源使用分布</h3>{[{ label: '智慧照明', value: 32, color: '#7bf4d0' }, { label: '空调系统', value: 41, color: '#81a9ee' }, { label: '智能设备', value: 27, color: '#a993ee' }].map(item => <div className="energy-bar" key={item.label}><div><span>{item.label}</span><strong>{item.value}%</strong></div><div className="progress-track"><div style={{ width: `${item.value}%`, background: item.color }} /></div></div>)}</section>
          <button className={`energy-switch ${sim.energySaving ? 'active' : ''}`} role="switch" aria-checked={sim.energySaving} onClick={() => sim.optimize(!sim.energySaving)}><span className="energy-switch-icon"><Leaf size={23} /></span><span><b>AI 智能节能模式</b><small>动态调节照明与空调 · 预计节能 18%</small></span><i className="toggle"><i /></i></button>
          <div className="energy-nodes"><span><CheckCircle2 size={14} /> 太阳能板</span><span><CheckCircle2 size={14} /> 智能电网</span><span><CheckCircle2 size={14} /> 全馆照明</span></div>
        </>}
        {panel === 'inspection' && <>
          <div className="inspection-hero"><div className={`scan-emblem ${sim.inspectionStart ? 'scanning' : ''}`}><Bot size={42} /></div><span className="tag mint">ROBOT AI-001</span><h3>{sim.inspectionStart ? '正在进行 AI 视觉检测' : '让场馆安全，始终在线'}</h3><p>自主巡航 · 实时识别 · 主动预警</p></div>
          <div className="inspection-checks">{[['地面安全检测', '通道畅通，无地面障碍'], ['器材损耗检测', '2 台设备建议维护'], ['人流密度检测', '当前密度 0.32 人 / m²']].map(([title, subtitle], i) => <div key={title}><ShieldCheck size={18} className={i === 1 ? 'text-amber' : 'text-mint'} /><div><b>{title}</b><p>{subtitle}</p></div><span className={`tag ${i === 1 ? 'amber' : 'mint'}`}>{sim.inspectionStart ? '扫描中' : i === 1 ? '待维护' : '正常'}</span></div>)}</div>
          <div className="section-heading"><h3>实时巡检报告</h3><span className="text-muted">{sim.reports.length} 条记录</span></div>
          <div className="reports">{sim.reports.map(report => <article key={report.id}><div><span className={`report-dot ${report.status}`} /><b>{report.area}</b><time>{report.time}</time></div><p>{report.detail}</p></article>)}</div>
          <button className="primary-action" disabled={!!sim.inspectionStart} onClick={sim.inspect}>{sim.inspectionStart ? <><span className="button-spinner" />正在扫描场馆</> : <><ScanLine size={18} />启动全馆巡检<ArrowRight size={18} /></>}</button>
        </>}
        {panel === 'equipment' && <>
          <div className="device-summary"><div className="device-emblem"><Cpu size={48} /></div><span className="tag mint">{selected === 'agv' && sim.dispatchState === 'moving' ? '执行运输任务中' : '设备在线 · 运行正常'}</span><p>{equipment.description}</p></div>
          <div className="device-stats"><div><BatteryFull size={19} /><span>设备电量</span><strong>{equipment.battery}<small>%</small></strong></div><div><Activity size={19} /><span>当前使用率</span><strong>{selected === 'hoop' && sim.dispatchState === 'completed' ? 74 : equipment.usage}<small>%</small></strong></div></div>
          <dl className="device-details"><div><dt>设备编号</dt><dd>{equipment.code}</dd></div><div><dt>通信状态</dt><dd className="text-mint">已连接 · 12 ms</dd></div><div><dt>AI 接管</dt><dd>自主运行中</dd></div><div><dt>上次巡检</dt><dd>{sim.reports[0].time}</dd></div><div><dt>维护周期</dt><dd>每 30 天</dd></div></dl>
          {selected === 'hoop' && sim.dispatchState !== 'completed' && <div className="device-alert">当前负载 92%，建议调度备用篮球架分担训练需求。</div>}
          <button className="primary-action" disabled={selected === 'agv' && sim.dispatchState === 'moving'} onClick={selected === 'agv' || selected === 'hoop' ? sim.dispatch : () => { sim.inspect(); onClose() }}>{selected === 'agv' || selected === 'hoop' ? <><Truck size={18} />{sim.dispatchState === 'moving' ? '调度执行中' : '调度备用器材'}</> : <><ScanLine size={18} />请求 AI 设备巡检</>}</button>
        </>}
        {panel === 'help' && <>
          <p className="help-intro">所有功能都在同一个 3D 空间内。选择底部「进入场馆」，以第一人称走进未来体育馆。</p>
          <div className="key-instructions"><div><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><p>前后左右移动</p></div><div><span><kbd>Shift</kbd></span><p>按住加速移动</p></div><div><span>鼠标拖拽</span><p>旋转观察视角</p></div><div><span>滚轮 / 双指缩放</span><p>全景模式缩放</p></div><div><span>点击设备 / 空间标记</span><p>查看设备与区域</p></div><div><span>手机方向按钮</span><p>移动，拖动场景转向</p></div></div>
          <div className="setting-row"><div><b>高画质渲染</b><p>Bloom 发光、阴影与更多粒子</p></div><button role="switch" aria-label="高画质渲染" aria-checked={quality} className={`toggle ${quality ? 'on' : ''}`} onClick={onQuality}><i /></button></div>
          <div className="setting-row"><div><b>减少动态效果</b><p>关闭环境粒子与镜头过渡</p></div><button role="switch" aria-label="减少动态效果" aria-checked={reducedMotion} className={`toggle ${reducedMotion ? 'on' : ''}`} onClick={onReducedMotion}><i /></button></div>
          <div className="simulation-note"><Check size={17} /><p>这是一个使用模拟数据的数字孪生体验。设备状态与运营数字会实时变化，无需登录。</p></div>
        </>}
      </div>
      <footer className="panel-footer"><span>ArenaOS 空间控制中心</span><span><span className="status-dot" /> 实时同步</span></footer>
    </div>
  </dialog>
}
