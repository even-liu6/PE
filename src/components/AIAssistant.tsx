import { ArrowUpRight, AudioLines, Bot, CheckCheck, ChevronDown, Sparkles, X } from 'lucide-react'
import type { Simulation } from '../hooks/useSimulation'

export default function AIAssistant({ sim, onInspect, expanded, onToggle }: { sim: Simulation; onInspect: () => void; expanded: boolean; onToggle: () => void }) {
  return <aside className={`ai-assistant glass ${expanded ? 'expanded' : ''}`} aria-label="AI 智慧运营助手">
    <button className="ai-mobile-toggle" onClick={onToggle} aria-label={expanded ? '收起 AI 助手' : '展开 AI 助手'}><Bot size={20} /> AI 助手 {expanded ? <X size={16} /> : <ChevronDown size={16} />}</button>
    <div className="assistant-content">
      <div className="assistant-header"><div className="ai-avatar"><Sparkles size={20} /></div><div><h2>AI 智慧运营助手</h2><p>AURA <span>·</span> 实时感知，主动决策</p></div><AudioLines size={20} className="wave-icon" /></div>
      <div className="assistant-online"><span className="status-dot" /> 正在守护场馆的每一刻 <span className="tiny-bars"><i /><i /><i /><i /></span></div>
      <div className="assistant-messages" aria-live="polite" aria-relevant="additions">
        {sim.notices.slice(0, 2).map((n, i) => <article className={`ai-message ${n.kind} ${i === 0 ? 'latest' : ''}`} key={n.id}>
          <div className="message-meta"><span>{n.kind === 'warning' ? '智能建议' : n.kind === 'success' ? '运行简报' : '正在执行'}</span><time>{n.time}</time></div>
          <h3>{n.title}</h3><p>{n.text}</p>
          {n.kind === 'success' && i === 0 && <span className="message-confirm"><CheckCheck size={13} /> 已同步至数字孪生</span>}
        </article>)}
      </div>
      <button className="assistant-action" onClick={onInspect}><span>查看 AI 巡检报告</span><ArrowUpRight size={16} /></button>
    </div>
  </aside>
}
