// pages/index/index.js
const app = getApp()

Page({
  data: {
    hasHistory: false
  },

  onLoad() {
    // 重置游戏状态
    app.resetSession()
    // 检查是否有历史记录
    const history = wx.getStorageSync('history') || []
    this.setData({ hasHistory: history.length > 0 })
  },

  onShow() {
    app.resetSession()
  },

  onStartGame() {
    wx.navigateTo({ url: '/pages/quiz/quiz' })
  },

  onGoHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  }
})
