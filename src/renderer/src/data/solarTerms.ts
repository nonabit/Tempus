// 24节气数据定义
// 包含诗词、现代解读、渐变色配置

export interface SolarTermData {
  name: string // 节气名称
  poem: string // 传统诗词（一句）
  interpretation: string // 现代时间管理解读
  gradient: string // Tailwind 渐变类名
}

// 24节气数据映射
export const SOLAR_TERMS: Record<string, SolarTermData> = {
  立春: {
    name: '立春',
    poem: '东风解冻，蛰虫始振',
    interpretation: '一年之计在于春，此时此刻，正是播种目标的良辰',
    gradient: 'from-emerald-400 via-green-300 to-teal-200'
  },
  雨水: {
    name: '雨水',
    poem: '好雨知时节，当春乃发生',
    interpretation: '润物细无声，持续的小进步终将汇成大成就',
    gradient: 'from-sky-400 via-blue-300 to-cyan-200'
  },
  惊蛰: {
    name: '惊蛰',
    poem: '春雷响，万物长',
    interpretation: '是时候唤醒沉睡的计划，让它们破土而出',
    gradient: 'from-yellow-400 via-amber-300 to-orange-200'
  },
  春分: {
    name: '春分',
    poem: '日夜均分，阴阳相半',
    interpretation: '工作与生活的平衡，是持久高效的秘诀',
    gradient: 'from-pink-400 via-rose-300 to-red-200'
  },
  清明: {
    name: '清明',
    poem: '清明时节雨纷纷',
    interpretation: '清理杂念，明确方向，轻装上阵',
    gradient: 'from-green-400 via-emerald-300 to-teal-200'
  },
  谷雨: {
    name: '谷雨',
    poem: '雨生百谷，万物生长',
    interpretation: '播下的种子正在萌芽，耐心浇灌，静待花开',
    gradient: 'from-lime-400 via-green-300 to-emerald-200'
  },
  立夏: {
    name: '立夏',
    poem: '绿树阴浓夏日长',
    interpretation: '进入成长期，是时候加速推进你的项目了',
    gradient: 'from-green-500 via-emerald-400 to-teal-300'
  },
  小满: {
    name: '小满',
    poem: '小满者，物至于此小得盈满',
    interpretation: '小有所成，但切勿自满，继续前行',
    gradient: 'from-yellow-500 via-amber-400 to-orange-300'
  },
  芒种: {
    name: '芒种',
    poem: '芒种忙忙割，农家乐启镰',
    interpretation: '播种与收获并行，忙碌中见证成果',
    gradient: 'from-amber-500 via-yellow-400 to-lime-300'
  },
  夏至: {
    name: '夏至',
    poem: '日长之至，日影短至',
    interpretation: '阳光最盛之时，把握黄金时段，高效产出',
    gradient: 'from-orange-500 via-amber-400 to-yellow-300'
  },
  小暑: {
    name: '小暑',
    poem: '倏忽温风至，因循小暑来',
    interpretation: '热浪渐起，保持节奏，避免过度消耗',
    gradient: 'from-red-400 via-orange-300 to-amber-200'
  },
  大暑: {
    name: '大暑',
    poem: '赤日几时过，清风无处寻',
    interpretation: '最热的时候也要保持冷静，稳扎稳打',
    gradient: 'from-red-500 via-orange-400 to-amber-300'
  },
  立秋: {
    name: '立秋',
    poem: '一叶落知天下秋',
    interpretation: '收获季将至，回顾上半年，调整下半程',
    gradient: 'from-amber-500 via-orange-400 to-red-300'
  },
  处暑: {
    name: '处暑',
    poem: '处暑无三日，新凉直万金',
    interpretation: '暑气渐消，正是重新出发的好时机',
    gradient: 'from-orange-400 via-amber-300 to-yellow-200'
  },
  白露: {
    name: '白露',
    poem: '蒹葭苍苍，白露为霜',
    interpretation: '晨露凝结，细节决定成败，精益求精',
    gradient: 'from-slate-400 via-gray-300 to-zinc-200'
  },
  秋分: {
    name: '秋分',
    poem: '金气秋分，风清露冷秋期半',
    interpretation: '再次审视平衡，为年末冲刺做好准备',
    gradient: 'from-amber-400 via-yellow-300 to-orange-200'
  },
  寒露: {
    name: '寒露',
    poem: '袅袅凉风动，凄凄寒露零',
    interpretation: '天气转凉，内心更要保持热忱',
    gradient: 'from-cyan-400 via-sky-300 to-blue-200'
  },
  霜降: {
    name: '霜降',
    poem: '霜降水返壑，风落木归山',
    interpretation: '收敛锋芒，沉淀积累，厚积薄发',
    gradient: 'from-gray-400 via-slate-300 to-zinc-200'
  },
  立冬: {
    name: '立冬',
    poem: '冻笔新诗懒写，寒炉美酒时温',
    interpretation: '进入收尾阶段，盘点成果，规划来年',
    gradient: 'from-blue-400 via-indigo-300 to-violet-200'
  },
  小雪: {
    name: '小雪',
    poem: '小雪气寒而将雪矣',
    interpretation: '小步快跑，积小胜为大胜',
    gradient: 'from-sky-300 via-blue-200 to-indigo-100'
  },
  大雪: {
    name: '大雪',
    poem: '大雪压青松，青松挺且直',
    interpretation: '压力之下见真章，坚持就是胜利',
    gradient: 'from-blue-300 via-indigo-200 to-violet-100'
  },
  冬至: {
    name: '冬至',
    poem: '冬至阳生春又来',
    interpretation: '最长的夜过后，光明渐长，希望在前',
    gradient: 'from-indigo-400 via-violet-300 to-purple-200'
  },
  小寒: {
    name: '小寒',
    poem: '小寒连大吕，欢鹊垒新巢',
    interpretation: '年关将至，为新年目标筑巢',
    gradient: 'from-violet-400 via-purple-300 to-fuchsia-200'
  },
  大寒: {
    name: '大寒',
    poem: '大寒须守火，无事不出门',
    interpretation: '蛰伏蓄力，为新一年的爆发做准备',
    gradient: 'from-purple-400 via-violet-300 to-indigo-200'
  }
}

// localStorage 键名前缀
export const SOLAR_TERM_SHOWN_PREFIX = 'tempus_solar_term'
