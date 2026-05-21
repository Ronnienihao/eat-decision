// pages/quiz/quiz.js
const app = getApp()
const { getAttributeQuestions, getRegionOptions, getCookingOptions } = require('../../utils/quiz-data')

Page({
  data: {
    currentStep: 0,
    totalSteps: [0, 1, 2, 3, 4],
    currentQuestion: null,
    selectedOption: null,
    isLastStep: false,
    refreshUsed: false,
    showUrgeToast: false,
    showUrgeBubble: false,
    urgeToastShown: false,
    urgeBubbleShown: false,
    // 调试信息
    debugInfo: ''
  },

  _questions: [],
  _answers: {},
  _timers: [],

  onLoad() {
    console.log('=== Quiz Page Load ===')
    console.log('dishesLoaded:', app.globalData.dishesLoaded)
    console.log('allDishes count:', app.globalData.allDishes.length)

    const checkReady = () => {
      if (app.globalData.dishesLoaded && app.globalData.allDishes.length > 0) {
        console.log('✅ 菜品库已就绪:', app.globalData.allDishes.length, '道菜')
        this._buildQuestions()
        this._showQuestion(0)
      } else {
        console.log('⏳ 等待菜品库...')
        this.setData({ debugInfo: `加载中... ${app.globalData.allDishes.length} 道菜` })
        setTimeout(checkReady, 200)
      }
    }
    checkReady()
  },

  onUnload() {
    this._clearTimers()
  },

  _buildQuestions() {
    const attrQuestions = getAttributeQuestions()
    this._questions = [
      {
        id: 'q01',
        question: '你今天想吃哪种？',
        type: 'binary',
        options: [
          { id: 'A', label: '🥢 中国菜', value: '中国菜' },
          { id: 'B', label: '🍝 异国料理', value: '异国料理' }
        ]
      },
      attrQuestions[0],
      attrQuestions[1],
      null,
      {
        id: 'q05',
        question: '你想要什么烹饪方式？',
        type: 'triple',
        options: getCookingOptions().map((v, i) => ({ id: String(i), label: v, value: v }))
      }
    ]
  },

  _showQuestion(step) {
    if (step === 3) {
      const coreCategory = this._answers['q01'] || '中国菜'
      const regions = getRegionOptions(coreCategory)
      this._questions[3] = {
        id: 'q04',
        question: '来个地域盲盒？',
        type: 'triple',
        options: regions.map((r, i) => ({ id: String(i), label: r.label, value: r.value }))
      }
    }

    const q = this._questions[step]
    this.setData({
      currentStep: step,
      currentQuestion: q,
      selectedOption: null,
      isLastStep: step === 4,
      refreshUsed: false,
      showUrgeToast: false,
      showUrgeBubble: false,
      urgeToastShown: false,
      urgeBubbleShown: false
    })

    this._clearTimers()
    this._startUrgeTimers()
  },

  _startUrgeTimers() {
    const t1 = setTimeout(() => {
      if (!this.data.selectedOption && !this.data.urgeToastShown) {
        this.setData({ showUrgeToast: true, urgeToastShown: true })
        setTimeout(() => this.setData({ showUrgeToast: false }), 2500)
      }
    }, 6000)

    const t2 = setTimeout(() => {
      if (!this.data.selectedOption && !this.data.urgeBubbleShown) {
        this.setData({ showUrgeBubble: true, urgeBubbleShown: true })
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

  _recordAnswer(option, value) {
    this._clearTimers()
    const qid = this.data.currentQuestion ? this.data.currentQuestion.id : null
    if (qid) {
      this._answers[qid] = value
      console.log(`✅ 记录答案: ${qid} = ${value}`)
    }
    this.setData({ selectedOption: option, showUrgeToast: false, showUrgeBubble: false })
  },

  onSelect(e) {
    const { option, value } = e.currentTarget.dataset
    this._recordAnswer(option, value)
    setTimeout(() => this._handleAutoNext(), 400)
  },

  onSelectTriple(e) {
    const { option, value } = e.currentTarget.dataset
    this._recordAnswer(option, value)
    setTimeout(() => this._handleAutoNext(), 400)
  },

  _handleAutoNext() {
    if (!this.data.selectedOption) return

    const step = this.data.currentStep
    this._clearTimers()

    // 调试：显示当前状态
    const currentAnswers = { ...this._answers }
    const count = app.getCandidateCount(currentAnswers)
    console.log(`=== 当前进度: step=${step}, 候选=${count} ===`)
    this.setData({ debugInfo: `step${step+1} | 候选: ${count} 道菜` })

    const shouldSkip = count > 0 && count < 60

    if (step === 4 || shouldSkip) {
      const candidates = app.filterCandidates(currentAnswers)
      this._goBattle(candidates)
      return
    }

    this._showQuestion(step + 1)
  },

  onNext() {
    // 手动触发检查（备用）
    this._handleAutoNext()
  },

  _goBattle(candidates) {
    const session = app.globalData.session
    session.answers = { ...this._answers }
    session.candidates = candidates
    session.tags = this._buildTags()

    const count = candidates.length
    console.log(`🔥 进入 PK: ${count} 道菜`)
    wx.showToast({
      title: `找到 ${count} 道菜，开始决斗！🔥`,
      icon: 'none',
      duration: 1500
    })

    setTimeout(() => {
      wx.navigateTo({ url: '/pages/battle/battle' })
    }, 1500)
  },

  _buildTags() {
    const a = this._answers
    return [a.q01, a.q02, a.q03, a.q04, a.q05].filter(Boolean)
  },

  onRefreshOptions() {
    if (this.data.refreshUsed) return
    const step = this.data.currentStep
    let newOptions

    if (step === 3) {
      const coreCategory = this._answers['q01'] || '中国菜'
      newOptions = getRegionOptions(coreCategory).map((r, i) => ({ id: String(i), label: r.label, value: r.value }))
    } else {
      newOptions = getCookingOptions().map((v, i) => ({ id: String(i), label: v, value: v }))
    }

    this.setData({
      'currentQuestion.options': newOptions,
      selectedOption: null,
      refreshUsed: true
    })
  }
})