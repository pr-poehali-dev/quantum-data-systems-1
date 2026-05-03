import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const DONATE_URL = "https://functions.poehali.dev/c6729d24-870a-4841-bb9e-da82a573be63";

interface GiftItem {
  id: number;
  name: string;
  emoji: string;
  description: string;
  price_voices: number;
}

interface ReceivedGift {
  id: number;
  emoji: string;
  name: string;
  message: string;
  voices_spent: number;
  created_at: string;
  from_name: string;
}

interface WithdrawalReq {
  id: number;
  voices: number;
  amount_rub: number;
  card_number: string;
  status: string;
  created_at: string;
}

interface Props {
  toUserId: number;
  toName: string;
  fromUserId: number;
  balance: number;
  onClose: () => void;
  onBalanceChange?: (newBalance: number) => void;
}

type Tab = "send" | "received" | "withdraw";

export default function GiftsModal({ toUserId, toName, fromUserId, balance, onClose, onBalanceChange }: Props) {
  const [tab, setTab] = useState<Tab>("send");
  const [catalog, setCatalog] = useState<GiftItem[]>([]);
  const [received, setReceived] = useState<ReceivedGift[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalReq[]>([]);
  const [selected, setSelected] = useState<GiftItem | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Форма вывода
  const [withdrawVoices, setWithdrawVoices] = useState(100);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  useEffect(() => {
    loadGifts();
    if (tab === "withdraw") loadWithdrawals();
  }, [tab]);

  async function loadGifts() {
    setLoadingData(true);
    try {
      const res = await fetch(`${DONATE_URL}/gifts?user_id=${fromUserId}`);
      const data = await res.json();
      setCatalog(data.catalog || []);
      setReceived(data.received || []);
    } finally {
      setLoadingData(false);
    }
  }

  async function loadWithdrawals() {
    try {
      const res = await fetch(`${DONATE_URL}/withdrawals?user_id=${fromUserId}`);
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSendGift() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DONATE_URL}/gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(fromUserId) },
        body: JSON.stringify({ to_user_id: toUserId, gift_id: selected.id, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setSuccess(`Ты подарил ${selected.emoji} «${selected.name}» пользователю ${toName}!`);
      if (onBalanceChange) onBalanceChange(balance - selected.price_voices);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DONATE_URL}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(fromUserId) },
        body: JSON.stringify({ voices: withdrawVoices, card_number: cardNumber, card_holder: cardHolder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setSuccess(data.message || "Заявка отправлена!");
      if (onBalanceChange) onBalanceChange(balance - withdrawVoices);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  function formatCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "На рассмотрении", color: "text-yellow-400" },
    processing: { label: "Обрабатывается", color: "text-blue-400" },
    paid: { label: "Выплачено", color: "text-green-400" },
    rejected: { label: "Отклонено", color: "text-red-400" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#2f3136] rounded-2xl w-full max-w-md shadow-2xl border border-[#202225] max-h-[90vh] flex flex-col">
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Подарки</h2>
              <p className="text-[#8e9297] text-xs mt-0.5">Баланс: <span className="text-white font-medium">{balance} 🎙️</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8e9297] hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex mx-5 mb-3 bg-[#202225] rounded-lg p-1 flex-shrink-0">
          {([
            { key: "send", label: "Подарить", icon: "Gift" },
            { key: "received", label: "Полученные", icon: "Inbox" },
            { key: "withdraw", label: "Вывод", icon: "CreditCard" },
          ] as { key: Tab; label: string; icon: string }[]).map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setTab(key); setSuccess(null); setError(null); }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${tab === key ? "bg-[#5865f2] text-white" : "text-[#8e9297] hover:text-white"}`}>
              <Icon name={icon} size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-5xl">{tab === "withdraw" ? "💳" : "🎉"}</div>
              <p className="text-white font-medium">{success}</p>
              <button onClick={onClose} className="w-full py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium transition-colors">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              {/* === ПОДАРИТЬ === */}
              {tab === "send" && (
                <div className="space-y-4">
                  <p className="text-[#8e9297] text-sm">Выбери подарок для <span className="text-white font-medium">{toName}</span></p>

                  {loadingData ? (
                    <div className="flex justify-center py-8">
                      <Icon name="Loader2" size={24} className="animate-spin text-[#5865f2]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {catalog.map((gift) => (
                        <button key={gift.id} onClick={() => setSelected(gift)}
                          className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${selected?.id === gift.id ? "border-[#5865f2] bg-[#5865f2]/10" : "border-[#40444b] bg-[#202225] hover:border-[#5865f2]/50"}`}>
                          <span className="text-3xl mb-1">{gift.emoji}</span>
                          <span className="text-white text-xs font-medium truncate w-full text-center">{gift.name}</span>
                          <span className="text-[#f5a623] text-xs font-bold">{gift.price_voices} 🎙️</span>
                          {selected?.id === gift.id && (
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#5865f2] rounded-full flex items-center justify-center">
                              <Icon name="Check" size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {selected && (
                    <div className="bg-[#202225] rounded-xl p-3 border border-[#40444b] space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selected.emoji}</span>
                        <div>
                          <p className="text-white font-semibold">{selected.name}</p>
                          <p className="text-[#8e9297] text-xs">{selected.description}</p>
                          <p className="text-[#f5a623] text-xs font-bold">{selected.price_voices} голосов</p>
                        </div>
                      </div>
                      <input type="text" maxLength={80} placeholder="Добавить пожелание (необязательно)"
                        value={message} onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-[#2f3136] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm placeholder-[#8e9297] focus:outline-none focus:border-[#5865f2]" />
                    </div>
                  )}

                  {error && <p className="text-[#ed4245] text-sm text-center">{error}</p>}

                  <button onClick={handleSendGift} disabled={!selected || loading || balance < (selected?.price_voices || 0)}
                    className="w-full py-2.5 rounded-lg bg-[#f5a623] hover:bg-[#e0961e] disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                    {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : (
                      <>{selected ? `${selected.emoji} Подарить за ${selected.price_voices} 🎙️` : "Выбери подарок"}</>
                    )}
                  </button>
                </div>
              )}

              {/* === ПОЛУЧЕННЫЕ === */}
              {tab === "received" && (
                <div className="space-y-2">
                  {loadingData ? (
                    <div className="flex justify-center py-8"><Icon name="Loader2" size={24} className="animate-spin text-[#5865f2]" /></div>
                  ) : received.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-5xl mb-3">📭</div>
                      <p className="text-[#8e9297]">Подарков пока нет</p>
                      <p className="text-[#8e9297] text-xs mt-1">Поделись профилем — и кто-нибудь порадует!</p>
                    </div>
                  ) : (
                    received.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 bg-[#202225] rounded-xl p-3 border border-[#40444b]">
                        <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{g.name}</span>
                            <span className="text-[#f5a623] text-xs">· {g.voices_spent} 🎙️</span>
                          </div>
                          <p className="text-[#b9bbbe] text-xs truncate">от <span className="text-white">{g.from_name}</span>{g.message ? ` · ${g.message}` : ""}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* === ВЫВОД === */}
              {tab === "withdraw" && (
                <div className="space-y-4">
                  {/* Инфо */}
                  <div className="bg-[#202225] rounded-xl p-3 border border-[#40444b] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#b9bbbe] text-xs">
                      <Icon name="Info" size={13} className="text-[#5865f2] flex-shrink-0" />
                      <span>Минимальный вывод — 100 голосов</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#b9bbbe] text-xs">
                      <Icon name="Percent" size={13} className="text-[#f5a623] flex-shrink-0" />
                      <span>Комиссия 10% · срок выплаты 3 рабочих дня</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#b9bbbe] text-xs">
                      <Icon name="CreditCard" size={13} className="text-green-400 flex-shrink-0" />
                      <span>Только карты платёжной системы МИР</span>
                    </div>
                  </div>

                  {/* Количество */}
                  <div>
                    <p className="text-[#8e9297] text-xs mb-1.5">Количество голосов</p>
                    <input type="number" min={100} max={balance} value={withdrawVoices}
                      onChange={(e) => setWithdrawVoices(Math.max(100, Math.min(balance, parseInt(e.target.value) || 100)))}
                      className="w-full bg-[#202225] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#5865f2]" />
                    <p className="text-[#8e9297] text-xs mt-1">
                      Получишь: <span className="text-green-400 font-medium">{(withdrawVoices * 0.9).toFixed(2)} ₽</span>
                      <span className="ml-2 text-[#72767d]">Баланс: {balance} 🎙️</span>
                    </p>
                  </div>

                  {/* Номер карты */}
                  <div>
                    <p className="text-[#8e9297] text-xs mb-1.5">Номер карты МИР</p>
                    <input type="text" placeholder="2200 0000 0000 0000" maxLength={19}
                      value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      className="w-full bg-[#202225] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm placeholder-[#8e9297] focus:outline-none focus:border-[#5865f2] font-mono tracking-wider" />
                  </div>

                  {/* Держатель карты */}
                  <div>
                    <p className="text-[#8e9297] text-xs mb-1.5">Имя держателя (как на карте)</p>
                    <input type="text" placeholder="IVAN IVANOV" maxLength={50}
                      value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full bg-[#202225] border border-[#40444b] rounded-lg px-3 py-2 text-white text-sm placeholder-[#8e9297] focus:outline-none focus:border-[#5865f2] uppercase tracking-wide" />
                  </div>

                  {error && <p className="text-[#ed4245] text-sm text-center">{error}</p>}

                  <button onClick={handleWithdraw}
                    disabled={loading || balance < 100 || withdrawVoices < 100 || cardNumber.replace(/\s/g, "").length < 16 || !cardHolder}
                    className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                    {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : (
                      <><Icon name="CreditCard" size={16} />Вывести {(withdrawVoices * 0.9).toFixed(2)} ₽</>
                    )}
                  </button>

                  {/* История заявок */}
                  {withdrawals.length > 0 && (
                    <div>
                      <p className="text-[#8e9297] text-xs mb-2 font-medium">История заявок</p>
                      <div className="space-y-2">
                        {withdrawals.map((w) => (
                          <div key={w.id} className="flex items-center justify-between bg-[#202225] rounded-lg px-3 py-2 border border-[#40444b]">
                            <div>
                              <p className="text-white text-sm font-medium">{w.voices} 🎙️ → {w.amount_rub.toFixed(2)} ₽</p>
                              <p className="text-[#8e9297] text-xs">•••• {w.card_number.slice(-4)}</p>
                            </div>
                            <span className={`text-xs font-medium ${statusLabel[w.status]?.color || "text-white"}`}>
                              {statusLabel[w.status]?.label || w.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}