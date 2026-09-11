export type Zone = 'overview' | 'basketball' | 'badminton' | 'fitness' | 'energy' | 'warehouse'
export type Panel = 'dispatch' | 'energy' | 'inspection' | 'equipment' | 'help' | null
export type CameraView = { mode: 'overview' | 'walk'; zone: Zone; revision: number }
export type EquipmentId = 'basketball-bot' | 'hoop' | 'launcher' | 'locker' | 'cleaner' | 'agv'
export type Notice = { id: number; kind: 'info' | 'warning' | 'success'; title: string; text: string; time: string }
export type Report = { id: number; area: string; detail: string; status: 'normal' | 'attention'; time: string }
export const ZONES: { id: Zone; name: string; en: string }[] = [
  { id: 'overview', name: '场馆全景', en: 'OVERVIEW' },
  { id: 'basketball', name: '篮球馆', en: 'BASKETBALL' },
  { id: 'badminton', name: '羽毛球区', en: 'BADMINTON' },
  { id: 'fitness', name: '健身空间', en: 'FITNESS' },
]
export const EQUIPMENT: Record<EquipmentId, { name: string; code: string; description: string; battery: number; usage: number; zone: Zone }> = {
  'basketball-bot': { name: '篮球训练机器人', code: 'BOT-BK-007', description: '自主拾球、精准回传，为训练提供全天候支持。', battery: 86, usage: 78, zone: 'basketball' },
  hoop: { name: '3 号智能篮球架', code: 'HOOP-BK-003', description: '视觉识别进球，自动调整高度，实时同步训练数据。', battery: 100, usage: 92, zone: 'basketball' },
  launcher: { name: '智能自动发球机', code: 'SERVE-BD-012', description: '多角度自动发球，支持自适应速度与训练强度。', battery: 94, usage: 72, zone: 'badminton' },
  locker: { name: '智能储物柜', code: 'LOCKER-A-024', description: '无接触存取，实时感知柜内器材，自动记录出入库。', battery: 100, usage: 64, zone: 'warehouse' },
  cleaner: { name: '无人清洁机器人', code: 'CLEAN-008', description: '动态避障与自主清洁，覆盖场馆地面和公共区域。', battery: 76, usage: 83, zone: 'fitness' },
  agv: { name: 'AGV 自动运输车', code: 'AGV-002', description: '自主规划路线，运输篮球与移动篮球架，完成区域补给。', battery: 91, usage: 87, zone: 'warehouse' },
}
