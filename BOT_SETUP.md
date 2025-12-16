# Настройка Telegram Bot для Guinea Pig Clicker

## 1️⃣ Переменные окружения в Vercel

Добавьте следующие переменные в Settings → Environment Variables вашего проекта на Vercel:

```
TELEGRAM_BOT_TOKEN=7963050390:AAGMw2gYaXMEvIhWweBzk7v5zso4xVdGy30
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guinea_pig_clicker
```

## 2️⃣ Настройка Webhook

После деплоя проекта на Vercel, откройте в браузере:

```
https://my-guinea-pig-clicker.vercel.app/api/bot/setup
```

Вы должны увидеть:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook successfully set"
}
```

Это настроит webhook для получения обновлений от Telegram.

## 3️⃣ Запуск бота

Создайте отдельный проект для бота (используйте `bot-example.ts` как основу):

### Node.js вариант:
```bash
npm install node-telegram-bot-api
node bot-example.js
```

### Python (Aiogram) вариант:
```bash
pip install aiogram
python bot.py
```

## 4️⃣ Проверка интеграции

1. Откройте бота в Telegram: [@GuineaPigClicker_bot](https://t.me/GuineaPigClicker_bot)
2. Отправьте команду `/start`
3. Нажмите кнопку "🎮 Играть"
4. Игра должна открыться внутри Telegram

## 5️⃣ Как работает покупка Stars

### Шаг 1: Mini App отправляет запрос
```typescript
const tg = useTelegram()
const userId = tg.user?.id

await fetch('/api/buy-stars', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, gtAmount: 10 })
})
```

### Шаг 2: Сервер отправляет invoice через Bot API
```typescript
await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendInvoice`, {
  method: 'POST',
  body: JSON.stringify({
    chat_id: userId,
    title: '10 Guinea Tokens',
    currency: 'XTR', // Telegram Stars
    prices: [{ label: '10 GT', amount: 2000000000 }] // 20 Stars
  })
})
```

### Шаг 3: Telegram открывает форму оплаты
Пользователь видит форму оплаты Stars внутри Telegram

### Шаг 4: Webhook получает successful_payment
```typescript
// /api/webhook получает:
{
  "message": {
    "successful_payment": {
      "invoice_payload": "{\"userId\":123,\"gtAmount\":10}",
      "total_amount": 2000000000
    }
  }
}
```

### Шаг 5: Сервер начисляет GT в MongoDB
```typescript
await users.updateOne(
  { telegramId: userId },
  { $inc: { guineaTokens: 10 } }
)
```

### Шаг 6: Mini App обновляет баланс
```typescript
const response = await fetch(`/api/get-balance/${userId}`)
const data = await response.json()
setGuineaTokens(data.guineaTokens)
```

## 6️⃣ Отладка

### Проверка Telegram WebApp API:
Откройте консоль в игре (F12) и проверьте:
```javascript
window.Telegram.WebApp // должен быть объект
window.Telegram.WebApp.initDataUnsafe.user // данные пользователя
```

### Проверка webhook:
```bash
curl https://my-guinea-pig-clicker.vercel.app/api/bot/info
```

### Логи сервера:
Все действия логируются с префиксом `[v0]` в консоль Vercel

## 7️⃣ Структура данных MongoDB

Коллекция `users`:
```json
{
  "_id": ObjectId("..."),
  "telegramId": "123456789",
  "username": "user123",
  "guineaTokens": 100,
  "clicks": 500,
  "miners": [...],
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

## 8️⃣ Готово!

Теперь система полностью интегрирована:
- ✅ Mini App открывается через бота
- ✅ Покупки Stars работают через Bot API
- ✅ Данные сохраняются в MongoDB
- ✅ Баланс синхронизируется автоматически
