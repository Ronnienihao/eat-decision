// app.js
App({
  globalData: {
    session: {
      answers: {},
      tags: [],
      candidates: [],
      battleWinner: null
    },
    allDishes: [],
    dishesLoaded: false,
    apiBase: 'https://athens-acting-tend-jimmy.trycloudflare.com'
  },

  onLaunch() {
    console.log('App launched, appid: wx06356d564d0219b5')
    this._loadDishesWithRetry(3)
  },

  /**
   * 带重试的加载
   */
  _loadDishesWithRetry(remain) {
    console.log(`📡 尝试加载菜品库，剩余重试次数: ${remain}`)
    wx.showLoading({ title: '加载菜品库...' })

    wx.request({
      url: this.globalData.apiBase + '/api/dishes',
      method: 'GET',
      timeout: 60000,  // 60秒超时，给足加载时间
      success: (res) => {
        wx.hideLoading()
        console.log('API 响应:', res.statusCode, res.data ? `total=${res.data.total}` : 'no data')
        
        if (res.statusCode === 200 && res.data && res.data.dishes) {
          this.globalData.allDishes = res.data.dishes
          this.globalData.dishesLoaded = true
          console.log(`✅ 菜品库加载成功: ${res.data.dishes.length} 道菜`)
          wx.setStorageSync('dishes_cache', res.data.dishes)
        } else {
          console.error('API 返回异常:', res.statusCode, res.data)
          this._loadFromCacheOrMock()
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('菜品库加载失败:', err.errMsg || err.message || err)
        
        if (remain > 1) {
          console.log(`⏳ ${remain - 1} 秒后重试...`)
          setTimeout(() => this._loadDishesWithRetry(remain - 1), 1500)
        } else {
          console.log('⚠️ 重试次数用完，使用缓存或 mock')
          this._loadFromCacheOrMock()
        }
      }
    })
  },

  /**
   * 回退到缓存或 mock
   */
  _loadFromCacheOrMock() {
    const cached = wx.getStorageSync('dishes_cache')
    if (cached && cached.length > 0) {
      this.globalData.allDishes = cached
      this.globalData.dishesLoaded = true
      console.log(`菜品库从缓存加载: ${cached.length} 道菜`)
      return
    }

    const { MOCK_DISHES } = require('./utils/dishes')
    this.globalData.allDishes = MOCK_DISHES
    this.globalData.dishesLoaded = true
    console.log(`菜品库使用 mock: ${MOCK_DISHES.length} 道菜`)
  },

  /**
   * 筛选候选菜品
   */
  filterCandidates(answers) {
    const dishes = this.globalData.allDishes
    if (!dishes || dishes.length === 0) return []

    let result = [...dishes]

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
  },

  getCandidateCount(answers) {
    return this.filterCandidates(answers).length
  },

  refreshDishes() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBase + '/api/refresh',
        method: 'GET',
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.dishCount) {
            this._loadDishesWithRetry(1)
            resolve(res.data.dishCount)
          } else {
            reject(new Error('刷新失败'))
          }
        },
        fail: reject
      })
    })
  },

  resetSession() {
    this.globalData.session = {
      answers: {},
      tags: [],
      candidates: [],
      battleWinner: null
    }
  }
})