// pages/quiz/quiz.js
const app = getApp()
const { getAttributeQuestions, getRegionOptions, getCookingOptions } = require('../../utils/quiz-data')
const { filterDishes, getBattleRounds, MOCK_DISHES } = require('../../utils/dishes')

Page({
  data: {
    // 题目状态
    currentStep: 0,
    totalSteps: [0, 1, 2, 3, 4], // 5个步骤的数组，用于渲染进度点
    currentQuestion: null,
    selectedOption: null,
    isLastStep: false,

    // Q04/Q05 换一组
    refreshUsed: false,

    // 催促提示
    showUrgeToast: false,
    showUrgeBubble: false,
    urgeToastShown: false,  // 本题是否已触发过 Toast
    urgeBubbleShown: false  // 本题是否已触发过 Bubble
  },

  // 题目序列（动态构建）
  _questions: [],
  _answers: {},
  _timers: [],

  onLoad() {
    this._buildQuestions()
    this._showQuestion(0)
  },

  onUnload() {
    this._clearTimers()
  },

  /**
   * 构建题目序列
   */
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
      // Q04 在 Q01 答完后动态设置
      null,
      {
        id: 'q05',
        question: '你想要什么烹饪方式？',
        type: 'triple',
        options: getCookingOptions().map((v, i) => ({ id: String(i), label: v, value: v }))
      }
    ]
  },

  /**
   * 显示指定步骤的题目
   */
  _showQuestion(step) {
    // 如果是 Q04，需要根据 Q01 的答案动态生成
    if (step === 3) {
      const coreCategory = this._answers['q01'] || '中国菜'
      const regions = getRegionOptions(coreCategory)
      this._questions[3] = {
        id: 'q04',
        question: '来个地域盲盒？',
        type: 'triple',
        options: regions.map((v, i) => ({ id: String(i), label: v, value: v }))
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

  /**
   * 催促计时器
   */
  _startUrgeTimers() {
    // 6秒后 Toast
    const t1 = setTimeout(() => {
      if (!this.data.selectedOption && !this.data.urgeToastShown) {
        this.setData({ showUrgeToast: true, urgeToastShown: true })
        setTimeout(() => this.setData({ showUrgeToast: false }), 2500)
      }
    }, 6000)

    // 10秒后气泡
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

  /**
   * 关闭催促气泡
   */
  onCloseBubble() {
    this.setData({ showUrgeBubble: false })
  },

  /**
   * 二选一选择
   */
  onSelect(e) {
    const { option, value } = e.currentTarget.dataset
    this.setData({ selectedOption: option })
    this._clearTimers()
    this.setData({ showUrgeToast: false, showUrgeBubble: false })
    // 记录答案
    const qid = this.data.currentQuestion.id
    this._answers[qid] = value
  },

  /**
   * 三选一选择
   */
  onSelectTriple(e) {
    const { option, value } = e.currentTarget.dataset
    this.setData({ selectedOption: option })
    this._clearTimers()
    this.setData({ showUrgeToast: false, showUrgeBubble: false })
    const qid = this.data.currentQuestion.id
    this._answers[qid] = value
  },

  /**
   * 换一组（Q04/Q05）
   */
  onRefreshOptions() {
    if (this.data.refreshUsed) return
    const step = this.data.currentStep
    const q = this.data.currentQuestion
    let newOptions

    if (step === 3) {
      // Q04 换一组
      const coreCategory = this._answers['q01'] || '中国菜'
      newOptions = getRegionOptions(coreCategory).map((v, i) => ({ id: String(i), label: v, value: v }))
    } else {
      // Q05 换一组
      newOptions = getCookingOptions().map((v, i) => ({ id: String(i), label: v, value: v }))
    }

    this.setData({
      'currentQuestion.options': newOptions,
      selectedOption: null,
      refreshUsed: true
    })
  },

  /**
   * 下一题 / 提交
   */
  onNext() {
    const step = this.data.currentStep
    this._clearTimers()

    // 获取当前菜品库（优先用全局 session 中的菜品库，fallback 到 mock）
    const app = getApp()
    const allDishes = app.globalData.allDishes || MOCK_DISHES

    // 动态跳题：每轮答完后检查候选数量
    const candidates = filterDishes(allDishes, this._answers)
    const shouldSkip = candidates.length < 30

    if (step === 4 || shouldSkip) {
      // 进入 PK 阶段
      this._goBattle(candidates)
      return
    }

    // 下一题
    this._showQuestion(step + 1)
  },

  /**
   * 跳转到擂台页
   */
  _goBattle(candidates) {
    const session = app.globalData.session
    session.answers = { ...this._answers }
    session.candidates = candidates
    session.tags = this._buildTags()

    const count = candidates.length
    wx.showToast({
      title: `找到 ${count} 道菜，开始决斗！🔥`,
      icon: 'none',
      duration: 1500
    })

    setTimeout(() => {
      wx.navigateTo({ url: '/pages/battle/battle' })
    }, 1500)
  },

  /**
   * 构建标签数组（用于 PK 页顶部展示）
   */
  _buildTags() {
    const a = this._answers
    return [a.q01, a.q02, a.q03, a.q04, a.q05].filter(Boolean)
  }
})
