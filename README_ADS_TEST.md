# Тестирование ad-эндпоинтов

Инструкции для локального тестирования эндпоинтов рекламы, которые мы добавили:

1) Убедитесь, что ваш Next.js сервер запущен локально (обычно `http://localhost:3000`).

2) Установите в окружение (пример `.env` или экспорт в терминале):

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
AD_SESSION_SECRET=some_secret
AD_ADMIN_OVERRIDE_TOKEN=test-override
BASE_URL=http://localhost:3000
TEST_USER_ID=test-user-1
```

3) Запустить тестовый скрипт (требует Node.js):

```bash
npm install node-fetch@2 --no-save
node scripts/test-ads.js
```

4) Альтернативно, можно выполнять `curl` вручную:

- Init:

```bash
curl -X POST http://localhost:3000/api/ads/init \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user-1","reward":1}'
```

- Confirm (admin override):

```bash
curl -X POST http://localhost:3000/api/ads/confirm \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<sessionId>","sig":"<sig>","adminOverrideToken":"test-override"}'
```

- Status:

```bash
curl "http://localhost:3000/api/ads/status?sessionId=<sessionId>"
```

5) Проверяйте таблицы Supabase: `pending_invoices`, `transactions`, `players`.

Если захотите, я могу добавить SQL-миграцию для `pending_invoices` и `transactions`.
