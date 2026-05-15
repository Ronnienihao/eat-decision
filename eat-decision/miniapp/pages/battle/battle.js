// pages/battle/battle.js
const app = getApp()
const { getBattleRounds } = require('../../utils/dishes')

Page({
  data: {
    tags: [],
    currentRound: 1,
    totalRounds: 7,
    dishA: null,
    dishB: null,
    selectedDish: null,
    isOver: false,
    isEmpty: false,
    showUrgeToast: false,
    showUrgeBubble: false
  },

  _candidates: [],
  _currentChampion: null,
  _challengerIndex: 1,
  _timers: [],

  onLoad() {
    const session = app.globalData.session
    const candidates = session.candidates || []
    const tags = session.tags || []

    // 0道菜兜底
    if (candidates.length === 0) {
      this.setData({ isEmpty: true, isOver: true })
      return
    }

    // 1道菜直接胜出
    if (candidates.length === 1) {
      this._endBattle(candidates[0])
      return
    }

    this._candidates = this._shuffle(candidates)
    const totalRounds = getBattleRounds(this._candidates.length)
    this._currentChampion = this._candidates[0]
    this._challengerIndex = 1

    this.setData({
      tags,
      totalRounds,
      currentRound: 1,
      dishA: this._currentChampion,
      dishB: this._candidates[this._challengerIndex]
    })

    this._startUrgeTimers()
  },

  onUnload() {
    this._clearTimers()
  },

  /**
   * 洗牌
   */
  _shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5)
  },

  /**
   * 选择菜品
   */
  onSelectDish(e) {
    if (this.data.selectedDish) return // 防重复点击
    const { side } = e.currentTarget.dataset
    this._clearTimers()
    this.setData({ selectedDish: side, showUrgeToast: false, showUrgeBubble: false })

    setTimeout(() => this._nextRound(side), 600)
  },

  /**
   * 进入下一轮
   */
  _nextRound(winningSide) {
    const winner = winningSide === 'A' ? this.data.dishA : this.data.dishB
    const { currentRound, totalRounds } = this.data

    if (currentRound >= totalRounds) {
      this._endBattle(winner)
      return
    }

    this._challengerIndex++
    this._currentChampion = winner

    this.setData({
      currentRound: currentRound + 1,
      dishA: this._currentChampion,
      dishB: this._candidates[this._challengerIndex],
      selectedDish: null
    })

    this._startUrgeTimers()
  },

  /**
   * 结束，跳转结果页
   */
  _endBattle(winner) {
    app.globalData.session.battleWinner = winner
    wx.redirectTo({ url: '/pages/result/result' })
  },

  /**
   * 催促计时器
   */
  _startUrgeTimers() {
    const t1 = setTimeout(() => {
      if (!this.data.selectedDish) {
        this.setData({ showUrgeToast: true })
        setTimeout(() => this.setData({ showUrgeToast: false }), 2500)
      }
    }, 6000)

    const t2 = setTimeout(() => {
      if (!this.data.selectedDish) {
        this.setData({ showUrgeBubble: true })
      }
    }, 10000)

    this._timers = [t1, t2]
  },

  _clearTimers() {
    this._timers.forEach(t => clearTimeout(t))
    this._timers = []
  },

  onCloseBubble() {
    this.setData({ showUrgeBubble: false })
  },

  onRestart() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
