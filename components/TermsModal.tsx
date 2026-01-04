"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface TermsModalProps {
  open: boolean
  onAccept: () => void
}

export function TermsModal({ open, onAccept }: TermsModalProps) {
  const [agreed, setAgreed] = useState(false)

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-black/95 backdrop-blur-md border-purple-500/30 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Пользовательское соглашение Guinea Pig Clicker
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 space-y-4 text-sm">
          <p className="text-gray-400">Дата последнего обновления: 04.01.2026</p>

          <section>
            <h3 className="font-bold text-lg mb-2">1. Общие положения</h3>
            <p className="text-gray-300">
              1.1. Guinea Pig Clicker (далее — «Игра») является собственностью разработчика [baragoz_08].
            </p>
            <p className="text-gray-300">1.2. Контактная информация разработчика: guaneapigclicker@gmail.com</p>
            <p className="text-gray-300">
              1.3. Используя Игру, пользователь подтверждает, что ознакомлен и согласен с условиями настоящего
              соглашения.
            </p>
            <p className="text-gray-300">1.4. Минимальный возраст для использования Игры — 13 лет.</p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. Условия использования</h3>
            <p className="text-gray-300">
              2.1. Пользователь обязуется использовать Игру честно, без вмешательства в код или сервер.
            </p>
            <p className="text-gray-300">
              2.2. Любое использование читов, сторонних скриптов, ботов, эмуляторов или других средств обхода правил
              строго запрещено.
            </p>
            <p className="text-gray-300">
              2.3. Пользователь несет ответственность за свои действия в игре и сохранность аккаунта (Telegram ID).
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. Внутренняя валюта (Stars / XTR) и покупки</h3>
            <p className="text-gray-300">
              3.1. Stars (XTR) — внутренняя валюта Игры для апгрейдов и внутриигровых действий.
            </p>
            <p className="text-gray-300">
              3.2. Покупка stars осуществляется только через Telegram Payments (Stars) через бота.
            </p>
            <p className="text-gray-300">
              3.3. Stars привязаны к Telegram ID пользователя и не могут быть переданы другим игрокам.
            </p>
            <p className="text-gray-300">
              3.4. Возврат stars не производится, кроме случаев технической ошибки со стороны разработчика.
            </p>
            <p className="text-gray-300">
              3.5. Стоимость stars фиксирована в Telegram Stars и не изменяется после покупки.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">4. Обработка персональных данных</h3>
            <p className="text-gray-300">
              4.1. Игра собирает и хранит следующие данные: Telegram ID, имя пользователя, баланс stars, согласие с
              пользовательским соглашением.
            </p>
            <p className="text-gray-300">
              4.2. Данные используются исключительно для работы Игры, начисления stars, аналитики и статистики.
            </p>
            <p className="text-gray-300">
              4.3. Данные не передаются третьим лицам, кроме Telegram для обработки платежей.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">5. Блокировки и обход блокировок</h3>
            <p className="text-gray-300">5.1. Блокировка осуществляется по Telegram ID.</p>
            <p className="text-gray-300">
              5.2. В случае нарушения условий соглашения разработчик вправе ограничить или полностью заблокировать
              доступ пользователя.
            </p>
            <p className="text-gray-300">
              5.3. Любые попытки обхода блокировки считаются повторным нарушением и могут повлечь перманентную
              блокировку.
            </p>
          </section>
        </div>

        <div className="border-t border-purple-500/30 pt-4 space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
              Я прочитал и согласен с пользовательским соглашением Guinea Pig Clicker
            </label>
          </div>
          <Button
            onClick={onAccept}
            disabled={!agreed}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            Принять и продолжить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
