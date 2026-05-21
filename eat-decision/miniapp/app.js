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
    apiBase: 'https://eatoday.work'
  },

  onLaunch() {
    console.log('App launched, appid: wx06356d564d0219b5')
    this._loadDishes()
  },

  /**
   * 加载菜品库
   * 优先从缓存读取，再请求API，最后回退到mock
   */
  _loadDishes() {
    // 1. 先检查缓存
    const cached = wx.getStorageSync('dishes_cache')
    if (cached && cached.length > 0) {
      this.globalData.allDishes = cached
      this.globalData.dishesLoaded = true
      console.log(`📦 从缓存加载: ${cached.length} 道菜`)
      return
    }

    // 2. 请求API
    wx.showLoading({ title: '加载菜品库...' })
    wx.request({
      url: 'https://eatoday.work/api/dishes',
      method: 'GET',
      timeout: 30000,
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data && res.data.dishes) {
          // 直接使用后端返回的结构，不需要 normalizeDish
          // 后端字段: name, category, attributes, region, cooking, desc
          this.globalData.allDishes = res.data.dishes
          this.globalData.dishesLoaded = true
          wx.setStorageSync('dishes_cache', res.data.dishes)
          console.log(`✅ API 加载成功: ${res.data.dishes.length} 道菜`)
        } else {
          console.error('API 返回异常:', res)
          this._useMockDishes()
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('API 请求失败:', err.errMsg)
        this._useMockDishes()
      }
    })
  },

  /**
   * 使用 mock 数据（仅在 API 完全失败时使用）
   */
  _useMockDishes() {
    const { MOCK_DISHES } = require('./utils/dishes')
    this.globalData.allDishes = MOCK_DISHES
    this.globalData.dishesLoaded = true
    console.log(`⚠️ 使用 mock 数据: ${MOCK_DISHES.length} 道菜`)
  },

  /**
   * 根据用户答题筛选候选菜品
   */
  filterCandidates(answers) {
    const dishes = this.globalData.allDishes
    if (!dishes || dishes.length === 0) return []

    let result = [...dishes]

    // Q01：核心大类
    if (answers.q01) {
      result = result.filter(d => d.category === answers.q01)
    }

    // Q02/Q03：属性（匹配任一属性即可）
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
  },

  /**
   * 获取当前候选数量（用于动态跳题）
   */
  getCandidateCount(answers) {
    return this.filterCandidates(answers).length
  },

  /**
   * 重置游戏会话
   */
  resetSession() {
    this.globalData.session = {
      answers: {},
      tags: [],
      candidates: [],
      battleWinner: null
    }
  }
})