"use client"

interface ClickPattern {
  timestamp: number
  interval: number
  x?: number
  y?: number
}

interface GameSession {
  startTime: number
  clicks: ClickPattern[]
  suspicious: boolean
  warnings: string[]
}

class AntiCheatSystem {
  private session: GameSession
  private maxClicksPerSecond = 15 // Максимум кликов в секунду
  private minClickInterval = 50 // Минимальный интервал между кликами (мс)
  private suspiciousThreshold = 5 // Количество подозрительных действий для блокировки
  private devToolsCheckInterval: NodeJS.Timeout | null = null
  private isBlocked = false

  constructor() {
    this.session = {
      startTime: Date.now(),
      clicks: [],
      suspicious: false,
      warnings: []
    }
    this.startMonitoring()
  }

  // Проверка DevTools
  private checkDevTools(): boolean {
    const threshold = 160
    
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      return true
    }

    // Проверка через console
    let devtools = false
    const element = new Image()
    Object.defineProperty(element, 'id', {
      get: function() {
        devtools = true
        return 'devtools-detected'
      }
    })
    console.log(element)
    
    return devtools
  }

  // Проверка скорости кликов
  private validateClickSpeed(timestamp: number): boolean {
    const recentClicks = this.session.clicks.filter(
      click => timestamp - click.timestamp < 1000
    )
    
    if (recentClicks.length > this.maxClicksPerSecond) {
      this.addWarning('Слишком быстрые клики')
      return false
    }
    
    return true
  }

  // Проверка интервалов между кликами
  private validateClickInterval(timestamp: number): boolean {
    const lastClick = this.session.clicks[this.session.clicks.length - 1]
    
    if (lastClick && timestamp - lastClick.timestamp < this.minClickInterval) {
      this.addWarning('Подозрительно короткие интервалы')
      return false
    }
    
    return true
  }

  // Проверка паттернов кликов
  private validateClickPattern(): boolean {
    if (this.session.clicks.length < 10) return true
    
    const lastTenClicks = this.session.clicks.slice(-10)
    const intervals = lastTenClicks.slice(1).map((click, i) => 
      click.timestamp - lastTenClicks[i].timestamp
    )
    
    // Проверка на одинаковые интервалы (бот)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length
    
    if (variance < 100) { // Слишком маленькая вариация = бот
      this.addWarning('Подозрительно регулярные клики')
      return false
    }
    
    return true
  }

  // Проверка координат кликов
  private validateClickCoordinates(x?: number, y?: number): boolean {
    if (!x || !y) return true
    
    const recentClicks = this.session.clicks
      .filter(click => click.x && click.y)
      .slice(-5)
    
    if (recentClicks.length >= 3) {
      const samePosition = recentClicks.every(click => 
        Math.abs(click.x! - x) < 5 && Math.abs(click.y! - y) < 5
      )
      
      if (samePosition) {
        this.addWarning('Клики в одной точке')
        return false
      }
    }
    
    return true
  }

  // Добавление предупреждения
  private addWarning(warning: string) {
    this.session.warnings.push(warning)
    console.warn(`🛡️ AntiCheat: ${warning}`)
    
    if (this.session.warnings.length >= this.suspiciousThreshold) {
      this.blockUser()
    }
  }

  // Блокировка пользователя
  private blockUser() {
    this.isBlocked = true
    this.session.suspicious = true
    
    // Отправка данных на сервер
    this.reportSuspiciousActivity()
    
    // Показ предупреждения
    this.showCheatWarning()
  }

  // Отправка подозрительной активности на сервер
  private async reportSuspiciousActivity() {
    try {
      await fetch('/api/anticheat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: this.session,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Failed to report suspicious activity:', error)
    }
  }

  // Показ предупреждения о читерстве
  private showCheatWarning() {
    const warning = document.createElement('div')
    warning.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: #dc2626;
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          max-width: 400px;
        ">
          <h2>🛡️ Обнаружена подозрительная активность</h2>
          <p>Ваш аккаунт временно заблокирован за подозрение в использовании читов.</p>
          <p>Если это ошибка, обратитесь в поддержку.</p>
          <button onclick="location.reload()" style="
            background: white;
            color: #dc2626;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            cursor: pointer;
          ">
            Перезагрузить
          </button>
        </div>
      </div>
    `
    document.body.appendChild(warning)
  }

  // Запуск мониторинга
  private startMonitoring() {
    // Проверка DevTools каждые 2 секунды
    this.devToolsCheckInterval = setInterval(() => {
      if (this.checkDevTools()) {
        this.addWarning('Обнаружены инструменты разработчика')
      }
    }, 2000)

    // Проверка изменения размера окна
    window.addEventListener('resize', () => {
      if (this.checkDevTools()) {
        this.addWarning('Подозрительное изменение размера окна')
      }
    })

    // Проверка фокуса окна
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.addWarning('Окно потеряло фокус (возможно переключение на читы)')
      }
    })
  }

  // Валидация клика
  public validateClick(x?: number, y?: number): boolean {
    if (this.isBlocked) return false

    const timestamp = Date.now()
    
    const isValidSpeed = this.validateClickSpeed(timestamp)
    const isValidInterval = this.validateClickInterval(timestamp)
    const isValidCoordinates = this.validateClickCoordinates(x, y)
    
    // Добавляем клик в историю
    this.session.clicks.push({
      timestamp,
      interval: this.session.clicks.length > 0 
        ? timestamp - this.session.clicks[this.session.clicks.length - 1].timestamp 
        : 0,
      x,
      y
    })

    // Ограничиваем историю кликов
    if (this.session.clicks.length > 100) {
      this.session.clicks = this.session.clicks.slice(-50)
    }

    // Проверяем паттерны
    this.validateClickPattern()

    return isValidSpeed && isValidInterval && isValidCoordinates && !this.isBlocked
  }

  // Валидация прогресса игры
  public validateProgress(carrots: number, sessionTime: number): boolean {
    const maxCarrotsPerMinute = 300 // Максимум морковок в минуту
    const expectedMaxCarrots = (sessionTime / 60000) * maxCarrotsPerMinute
    
    if (carrots > expectedMaxCarrots * 2) {
      this.addWarning('Подозрительно быстрый прогресс')
      return false
    }
    
    return true
  }

  // Получение статистики сессии
  public getSessionStats() {
    return {
      duration: Date.now() - this.session.startTime,
      totalClicks: this.session.clicks.length,
      avgClicksPerSecond: this.session.clicks.length / ((Date.now() - this.session.startTime) / 1000),
      warnings: this.session.warnings.length,
      isBlocked: this.isBlocked
    }
  }

  // Очистка ресурсов
  public destroy() {
    if (this.devToolsCheckInterval) {
      clearInterval(this.devToolsCheckInterval)
    }
  }
}

export const antiCheat = new AntiCheatSystem()
