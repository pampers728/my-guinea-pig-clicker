# Настройка Telegram Bot для Guinea Pig Tap Game

## Требования

- Node.js 18+
- Telegram Bot Token (получить у @BotFather)
- PostgreSQL или другая БД (опционально, можно использовать in-memory хранилище)

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен

## Шаг 2: Настройка платежей

1. Отправьте @BotFather команду `/mybots`
2. Выберите вашего бота
3. Выберите "Payments"
4. Выберите "Telegram Stars" в качестве провайдера
5. Подтвердите настройку

## Шаг 3: Установка зависимостей

\`\`\`bash
npm install telegraf
# или
yarn add telegraf
\`\`\`

## Шаг 4: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

\`\`\`env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_BOT_USERNAME=GuineaPigTapBot
\`\`\`

## Шаг 5: Запуск бота

Создайте файл `scripts/start-bot.ts`:

\`\`\`typescript
import { startTelegramBot } from '../lib/telegram-bot'

startTelegramBot()
\`\`\`

Запустите бота:

\`\`\`bash
npx ts-node scripts/start-bot.ts
\`\`\`

## Шаг 6: Настройка Webhook (для продакшена)

Для продакшена рекомендуется использовать webhook вместо polling:

\`\`\`typescript
// В lib/telegram-bot.ts замените bot.launch() на:
bot.launch({
  webhook: {
    domain: 'https://yourdomain.com',
    port: 3000,
  },
})
\`\`\`

## Использование

### Команды бота:

- `/start` - Начать игру
- `/balance` - Проверить баланс
- `/buy` - Купить Stars
- `/gift @username количество` - Подарить Stars другому игроку

### Покупка Stars:

1. Игрок нажимает кнопку "Buy Stars" в игре
2. Открывается Telegram бот
3. Игрок выбирает пакет Stars
4. Оплачивает через Telegram Payments (XTR)
5. Stars автоматически зачисляются на аккаунт

### Подарки:

Игроки могут дарить Stars друг другу командой:
\`\`\`
/gift @username 100
\`\`\`

## Интеграция с базой данных

Для продакшена замените in-memory хранилище на реальную БД:

\`\`\`typescript
// Пример с PostgreSQL
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getUserBalance(telegramId: number) {
  const result = await pool.query(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]
  )
  return result.rows[0]
}
\`\`\`

## Безопасность

1. Никогда не храните токен бота в коде
2. Используйте HTTPS для webhook
3. Проверяйте подпись Telegram для всех входящих запросов
4. Валидируйте все пользовательские данные

## Тестирование

Для тестирования используйте Telegram Test Environment:

\`\`\`typescript
const bot = new Telegraf(token, {
  telegram: {
    testEnv: true,
  },
})
\`\`\`

## Поддержка

Если возникли проблемы:
1. Проверьте логи бота
2. Убедитесь что токен правильный
3. Проверьте что платежи настроены в @BotFather
4. Убедитесь что webhook настроен правильно (для продакшена)
