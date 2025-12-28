export type Language = "en" | "ru" | "uk" | "kk" | "pt" | "be" | "es" | "de" | "pl" | "fr" | "zh" | "ja" | "ko" | "tr"

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Main
    "game.title": "Guinea Pig Clicker",
    "game.carrots": "Carrots",
    "game.tap": "Tap",
    "game.energy": "Energy",

    // Tabs
    "tab.main": "Main",
    "tab.miners": "Miners",
    "tab.tasks": "Tasks",
    "tab.friends": "Friends",
    "tab.shop": "Shop",
    "tab.leaderboard": "Leaderboard",

    // Shop
    "shop.buyGT": "Buy GT",
    "shop.buyForStars": "Buy for Stars",
    "shop.popular": "Popular",

    // Friends
    "friends.title": "Invite Friends",
    "friends.description": "Get 10% of your friends' earnings!",
    "friends.link": "Your referral link",
    "friends.copy": "Copy",
    "friends.share": "Share",
    "friends.count": "Friends",
    "friends.bonus": "Bonus",

    // Leaderboard
    "leaderboard.title": "Leaderboard",
    "leaderboard.top100": "Top 100 players",
    "leaderboard.daily": "Day",
    "leaderboard.weekly": "Week",
    "leaderboard.alltime": "All time",

    // Levels
    "level.current": "Level",
    "level.xp": "XP",
    "level.next": "Next level",
  },
  ru: {
    "game.title": "Морская Свинка Кликер",
    "game.carrots": "Морковки",
    "game.tap": "Тап",
    "game.energy": "Энергия",

    "tab.main": "Главная",
    "tab.miners": "Майнеры",
    "tab.tasks": "Задачи",
    "tab.friends": "Друзья",
    "tab.shop": "Магазин",
    "tab.leaderboard": "Лидеры",

    "shop.buyGT": "Купить GT",
    "shop.buyForStars": "Купить за Stars",
    "shop.popular": "Популярно",

    "friends.title": "Пригласить друзей",
    "friends.description": "Получай 10% от заработка друзей!",
    "friends.link": "Твоя реферальная ссылка",
    "friends.copy": "Копировать",
    "friends.share": "Поделиться",
    "friends.count": "Друзей",
    "friends.bonus": "Бонус",

    "leaderboard.title": "Таблица лидеров",
    "leaderboard.top100": "Топ 100 игроков",
    "leaderboard.daily": "День",
    "leaderboard.weekly": "Неделя",
    "leaderboard.alltime": "Все время",

    "level.current": "Уровень",
    "level.xp": "Опыт",
    "level.next": "Следующий уровень",
  },
  uk: {
    "game.title": "Морська Свинка Клікер",
    "game.carrots": "Морквинки",
    "game.tap": "Тап",
    "game.energy": "Енергія",

    "tab.main": "Головна",
    "tab.miners": "Майнери",
    "tab.tasks": "Завдання",
    "tab.friends": "Друзі",
    "tab.shop": "Магазин",
    "tab.leaderboard": "Лідери",

    "shop.buyGT": "Купити GT",
    "shop.buyForStars": "Купити за Stars",
    "shop.popular": "Популярно",

    "friends.title": "Запросити друзів",
    "friends.description": "Отримуй 10% від заробітку друзів!",
    "friends.link": "Твоє реферальне посилання",
    "friends.copy": "Копіювати",
    "friends.share": "Поділитися",
    "friends.count": "Друзів",
    "friends.bonus": "Бонус",

    "leaderboard.title": "Таблиця лідерів",
    "leaderboard.top100": "Топ 100 гравців",
    "leaderboard.daily": "День",
    "leaderboard.weekly": "Тиждень",
    "leaderboard.alltime": "Весь час",

    "level.current": "Рівень",
    "level.xp": "Досвід",
    "level.next": "Наступний рівень",
  },
  kk: {
    "game.title": "Теңіз шошқасы кликері",
    "game.carrots": "Сәбіз",
    "game.tap": "Шерту",
    "game.energy": "Энергия",

    "tab.main": "Басты",
    "tab.miners": "Майнерлер",
    "tab.tasks": "Тапсырмалар",
    "tab.friends": "Достар",
    "tab.shop": "Дүкен",
    "tab.leaderboard": "Көшбасшылар",
  },
  pt: {
    "game.title": "Porquinho-da-Índia Clicker",
    "game.carrots": "Cenouras",
    "game.tap": "Toque",
    "game.energy": "Energia",

    "tab.main": "Principal",
    "tab.miners": "Mineiros",
    "tab.tasks": "Tarefas",
    "tab.friends": "Amigos",
    "tab.shop": "Loja",
    "tab.leaderboard": "Classificação",
  },
  be: {
    "game.title": "Марская свінка клікер",
    "game.carrots": "Маркоўка",
    "game.tap": "Тап",
    "game.energy": "Энергія",

    "tab.main": "Галоўная",
    "tab.miners": "Майнеры",
    "tab.tasks": "Задачы",
    "tab.friends": "Сябры",
    "tab.shop": "Магазін",
    "tab.leaderboard": "Лідары",
  },
  es: {
    "game.title": "Cobaya Clicker",
    "game.carrots": "Zanahorias",
    "game.tap": "Toque",
    "game.energy": "Energía",

    "tab.main": "Principal",
    "tab.miners": "Mineros",
    "tab.tasks": "Tareas",
    "tab.friends": "Amigos",
    "tab.shop": "Tienda",
    "tab.leaderboard": "Clasificación",
  },
  de: {
    "game.title": "Meerschweinchen Clicker",
    "game.carrots": "Karotten",
    "game.tap": "Tippen",
    "game.energy": "Energie",

    "tab.main": "Haupt",
    "tab.miners": "Bergleute",
    "tab.tasks": "Aufgaben",
    "tab.friends": "Freunde",
    "tab.shop": "Geschäft",
    "tab.leaderboard": "Bestenliste",
  },
  pl: {
    "game.title": "Świnka Morska Clicker",
    "game.carrots": "Marchewki",
    "game.tap": "Stuknięcie",
    "game.energy": "Energia",

    "tab.main": "Główna",
    "tab.miners": "Górnicy",
    "tab.tasks": "Zadania",
    "tab.friends": "Przyjaciele",
    "tab.shop": "Sklep",
    "tab.leaderboard": "Ranking",
  },
  fr: {
    "game.title": "Cochon d'Inde Clicker",
    "game.carrots": "Carottes",
    "game.tap": "Toucher",
    "game.energy": "Énergie",

    "tab.main": "Principal",
    "tab.miners": "Mineurs",
    "tab.tasks": "Tâches",
    "tab.friends": "Amis",
    "tab.shop": "Magasin",
    "tab.leaderboard": "Classement",
  },
  zh: {
    "game.title": "豚鼠点击器",
    "game.carrots": "胡萝卜",
    "game.tap": "点击",
    "game.energy": "能量",

    "tab.main": "主要",
    "tab.miners": "矿工",
    "tab.tasks": "任务",
    "tab.friends": "朋友",
    "tab.shop": "商店",
    "tab.leaderboard": "排行榜",
  },
  ja: {
    "game.title": "モルモットクリッカー",
    "game.carrots": "ニンジン",
    "game.tap": "タップ",
    "game.energy": "エネルギー",

    "tab.main": "メイン",
    "tab.miners": "マイナー",
    "tab.tasks": "タスク",
    "tab.friends": "友達",
    "tab.shop": "ショップ",
    "tab.leaderboard": "リーダーボード",
  },
  ko: {
    "game.title": "기니피그 클리커",
    "game.carrots": "당근",
    "game.tap": "탭",
    "game.energy": "에너지",

    "tab.main": "메인",
    "tab.miners": "채굴자",
    "tab.tasks": "작업",
    "tab.friends": "친구",
    "tab.shop": "상점",
    "tab.leaderboard": "순위표",
  },
  tr: {
    "game.title": "Kobay Clicker",
    "game.carrots": "Havuçlar",
    "game.tap": "Dokun",
    "game.energy": "Enerji",

    "tab.main": "Ana",
    "tab.miners": "Madenciler",
    "tab.tasks": "Görevler",
    "tab.friends": "Arkadaşlar",
    "tab.shop": "Mağaza",
    "tab.leaderboard": "Sıralama",
  },
}

export function useTranslation(language: Language = "en") {
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return { t }
}
