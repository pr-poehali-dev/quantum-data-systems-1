import { useState } from "react";
import Icon from "@/components/ui/icon";

const DONATE_URL = "https://functions.poehali.dev/c6729d24-870a-4841-bb9e-da82a573be63";

const PRESETS = [10, 50, 100, 500];

interface Props {
  toUserId: number;
  toName: string;
  fromUserId: number;
  onClose: () => void;
}

type Tab = "send" | "buy";

export default function DonateModal({ toUserId, toName, fromUserId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("send");
  const [voices, setVoices] = useState(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DONATE_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(fromUserId) },
        body: JSON.stringify({ to_user_id: toUserId, voices, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setSuccess(`Ты подарил ${voices} голос${voices === 1 ? "" : voices < 5 ? "а" : "ов"} пользователю ${toName}!`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DONATE_URL}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(fromUserId) },
        body: JSON.stringify({ voices }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setSuccess(`Баланс пополнен на ${voices} голос${voices < 5 ? "а" : "ов"} (${voices} ₽)!`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#2f3136] rounded-2xl w-full max-w-sm shadow-2xl border border-[#202225]">
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <h2 className="text-white font-bold text-lg">Голоса</h2>
          </div>
          <button onClick={onClose} className="text-[#8e9297] hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Курс */}
        <div className="mx-5 mb-4 px-3 py-2 rounded-lg bg-[#5865f2]/10 border border-[#5865f2]/30 flex items-center gap-2">
          <Icon name="Info" size={14} className="text-[#5865f2] flex-shrink-0" />
          <span className="text-[#b9bbbe] text-xs">1 голос = 1 рубль</span>
        </div>

        {/* Вкладки */}
        <div className="flex mx-5 mb-4 bg-[#202225] rounded-lg p-1">
          <button
            onClick={() => { setTab("send"); setSuccess(null); setError(null); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "send" ? "bg-[#5865f2] text-white" : "text-[#8e9297] hover:text-white"}`}
          >
            Подарить
          </button>
          <button
            onClick={() => { setTab("buy"); setSuccess(null); setError(null); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "buy" ? "bg-[#5865f2] text-white" : "text-[#8e9297] hover:text-white"}`}
          >
            Пополнить
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">🎉</div>
              <p className="text-white font-medium">{success}</p>
              <button onClick={onClose} className="w-full py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium transition-colors">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              {tab === "send" && (
                <p className="text-[#8e9297] text-sm">
                  Дарить голоса → <span className="text-white font-medium">{toName}</span>
                </p>
              )}

              {/* Пресеты */}
              <div>
                <p className="text-[#8e9297] text-xs mb-2">Количество голосов</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setVoices(p)}
                      className={`py-2 rounded-lg text-sm font-bold transition-colors ${voices === p ? "bg-[#5865f2] text-white" : "bg-[#202225] text-[#8e9297] hover:text-white hover:bg-[#40444b]"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Своё значение */}
              <div>
                <p className="text-[#8e9297] text-xs mb-1.5">Своё количество</p>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={voices}
                  onChange={(e) => setVoices(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#202225] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#5865f2]"
                />
                <p className="text-[#8e9297] text-xs mt-1">
                  {tab === "buy" ? `К оплате: ${voices} ₽` : `Спишется с баланса: ${voices} голос${voices < 5 ? "а" : "ов"}`}
                </p>
              </div>

              {/* Сообщение (только при отправке) */}
              {tab === "send" && (
                <div>
                  <p className="text-[#8e9297] text-xs mb-1.5">Сообщение (необязательно)</p>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="Напиши что-нибудь..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#202225] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm placeholder-[#8e9297] focus:outline-none focus:border-[#5865f2]"
                  />
                </div>
              )}

              {error && (
                <p className="text-[#ed4245] text-sm text-center">{error}</p>
              )}

              <button
                onClick={tab === "send" ? handleSend : handleBuy}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">🎙️</span>
                    {tab === "send" ? `Подарить ${voices} голос${voices < 5 ? "а" : "ов"}` : `Пополнить на ${voices} ₽`}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
