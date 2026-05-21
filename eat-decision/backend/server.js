const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
const PORT = 3000;

// 飞书 Bitable 配置
const BITABLE_APP_TOKEN = 'DFq7brjyaaes0gsYLYAcNrh8nSe';
const BITABLE_TABLE_ID = 'tblLDcSAzcNbsibs';
const BITABLE_BASE_URL = `https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE_APP_TOKEN}/tables/${BITABLE_TABLE_ID}/records`;

// 飞书应用凭证
const FEISHU_APP_ID = 'cli_a93efe07e3f8dbcd';
const FEISHU_APP_SECRET = 'f5nZ5YJflynbYEvjkZcXHfcyjb25mpoY';
let tenantAccessToken = '';

// 缓存
let dishesCache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

// 获取 token
async function getTenantToken() {
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      { app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data.code === 0) {
      tenantAccessToken = response.data.tenant_access_token;
      return tenantAccessToken;
    }
    throw new Error(`Token 获取失败: ${response.data.msg}`);
  } catch (error) {
    console.error('Token 获取错误:', error.message);
    throw error;
  }
}

// 标准化菜品
function normalizeDish(record) {
  const f = record.fields;
  if (!f || !f['菜名']) return null;

  let cookingRaw = f['第四阶段：烹饪方式'];
  let cooking = Array.isArray(cookingRaw) ? cookingRaw[0] : (cookingRaw || '');
  if (typeof cooking === 'object' && cooking !== null) cooking = cooking.text || '';

  let attrsRaw = f['第二阶段：属性随机池'] || [];
  let attrs = attrsRaw.map(a => typeof a === 'object' ? (a.text || a) : a);

  let regionRaw = (f['第三阶段：地域盲盒'] || [])[0] || '';
  let region = typeof regionRaw === 'object' ? (regionRaw.text || '') : regionRaw;

  let categoryRaw = (f['第一阶段：核心大类'] || [])[0] || '';
  let category = typeof categoryRaw === 'object' ? (categoryRaw.text || '') : categoryRaw;

  return {
    name: f['菜名'],
    category: category,
    attributes: attrs,
    region: region,
    cooking: cooking,
    desc: f['推荐语'] || ''
  };
}

// 从飞书拉数据
async function fetchDishesFromBitable() {
  if (!tenantAccessToken) await getTenantToken();
  const allRecords = [];
  let pageToken = '';

  do {
    const params = pageToken ? { page_token: pageToken, page_size: 500 } : { page_size: 500 };
    let response;
    try {
      response = await axios.get(BITABLE_BASE_URL, {
        headers: { 'Authorization': `Bearer ${tenantAccessToken}` },
        params
      });
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        await getTenantToken();
        response = await axios.get(BITABLE_BASE_URL, {
          headers: { 'Authorization': `Bearer ${tenantAccessToken}` },
          params
        });
      } else {
        throw error;
      }
    }
    if (response.data && response.data.data) {
      allRecords.push(...(response.data.data.items || []));
      const hasMore = response.data.data.has_more;
      pageToken = response.data.data.page_token || '';
      if (!hasMore) break;
    } else {
      break;
    }
  } while (pageToken);

  return allRecords.map(normalizeDish).filter(Boolean);
}

// 获取菜品（带缓存）
async function getDishes() {
  const now = Date.now();
  if (dishesCache && (now - cacheTime < CACHE_TTL)) return dishesCache;
  try {
    dishesCache = await fetchDishesFromBitable();
    cacheTime = now;
    console.log(`[${new Date().toISOString()}] 缓存刷新，菜品数: ${dishesCache.length}`);
    return dishesCache;
  } catch (error) {
    console.error('获取飞书数据失败:', error.message);
    if (dishesCache) return dishesCache;
    throw error;
  }
}

// 过滤函数（直接用字符串匹配，不过做任何转换）
function filterDishes(dishes, answers) {
  let result = [...dishes];

  if (answers.q01) {
    result = result.filter(d => d.category === answers.q01);
  }

  const attrAnswers = [answers.q02, answers.q03].filter(Boolean);
  if (attrAnswers.length > 0) {
    result = result.filter(d =>
      attrAnswers.some(attr => d.attributes && d.attributes.includes(attr))
    );
  }

  if (answers.q04) {
    result = result.filter(d => d.region === answers.q04);
  }

  if (answers.q05) {
    result = result.filter(d => d.cooking === answers.q05);
  }

  return result;
}

// ========== 路由 ==========

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const dishes = await getDishes();
    res.json({ status: 'ok', dishCount: dishes.length });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET: 获取全部菜品（无筛选）
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await getDishes();
    res.json({ total: dishes.length, dishes: dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: 筛选菜品（用 body 传递参数，绕过 URL 编码问题）
app.post('/api/filter', async (req, res) => {
  try {
    const dishes = await getDishes();
    const { q01, q02, q03, q04, q05 } = req.body;
    const answers = { q01, q02, q03, q04, q05 };
    
    // 调试日志
    console.log(`POST /api/filter: q01=${q01}, q02=${q02}, q03=${q03}, q04=${q04}, q05=${q05}`);
    
    if (!q01 && !q02 && !q03 && !q04 && !q05) {
      return res.json({ total: dishes.length, dishes: dishes });
    }
    
    const filtered = filterDishes(dishes, answers);
    console.log(`筛选结果: ${filtered.length} 道菜`);
    res.json({ total: filtered.length, dishes: filtered });
  } catch (error) {
    console.error('API 错误:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 强制刷新缓存
app.get('/api/refresh', async (req, res) => {
  try {
    cacheTime = 0;
    const dishes = await getDishes();
    res.json({ status: 'ok', dishCount: dishes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动
async function init() {
  console.log('🍜 后端启动中...');
  try {
    await getTenantToken();
    const dishes = await getDishes();
    console.log(`✅ 加载 ${dishes.length} 道菜品`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 http://43.128.123.207:${PORT}`);
      console.log('   GET  /api/dishes        - 全部菜品');
      console.log('   POST /api/filter        - 筛选菜品（body: {q01,q02,q03,q04,q05}）');
      console.log('   GET  /api/health        - 健康检查');
      console.log('   GET  /api/refresh       - 刷新缓存');
    });
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

init();