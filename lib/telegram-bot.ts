import { Telegraf } from "telegraf"
import type { Message } from "telegraf/types"

// Заглушка для БД - в продакшене использовать реальную БД
interface UserBalance {
  telegramId: number
  username?: string
  stars: number
  carrots: number
  balanceGT: number
}

// In-memory хранилище (замените на реальную БД)
const userBalances = new Map<number, UserBalance>()

// Инициализация бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "")

// Цены на пакеты звёзд (в XTR)
const STAR_PACKAGES = [
  { stars: 50, price: 50, label: "50 Stars" },
  { stars: 100, price: 100, label: "100 Stars" },
  { stars: 500, price: 500, label: "500 Stars" },
  { stars: 1000, price: 1000, label: "1000 Stars" },
]

// Получить или создать пользователя
function getOrCreateUser(telegramId: number, username?: string): UserBalance {
  if (!userBalances.has(telegramId)) {
    userBalances.set(telegramId, {
      telegramId,
      username,
      stars: 0,
      carrots: 0,
      balanceGT: 0,
    })
  }
  return userBalances.get(telegramId)!
}

// Команда /start
bot.command("start", (ctx) => {
  const user = getOrCreateUser(ctx.from.id, ctx.from.username)
  ctx.reply(
    `🐹 Добро пожаловать в Guinea Pig Clicker!\n\n` +
      `💫 Ваш баланс Stars: ${user.stars}\n` +
      `🥕 Морковки: ${user.carrots}\n` +
      `🪙 GT: ${user.balanceGT}\n\n` +
      `Команды:\n` +
      `/buy - Купить Stars\n` +
      `/balance - Проверить баланс\n` +
      `/gift @username количество - Подарить Stars\n` +
      `/play - Играть`,
  )
})

// Команда /balance
bot.command("balance", (ctx) => {
  const user = getOrCreateUser(ctx.from.id, ctx.from.username)
  ctx.reply(
    `💰 Ваш баланс:\n` + `💫 Stars: ${user.stars}\n` + `🥕 Морковки: ${user.carrots}\n` + `🪙 GT: ${user.balanceGT}`,
  )
})

// Команда /buy - показать пакеты для покупки
bot.command("buy", (ctx) => {
  const keyboard = {
    inline_keyboard: STAR_PACKAGES.map((pkg) => [
      {
        text: `${pkg.label} - ${pkg.price} XTR`,
        callback_data: `buy_${pkg.stars}_${pkg.price}`,
      },
    ]),
  }

  ctx.reply("💫 Выберите пакет Stars:", { reply_markup: keyboard })
})

// Обработка выбора пакета
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data

  if (data?.startsWith("buy_")) {
    const [, starsStr, priceStr] = data.split("_")
    const stars = Number.parseInt(starsStr)
    const price = Number.parseInt(priceStr)

    // Отправка счёта на оплату
    await ctx.answerCbQuery()
    await ctx.replyWithInvoice({
      title: `${stars} Telegram Stars`,
      description: `Покупка ${stars} звёзд для Guinea Pig Clicker`,
      payload: JSON.stringify({
        telegramId: ctx.from.id,
        stars: stars,
      }),
      provider_token: "", // Для XTR оставляем пустым
      currency: "XTR",
      prices: [{ label: `${stars} Stars`, amount: price }],
    })
  }
})

// Обработка pre_checkout_query (обязательно!)
bot.on("pre_checkout_query", async (ctx) => {
  try {
    // Здесь можно добавить дополнительные проверки
    const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload)
    console.log("[v0] Pre-checkout query:", payload)

    // Подтверждаем платёж
    await ctx.answerPreCheckoutQuery(true)
  } catch (error) {
    console.error("[v0] Pre-checkout error:", error)
    await ctx.answerPreCheckoutQuery(false, "Ошибка обработки платежа")
  }
})

// Обработка successful_payment
bot.on("message", async (ctx) => {
  const message = ctx.message as Message.SuccessfulPaymentMessage

  if ("successful_payment" in message) {
    const payment = message.successful_payment
    const payload = JSON.parse(payment.invoice_payload)

    console.log("[v0] Successful payment:", {
      telegramId: payload.telegramId,
      stars: payload.stars,
      totalAmount: payment.total_amount,
    })

    // Зачисляем звёзды пользователю
    const user = getOrCreateUser(payload.telegramId, ctx.from.username)
    user.stars += payload.stars

    await ctx.reply(
      `✅ Оплата успешна!\n` +
        `💫 Зачислено: ${payload.stars} Stars\n` +
        `💰 Ваш баланс: ${user.stars} Stars\n\n` +
        `Спасибо за поддержку! 🐹`,
    )

    console.log("[v0] Stars credited:", {
      telegramId: payload.telegramId,
      newBalance: user.stars,
    })
  }
})

// Команда /gift - подарить Stars другому игроку
bot.command("gift", async (ctx) => {
  const args = ctx.message.text.split(" ")

  if (args.length < 3) {
    return ctx.reply(
      "❌ Неверный формат!\n" + "Используйте: /gift @username количество\n" + "Пример: /gift @friend 100",
    )
  }

  const recipientUsername = args[1].replace("@", "")
  const amount = Number.parseInt(args[2])

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Укажите корректное количество Stars")
  }

  const sender = getOrCreateUser(ctx.from.id, ctx.from.username)

  if (sender.stars < amount) {
    return ctx.reply(
      `❌ Недостаточно Stars!\n` + `💫 Ваш баланс: ${sender.stars} Stars\n` + `💫 Требуется: ${amount} Stars`,
    )
  }

  // Ищем получателя по username
  let recipient: UserBalance | undefined
  for (const user of userBalances.values()) {
    if (user.username === recipientUsername) {
      recipient = user
      break
    }
  }

  if (!recipient) {
    return ctx.reply(
      `❌ Пользователь @${recipientUsername} не найден!\n` + `Убедитесь, что он запустил бота командой /start`,
    )
  }

  // Переводим Stars
  sender.stars -= amount
  recipient.stars += amount

  await ctx.reply(
    `✅ Подарок отправлен!\n` +
      `💫 Отправлено: ${amount} Stars\n` +
      `👤 Получатель: @${recipientUsername}\n` +
      `💰 Ваш баланс: ${sender.stars} Stars`,
  )

  // Уведомляем получателя (если он в сети)
  try {
    await bot.telegram.sendMessage(
      recipient.telegramId,
      `🎁 Вы получили подарок!\n` +
        `💫 ${amount} Stars от @${ctx.from.username}\n` +
        `💰 Ваш баланс: ${recipient.stars} Stars`,
    )
  } catch (error) {
    console.log("[v0] Could not notify recipient:", error)
  }

  console.log("[v0] Gift sent:", {
    from: ctx.from.id,
    to: recipient.telegramId,
    amount: amount,
  })
})

// API для получения баланса (для интеграции с игрой)
export async function getUserBalance(telegramId: number): Promise<UserBalance> {
  return getOrCreateUser(telegramId)
}

// API для обновления баланса (для интеграции с игрой)
export async function updateUserBalance(
  telegramId: number,
  updates: Partial<Omit<UserBalance, "telegramId" | "username">>,
): Promise<UserBalance> {
  const user = getOrCreateUser(telegramId)
  Object.assign(user, updates)
  return user
}

// Запуск бота
export function startTelegramBot() {
  bot.launch()
  console.log("[v0] Telegram bot started")

  // Graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"))
  process.once("SIGTERM", () => bot.stop("SIGTERM"))
}

export default bot
