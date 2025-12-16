// Пример кода для Telegram бота (Aiogram 3.x или node-telegram-bot-api)
// Этот файл НЕ является частью Next.js проекта - это пример для отдельного бота

/*
==============================================
УСТАНОВКА (для Node.js бота):
==============================================
npm install node-telegram-bot-api

==============================================
КОД БОТА:
==============================================
*/

const TelegramBot = require("node-telegram-bot-api")

const token = "7963050390:AAGMw2gYaXMEvIhWweBzk7v5zso4xVdGy30"
const bot = new TelegramBot(token, { polling: true })

// Команда /start - показывает кнопку для открытия Mini App
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, "🐹 Добро пожаловать в Guinea Pig Clicker!\n\nНажмите кнопку ниже чтобы начать игру:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎮 Играть",
            web_app: { url: "https://my-guinea-pig-clicker.vercel.app" },
          },
        ],
        [{ text: "📊 Таблица лидеров", callback_data: "leaderboard" }],
        [{ text: "❓ Помощь", callback_data: "help" }],
      ],
    },
  })
})

// Обработка callback кнопок
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id

  if (query.data === "leaderboard") {
    bot.sendMessage(chatId, "📊 Таблица лидеров доступна в игре!")
  }

  if (query.data === "help") {
    bot.sendMessage(
      chatId,
      "❓ Помощь:\n\n" +
        "🎮 Играть - открыть игру\n" +
        "💎 Покупайте GT за Telegram Stars\n" +
        "⛏️ Покупайте майнеров для пассивного дохода\n" +
        "📊 Соревнуйтесь с другими игроками",
    )
  }

  bot.answerCallbackQuery(query.id)
})

console.log("✅ Бот запущен!")

/*
==============================================
АЛЬТЕРНАТИВНО: Python (Aiogram 3.x):
==============================================

from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.filters import Command
import asyncio

TOKEN = "7963050390:AAGMw2gYaXMEvIhWweBzk7v5zso4xVdGy30"
bot = Bot(TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: Message):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Играть",
                    web_app=WebAppInfo(url="https://my-guinea-pig-clicker.vercel.app")
                )
            ],
            [
                InlineKeyboardButton(text="📊 Таблица лидеров", callback_data="leaderboard")
            ],
            [
                InlineKeyboardButton(text="❓ Помощь", callback_data="help")
            ]
        ]
    )
    
    await message.answer(
        "🐹 Добро пожаловать в Guinea Pig Clicker!\n\n"
        "Нажмите кнопку ниже чтобы начать игру:",
        reply_markup=keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
*/
