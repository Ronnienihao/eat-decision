// utils/api.js
// 后端 API 封装

const BASE_URL = 'http://43.128.123.207:3000/api'  // TODO: 替换为实际后端地址

/**
 * 通用请求封装
 */
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

/**
 * 微信登录 - code 换 token
 */
function login(code) {
  return request('/auth/login', 'POST', { code })
}

/**
 * 根据标签筛选菜品
 * @param {object} tags - { category, attributes, region, cooking }
 */
function filterDishes(tags) {
  // GET /api/dishes?q01=中国菜&q02=重口浓郁...
  const params = new URLSearchParams()
  if (tags.q01) params.append('q01', tags.q01)
  if (tags.q02) params.append('q02', tags.q02)
  if (tags.q03) params.append('q03', tags.q03)
  if (tags.q04) params.append('q04', tags.q04)
  if (tags.q05) params.append('q05', tags.q05)
  const query = params.toString()
  return request('/dishes' + (query ? '?' + query : ''), 'GET')
}

/**
 * 保存今日结果
 */
function saveRecord(record) {
  return request('/records', 'POST', record)
}

/**
 * 获取历史记录（近30天）
 */
function getHistory() {
  return request('/records', 'GET')
}

/**
 * 获取口味报告
 */
function getAnalysis() {
  return request('/analysis', 'GET')
}

module.exports = {
  login,
  filterDishes,
  saveRecord,
  getHistory,
  getAnalysis
}
