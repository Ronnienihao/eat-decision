// server/dishes.js
// 菜品数据管理：从飞书同步 + 本地缓存 + 筛选逻辑

const axios = require('axios')

// ── 飞书配置 ────────────────────────────────────────────────
const FEISHU_APP_TOKEN = 'DFq7brjyaaes0gsYLYAcNrh8nSe'
const FEISHU_TABLE_ID = 'tblLDcSAzcNbsibs'

// 飞书 API（需要 app_id + app_secret 换 tenant_access_token）
// 这里使用环境变量，启动前需要设置
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || ''
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || ''

// ── 烹饪方式映射（飞书原始值 → 标准值）────────────────────────
const COOKING_MAP = {
  '炒制': '爆炒'
}

// ── 内存缓存 ─────────────────────────────────────────────────
let DISHES_CACHE = []

/**
 * 获取飞书 tenant_access_token
 */
async function getFeishuToken() {
  const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    app_id: FEISHU_APP_ID,
    app_secret: FEISHU_APP_SECRET
  })
  if (res.data.code !== 0) throw new Error(`飞书授权失败: ${res.data.msg}`)
  return res.data.tenant_access_token
}

/**
 * 标准化单条菜品
 */
function normalizeDish(record) {
  const f = record.fields
  if (!f || !f['菜名']) return null

  const cookingRaw = (f['第四阶段：烹饪方式'] || [])[0] || ''
  const cooking = COOKING_MAP[cookingRaw] || cookingRaw

  const attrs = (f['第二阶段：属性随机池'] || [])

  return {
    name: f['菜名'],
    category: (f['第一阶段：核心大类'] || [])[0] || '',
    attributes: attrs,
    region: (f['第三阶段：地域盲盒'] || [])[0] || '',
    cooking,
    desc: f['推荐语'] || ''
  }
}

/**
 * 从飞书拉取全部菜品并缓存
 */
async function syncDishes() {
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
    throw new Error('未配置 FEISHU_APP_ID / FEISHU_APP_SECRET 环境变量')
  }

  const token = await getFeishuToken()
  const allRecords = []
  let pageToken = ''

  do {
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_APP_TOKEN}/tables/${FEISHU_TABLE_ID}/records`
    const params = { page_size: 500 }
    if (pageToken) params.page_token = pageToken

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params
    })

    if (res.data.code !== 0) throw new Error(`飞书数据拉取失败: ${res.data.msg}`)

    const items = res.data.data.items || []
    allRecords.push(...items)
    pageToken = res.data.data.has_more ? res.data.data.page_token : ''
  } while (pageToken)

  const dishes = allRecords.map(normalizeDish).filter(Boolean)
  DISHES_CACHE = dishes
  console.log(`[dishes] 缓存更新: ${dishes.length} 道菜`)
  return dishes.length
}

/**
 * 获取所有缓存菜品
 */
function getAllDishes() {
  return DISHES_CACHE
}

/**
 * 根据答题结果筛选菜品
 */
function filterDishes(answers) {
  let result = [...DISHES_CACHE]

  if (answers.q01) {
    result = result.filter(d => d.category === answers.q01)
  }

  const attrAnswers = [answers.q02, answers.q03].filter(Boolean)
  if (attrAnswers.length > 0) {
    result = result.filter(d =>
      attrAnswers.some(attr => d.attributes && d.attributes.includes(attr))
    )
  }

  if (answers.q04) {
    result = result.filter(d => d.region === answers.q04)
  }

  if (answers.q05) {
    result = result.filter(d => d.cooking === answers.q05)
  }

  return result
}

module.exports = { syncDishes, getAllDishes, filterDishes }
