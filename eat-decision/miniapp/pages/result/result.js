// pages/result/result.js
const app = getApp()

Page({
  data: {
    winner: null,
    tags: []
  },

  onLoad() {
    const session = app.globalData.session
    const winner = session.battleWinner
    const tags = session.tags || []

    if (!winner) {
      wx.reLaunch({ url: '/pages/index/index' })
      return
    }

    this.setData({ winner, tags })
  },

  /**
   * 保存结果到本地
   */
  onSaveResult() {
    const { winner, tags } = this.data
    const history = wx.getStorageSync('history') || []
    const record = {
      id: Date.now(),
      date: new Date().toLocaleDateString('zh-CN'),
      dishName: winner.name,
      tags,
      createdAt: Date.now()
    }

    // 只保留最近 30 条
    history.unshift(record)
    if (history.length > 30) history.splice(30)
    wx.setStorageSync('history', history)

    wx.showToast({
      title: '已保存到历史记录 ✓',
      icon: 'success',
      duration: 1500
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const { winner } = this.data
    return {
      title: `点饭时间到！我今天选了「${winner.name}」，快来 PK 一下！`,
      path: '/pages/index/index'
    }
  },

  /**
   * 再来一局
   */
  onRestart() {
    app.resetSession()
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
