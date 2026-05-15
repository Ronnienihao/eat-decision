// server/index.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const { syncDishes, filterDishes, getAllDishes } = require('./dishes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ── 健康检查 ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dishes = getAllDishes()
  res.json({ ok: true, dishCount: dishes.length, time: new Date().toISOString() })
})

// ── 获取所有菜品（小程序启动时缓存用）──────────────────────
app.get('/api/dishes', (req, res) => {
  const dishes = getAllDishes()
  res.json({ ok: true, data: dishes, count: dishes.length })
})

// ── 筛选菜品 ──────────────────────────────────────────────
app.post('/api/dishes/filter', (req, res) => {
  const answers = req.body || {}
  const result = filterDishes(answers)
  res.json({ ok: true, data: result, count: result.length })
})

// ── 手动触发同步 ──────────────────────────────────────────
app.post('/api/sync', async (req, res) => {
  try {
    const count = await syncDishes()
    res.json({ ok: true, message: `同步完成，共 ${count} 道菜` })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── 每天凌晨3点自动同步 ────────────────────────────────────
cron.schedule('0 3 * * *', async () => {
  console.log('[cron] 开始同步飞书菜品数据...')
  try {
    const count = await syncDishes()
    console.log(`[cron] 同步完成，共 ${count} 道菜`)
  } catch (e) {
    console.error('[cron] 同步失败:', e.message)
  }
}, { timezone: 'Asia/Shanghai' })

// ── 启动 ──────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`✅ 吃饭极限二选一 API 启动，端口 ${PORT}`)
  try {
    const count = await syncDishes()
    console.log(`✅ 菜品同步完成，共 ${count} 道菜`)
  } catch (e) {
    console.error('⚠️ 菜品同步失败:', e.message)
  }
})
