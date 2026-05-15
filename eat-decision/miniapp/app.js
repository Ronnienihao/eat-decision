// app.js
const { normalizeDish, MOCK_DISHES } = require('./utils/dishes')

App({
  globalData: {
    // 当前游戏会话状态
    session: {
      answers: {},       // { q01: 'A', q02: 'A', q03: 'B', q04: '川湘菜', q05: '爆炒' }
      tags: [],          // 最终标签数组，传给 PK 阶段
      candidates: [],    // 候选菜品列表
      battleWinner: null // 最终胜出菜品
    },
    // 菜品库（从后端 API 加载）
    allDishes: [],
    dishesLoaded: false,
    // 用户信息
    userInfo: null,
    openid: wx.getStorageSync('openid') || null
  },

  onLaunch() {
    console.log('App launched, appid: wx06356d564d0219b5')
    this._loadDishes()
  },

  /**
   * 加载菜品数据
   * 优先从后端 API 获取，失败则使用缓存，再失败用 mock
   */
  _loadDishes() {
    // 先检查本地缓存
    const cached = wx.getStorageSync('dishes_cache')
    const cacheTime = wx.getStorageSync('dishes_cache_time') || 0
    const ONE_DAY = 24 * 60 * 60 * 1000

    if (cached && cached.length > 0 && Date.now() - cacheTime < ONE_DAY) {
      this.globalData.allDishes = cached
      this.globalData.dishesLoaded = true
      console.log(`菜品库已从缓存加载: ${cached.length} 道菜`)
      return
    }

    // TODO: 从后端 API 获取
    // 后端 API 未就绪时，使用 mock 数据
    // wx.request({
    //   url: 'https://your-server.com/api/dishes',
    //   success: (res) => {
    //     const dishes = res.data.map(r => normalizeDish(r)).filter(Boolean)
    //     this.globalData.allDishes = dishes
    //     this.globalData.dishesLoaded = true
    //     wx.setStorageSync('dishes_cache', dishes)
    //     wx.setStorageSync('dishes_cache_time', Date.now())
    //   },
    //   fail: () => {
    //     this._useMockDishes()
    //   }
    // })

    // 当前使用 mock 数据（后端就绪后替换）
    this._useMockDishes()
  },

  _useMockDishes() {
    this.globalData.allDishes = MOCK_DISHES
    this.globalData.dishesLoaded = true
    console.log(`菜品库使用 mock 数据: ${MOCK_DISHES.length} 道菜`)
  },

  // 重置游戏会话
  resetSession() {
    this.globalData.session = {
      answers: {},
      tags: [],
      candidates: [],
      battleWinner: null
    }
  }
})
