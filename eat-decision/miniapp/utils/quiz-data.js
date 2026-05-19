// utils/quiz-data.js
// 所有题目配置

const QUIZ_DATA = {
  // Q01：核心大类
  q01: {
    id: 'q01',
    question: '你今天想吃哪种？',
    type: 'binary',
    options: [
      { id: 'A', label: '🥢 中国菜', value: '中国菜' },
      { id: 'B', label: '🍝 异国料理', value: '异国料理' }
    ]
  },

  // Q02 & Q03：属性偏好（从7组随机抽2组）
  attributeGroups: [
    { id: 'g1', a: '重口浓郁', b: '清淡原味' },
    { id: 'g2', a: '管饱正餐', b: '轻食/代餐' },
    { id: 'g3', a: '肉食主义', b: '多点蔬菜' },
    { id: 'g4', a: '30¥内搞定', b: '可以30¥以上' },
    { id: 'g5', a: '无视卡路里', b: '严格控卡党' },
    { id: 'g6', a: '热菜', b: '冷餐' },
    { id: 'g7', a: '15分钟吃完', b: '我要慢慢品味' }
  ],

  // Q04：地域盲盒（根据Q01结果选池）
  regionPools: {
    '中国菜': [
      { label: '广东菜', value: '广东菜' },
      { label: '川湘菜', value: '川湘菜' },
      { label: '北方硬菜', value: '北方硬菜' },
      { label: '江浙本帮', value: '江浙本帮' },
      { label: '云贵桂', value: '云贵桂' }
    ],
    '异国料理': [
      { label: '日式料理', value: '日式料理' },
      { label: '韩式料理', value: '韩式料理' },
      { label: '美式快餐', value: '美式快餐' },
      { label: '经典西餐', value: '经典西餐' },
      { label: '东南亚菜', value: '东南亚菜' }
    ]
  },

  // Q05：烹饪方式（与飞书数据一致）
  cookingMethods: [
    '炒制', '清蒸', '慢炖', '红烧', '砂锅',
    '凉/热拌', '酥炸', '煎烤', '烘焙', '生食',
    '熬煮', '冷餐', '卤制', '腌/熏制'
  ]
}

/**
 * 随机从数组中取 n 个不重复元素
 */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/**
 * 随机抽取 2 组属性题
 */
function getAttributeQuestions() {
  const groups = pickRandom(QUIZ_DATA.attributeGroups, 2)
  return groups.map((g, i) => ({
    id: i === 0 ? 'q02' : 'q03',
    question: '偏好哪个？',
    type: 'binary',
    groupId: g.id,
    options: [
      { id: 'A', label: g.a, value: g.a },
      { id: 'B', label: g.b, value: g.b }
    ]
  }))
}

/**
 * 获取地域盲盒选项（随机掉落3个）
 */
function getRegionOptions(coreCategory) {
  const pool = QUIZ_DATA.regionPools[coreCategory] || QUIZ_DATA.regionPools['中国菜']
  return pickRandom(pool, 3)
}

/**
 * 获取烹饪方式选项（随机掉落3个）
 */
function getCookingOptions() {
  return pickRandom(QUIZ_DATA.cookingMethods, 3)
}

module.exports = {
  QUIZ_DATA,
  pickRandom,
  getAttributeQuestions,
  getRegionOptions,
  getCookingOptions
}