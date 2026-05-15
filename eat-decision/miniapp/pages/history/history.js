// pages/history/history.js
Page({
  data: {
    records: []
  },

  onLoad() {
    this._loadHistory()
  },

  onShow() {
    this._loadHistory()
  },

  _loadHistory() {
    const history = wx.getStorageSync('history') || []
    this.setData({ records: history })
  }
})
