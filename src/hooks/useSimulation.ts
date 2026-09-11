import { useCallback, useEffect, useRef, useState } from 'react'
import type { Notice, Report } from '../types'

export const STORY = [
  { title: 'AI 自主巡检', subtitle: '机器人正在扫描场馆环境', duration: 6 },
  { title: '感知设备需求', subtitle: '篮球区 3 号设备负载 92%，需要备用器材', duration: 5 },
  { title: 'AGV 智能调度', subtitle: '运输车携带备用篮球架，前往篮球区', duration: 12 },
  { title: 'AI 能源优化', subtitle: '联动照明与空调，按需分配能源', duration: 7 },
  { title: '运营闭环完成', subtitle: '调度与节能结果已同步至运营大屏', duration: 5 },
]
const clock = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

export function useSimulation(ready = true) {
  const [now, setNow] = useState(Date.now())
  const [visitors, setVisitors] = useState(3580)
  const [utilization, setUtilization] = useState(87)
  const [score, setScore] = useState(96)
  const [energySaving, setEnergySaving] = useState(false)
  const [energyValue, setEnergyValue] = useState(486)
  const [dispatchStart, setDispatchStart] = useState<number | null>(null)
  const [dispatchState, setDispatchState] = useState<'idle' | 'moving' | 'completed'>('idle')
  const [inspectionStart, setInspectionStart] = useState<number | null>(null)
  const [reports, setReports] = useState<Report[]>([
    { id: 1, area: '篮球场区域', detail: '地面安全 · 无障碍物', status: 'normal', time: clock() },
    { id: 2, area: '羽毛球区域', detail: '2 台发球设备建议维护', status: 'attention', time: clock() },
  ])
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, kind: 'success', title: '全域感知已连接', text: '128 台智能设备在线，场馆运行平稳。', time: clock() },
  ])
  const [storyStage, setStoryStage] = useState(-1)
  const [storyPlaying, setStoryPlaying] = useState(true)
  const [stageProgress, setStageProgress] = useState(0)
  const [storyCompleted, setStoryCompleted] = useState(false)
  const elapsed = useRef(0)
  const previous = useRef(Date.now())
  const lastStage = useRef(-1)
  const moving = useRef(false)
  const inspecting = useRef(false)
  const initialCountdown = useRef(5)

  const notify = useCallback((kind: Notice['kind'], title: string, text: string) => {
    setNotices(n => [{ id: Date.now() + Math.random(), kind, title, text, time: clock() }, ...n].slice(0, 12))
  }, [])
  const dispatch = useCallback(() => {
    if (moving.current) return
    moving.current = true
    setDispatchStart(Date.now())
    setDispatchState('moving')
    notify('info', '调度任务已下发', 'AGV-002 携带 1 组备用篮球架，从器材仓前往篮球区。')
  }, [notify])
  const inspect = useCallback(() => {
    if (inspecting.current) return
    inspecting.current = true
    setInspectionStart(Date.now())
    notify('info', 'AI 视觉巡检启动', '正在检测地面安全、器材损耗与人流密度。')
  }, [notify])
  const optimize = useCallback((on: boolean) => {
    setEnergySaving(on)
    notify(on ? 'success' : 'info', on ? 'AI 节能模式已启用' : '标准能源模式已恢复', on ? '照明与空调已协同调整，预计综合能耗降低 18%。' : '照明恢复标准亮度，系统持续监测能耗。')
  }, [notify])

  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now()
      const delta = Math.min((time - previous.current) / 1000, 0.5)
      previous.current = time
      setNow(time)
      if (ready && storyPlaying) {
        if (initialCountdown.current > 0) {
          initialCountdown.current = Math.max(0, initialCountdown.current - delta)
        } else {
          elapsed.current += delta
          let total = 0
          let stage = STORY.length
          for (let i = 0; i < STORY.length; i++) {
            if (elapsed.current < total + STORY[i].duration) {
              stage = i
              setStageProgress((elapsed.current - total) / STORY[i].duration)
              break
            }
            total += STORY[i].duration
          }
          if (stage === STORY.length) {
            setStoryPlaying(false)
            setStoryCompleted(true)
            setStageProgress(1)
          } else if (stage !== lastStage.current) {
            lastStage.current = stage
            setStoryStage(stage)
            if (stage === 0) inspect()
            if (stage === 1) notify('warning', '检测到篮球区设备高负载', '3 号智能篮球架使用率达到 92%，建议调度备用设备。')
            if (stage === 2) dispatch()
            if (stage === 3) optimize(true)
            if (stage === 4) {
              setScore(energySaving ? 98 : 96)
              setUtilization(91)
              notify('success', '无人化运营闭环已完成', energySaving ? '器材补给完成，综合能耗下降 18%，AI 运营评分升至 98。' : '器材补给完成；能源按当前手动设置运行，运营数据已同步。')
            }
          }
        }
      }
      setEnergyValue(v => {
        const target = energySaving ? 398.52 : 486
        return Math.abs(target - v) < 0.05 ? target : v + (target - v) * 0.12
      })
    }, 200)
    return () => window.clearInterval(id)
  }, [ready, storyPlaying, energySaving, inspect, dispatch, optimize, notify])

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisitors(v => v + 1 + Math.floor(Math.random() * 4))
      setUtilization(v => Math.max(84, Math.min(94, v + (Math.random() > 0.5 ? 1 : -1))))
    }, 4200)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (dispatchStart && dispatchState === 'moving' && now - dispatchStart >= 11000) {
      moving.current = false
      setDispatchState('completed')
      notify('success', '器材已送达篮球区', 'AGV-002 已卸载备用篮球架，3 号设备负载恢复正常。')
    }
    if (inspectionStart && inspecting.current && now - inspectionStart >= 5500) {
      inspecting.current = false
      setInspectionStart(null)
      setReports(r => [
        { id: now, area: '全馆 AI 视觉检测', detail: '地面安全；人流密度正常；2 台设备需要维护', status: 'attention' as const, time: clock() }, ...r,
      ].slice(0, 8))
      notify('warning', 'AI 巡检报告已生成', '篮球场区域正常，发现 2 个设备需要维护。')
    }
  }, [now, dispatchStart, dispatchState, inspectionStart, notify])

  const toggleStory = () => {
    if (storyCompleted) {
      elapsed.current = 0
      initialCountdown.current = 0
      lastStage.current = -1
      setStoryStage(-1)
      setStoryCompleted(false)
      setStageProgress(0)
      setEnergySaving(false)
      if (!moving.current) { setDispatchState('idle'); setDispatchStart(null) }
      setScore(96)
      setStoryPlaying(true)
    } else setStoryPlaying(p => !p)
  }

  return { now, visitors, utilization, score, energySaving, energyValue,
    saved: energySaving ? 23 : 18, dispatchStart, dispatchState,
    dispatchProgress: dispatchState === 'completed' ? 1 : dispatchStart ? Math.max(0, Math.min((now - dispatchStart) / 11000, 1)) : 0,
    inspectionStart, reports, notices, storyStage, storyPlaying, stageProgress, storyCompleted,
    countdown: Math.ceil(initialCountdown.current), dispatch, inspect, optimize, toggleStory, notify,
  }
}
export type Simulation = ReturnType<typeof useSimulation>
