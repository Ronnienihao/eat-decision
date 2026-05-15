// utils/dishes.js
// 菜品数据管理

// 烹饪方式映射（飞书原始值 → 标准值）
const COOKING_MAP = {
  '炒制': '爆炒',
  '轻食/代餐': '解馋轻食/代餐'
}

/**
 * 标准化单条菜品记录（飞书格式 → 小程序格式）
 */
function normalizeDish(record) {
  const f = record.fields
  if (!f || !f['菜名']) return null

  // 烹饪方式标准化（取第一个有效值）
  let cooking = null
  const cookingRaw = f['第四阶段：烹饪方式']
  if (cookingRaw && cookingRaw.length > 0) {
    const raw = cookingRaw[0]
    cooking = COOKING_MAP[raw] || raw
  }

  // 属性标准化
  const attrs = (f['第二阶段：属性随机池'] || []).map(a => COOKING_MAP[a] || a)

  return {
    name: f['菜名'],
    category: (f['第一阶段：核心大类'] || [])[0] || '',
    attributes: attrs,
    region: (f['第三阶段：地域盲盒'] || [])[0] || '',
    cooking: cooking || '',
    desc: f['推荐语'] || ''
  }
}

/**
 * 根据用户选择的标签筛选候选菜品
 * @param {Array} dishes - 菜品列表
 * @param {object} answers - 用户的答题记录 { q01, q02, q03, q04, q05 }
 * @returns {Array} 候选菜品列表
 */
function filterDishes(dishes, answers) {
  let result = [...dishes]

  // Q01：核心大类（必选）
  if (answers.q01) {
    result = result.filter(d => d.category === answers.q01)
  }

  // Q02/Q03：属性（有一个属性匹配即可）
  const attrAnswers = [answers.q02, answers.q03].filter(Boolean)
  if (attrAnswers.length > 0) {
    result = result.filter(d =>
      attrAnswers.some(attr => d.attributes && d.attributes.includes(attr))
    )
  }

  // Q04：地域
  if (answers.q04) {
    result = result.filter(d => d.region === answers.q04)
  }

  // Q05：烹饪方式
  if (answers.q05) {
    result = result.filter(d => d.cooking === answers.q05)
  }

  return result
}

/**
 * 计算 PK 轮数
 * @param {number} count - 候选菜品数量
 * @returns {number} PK 轮数
 */
function getBattleRounds(count) {
  if (count === 0) return 0
  if (count === 1) return 0
  if (count >= 8) return 7
  return count - 1
}

// 开发用 mock 数据（真实数据通过后端 API 获取）
const MOCK_DISHES = [
  { name: '剁椒鱼头', category: '中国菜', attributes: ['重口浓郁', '管饱正餐', '可以30¥以上', '热菜'], region: '川湘菜', cooking: '清蒸', desc: '火辣的剁椒配上细嫩鱼肉，热烈奔放。' },
  { name: '麻辣烫', category: '中国菜', attributes: ['重口浓郁', '管饱正餐', '热菜', '30¥内搞定'], region: '川湘菜', cooking: '熬煮', desc: '这一锅，装满了对多巴胺的极致渴望。' },
  { name: '酸菜鱼', category: '中国菜', attributes: ['重口浓郁', '管饱正餐', '热菜', '30¥内搞定'], region: '川湘菜', cooking: '熬煮', desc: '酸爽开胃，没胃口时的米饭杀手。' },
  { name: '日式肥牛丼饭', category: '异国料理', attributes: ['清淡原味', '管饱正餐', '热菜', '30¥内搞定', '肉食主义'], region: '日式料理', cooking: '熬煮', desc: '经典的咸鲜口，大口吞咽的满足感。' },
  { name: '韩式石锅拌饭', category: '异国料理', attributes: ['重口浓郁', '管饱正餐', '热菜', '无视卡路里'], region: '韩式料理', cooking: '熬煮', desc: '拌匀那一刻的香气，是独居生活的慰藉。' },
  { name: '广式腊味煲仔饭', category: '中国菜', attributes: ['管饱正餐', '肉食主义', '热菜', '重口浓郁', '30¥内搞定'], region: '广东菜', cooking: '砂锅', desc: '锅底那层金黄锅巴，是整碗饭的灵魂。' },
  { name: '红烧肉', category: '中国菜', attributes: ['重口浓郁', '管饱正餐', '肉食主义', '热菜', '30¥内搞定'], region: '江浙本帮', cooking: '红烧', desc: '浓油赤酱，米饭最完美的伴侣。' },
  { name: '芝士牛肉菌菇披萨', category: '异国料理', attributes: ['重口浓郁', '管饱正餐', '无视卡路里', '热菜'], region: '经典西餐', cooking: '烘焙', desc: '芝士拉丝的瞬间，所有压力都消失了。' },
]

module.exports = {
  normalizeDish,
  filterDishes,
  getBattleRounds,
  MOCK_DISHES
}
