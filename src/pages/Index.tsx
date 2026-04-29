import { useState } from "react";
import {
  Shield,
  Zap,
  Hash,
  Users,
  Mic,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  MessageCircle,
  UserPlus,
  BookOpen,
  Heart,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "friends" | "videos" | "music" | "reels">("posts");
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#36393f] text-white overflow-x-hidden">
      {/* Навигация */}
      <nav className="bg-[#2f3136] border-b border-[#202225] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5865f2] rounded-full flex items-center justify-center">
              <Icon name="MessageSquare" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Друзья</h1>
              <p className="text-xs text-[#b9bbbe] hidden sm:block">Русскоязычный мессенджер нового поколения</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="ghost" className="text-[#b9bbbe] hover:text-white hover:bg-[#40444b]">
              О проекте
            </Button>
            <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium">
              Войти бесплатно
            </Button>
          </div>
          <Button
            variant="ghost"
            className="sm:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-[#202225]">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="text-[#b9bbbe] hover:text-white hover:bg-[#40444b] justify-start">
                О проекте
              </Button>
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded text-sm font-medium">
                Войти бесплатно
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Макет в стиле Discord */}
      <div className="flex min-h-screen">
        {/* Боковая панель серверов */}
        <div className="hidden lg:flex w-[72px] bg-[#202225] flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="MessageSquare" size={24} className="text-white" />
          </div>
          <div className="w-8 h-[2px] bg-[#36393f] rounded-full"></div>
          {["🎮", "🎵", "📚", "🌍"].map((emoji, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-[#36393f] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#5865f2] text-xl"
            >
              {emoji}
            </div>
          ))}
          <div className="w-12 h-12 bg-[#3ba55c] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer mt-1">
            <Icon name="Plus" size={24} className="text-white" />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Боковая панель каналов */}
          <div className={`${mobileSidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-60 bg-[#2f3136] flex flex-col`}>
            <div className="p-4 border-b border-[#202225] flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">Сервер «Друзья»</h2>
              <Button
                variant="ghost"
                className="lg:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-2">
              {/* Текстовые каналы */}
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Текстовые каналы</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["общий", "знакомства", "новости", "мемы", "помощь"].map((channel) => (
                    <div
                      key={channel}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] cursor-pointer ${channel === "общий" ? "bg-[#393c43] text-[#dcddde]" : ""}`}
                    >
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Голосовые каналы */}
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Голосовые каналы</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["Общий голосовой", "Музыкальная комната", "Игровая", "Тихая зона"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Друзья */}
              <div>
                <div className="flex items-center gap-1 px-2 py-1 text-[#8e9297] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Личное</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {[
                    { label: "Друзья", icon: "Users" },
                    { label: "Моя страница", icon: "User" },
                    { label: "Сообщения", icon: "MessageCircle" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8e9297] hover:text-[#dcddde] hover:bg-[#393c43] cursor-pointer"
                    >
                      <Icon name={item.icon} size={16} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Область пользователя */}
            <div className="p-2 bg-[#292b2f] flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">А</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] border-2 border-[#292b2f] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Алексей</div>
                <div className="text-[#3ba55c] text-xs truncate">В сети</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#40444b]">
                  <Mic className="w-4 h-4 text-[#b9bbbe]" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#40444b]">
                  <Settings className="w-4 h-4 text-[#b9bbbe]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Область чата */}
          <div className="flex-1 flex flex-col">
            {/* Заголовок чата */}
            <div className="h-12 bg-[#36393f] border-b border-[#202225] flex items-center px-4 gap-2">
              <Button
                variant="ghost"
                className="lg:hidden text-[#8e9297] hover:text-[#dcddde] hover:bg-[#40444b] p-1 mr-2"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Hash className="w-5 h-5 text-[#8e9297]" />
              <span className="text-white font-semibold">общий</span>
              <div className="w-px h-6 bg-[#40444b] mx-2 hidden sm:block"></div>
              <span className="text-[#8e9297] text-sm hidden sm:block">Добро пожаловать в Говорилку — общайся, дружи, делись!</span>
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#b9bbbe] cursor-pointer hover:text-[#dcddde]" />
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#b9bbbe] cursor-pointer hover:text-[#dcddde]" />
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#b9bbbe] cursor-pointer hover:text-[#dcddde]" />
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">

              {/* Системное приветствие */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5865f2] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageSquare" size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Друзья</span>
                    <span className="bg-[#5865f2] text-white text-xs px-1 rounded">СИСТЕМА</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 10:00</span>
                  </div>
                  <div className="text-[#dcddde] text-sm sm:text-base">
                    <p className="mb-3 sm:mb-4">
                      <strong>Добро пожаловать в Говорилку!</strong> Здесь вы можете общаться в текстовых и голосовых каналах, добавлять друзей и делиться публикациями на своей странице.
                    </p>
                    <div className="bg-[#2f3136] border-l-4 border-[#5865f2] p-3 sm:p-4 rounded">
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Что умеет Друзья:</h3>
                      <ul className="space-y-1 text-xs sm:text-sm text-[#b9bbbe]">
                        <li>💬 Текстовые каналы для общения по темам</li>
                        <li>🎙️ Голосовые каналы — разговаривайте голосом</li>
                        <li>👥 Система друзей — добавляйте и находите людей</li>
                        <li>📝 Личная страница с публикациями и историями</li>
                        <li>🔔 Уведомления от друзей и каналов</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Демо: профиль пользователя с публикациями */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">К</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Катя_Москва</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 11:30</span>
                  </div>
                  <div className="text-[#dcddde] mb-3 text-sm sm:text-base">
                    Всем привет! Опубликовала новый пост на своей странице 📸
                  </div>

                  {/* Демо: Личная страница пользователя */}
                  <div className="bg-[#2f3136] border border-[#202225] rounded-lg overflow-hidden w-full max-w-sm">
                    {/* Шапка профиля */}
                    <div className="h-16 sm:h-20 bg-gradient-to-r from-[#5865f2] to-[#ec4899] relative">
                      <div className="absolute -bottom-3 sm:-bottom-4 left-3 sm:left-4">
                        <div className="relative">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#2f3136] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">К</span>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#3ba55c] border-2 border-[#2f3136] rounded-full"></div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Добавить</span>
                      </Button>
                    </div>

                    {/* Информация профиля */}
                    <div className="pt-6 sm:pt-8 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="mb-3">
                        <h3 className="text-white text-base sm:text-lg font-bold">Катя Соколова</h3>
                        <div className="text-[#b9bbbe] text-xs sm:text-sm">@katya_moskva · В сети</div>
                        <div className="text-[#dcddde] text-xs sm:text-sm mt-1">Люблю путешествия и фотографию 🌍✨</div>
                      </div>

                      {/* Статистика */}
                      <div className="flex gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                        <div className="text-center">
                          <div className="text-white font-bold">248</div>
                          <div className="text-[#8e9297]">Друзей</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">92</div>
                          <div className="text-[#8e9297]">Постов</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">1.2к</div>
                          <div className="text-[#8e9297]">Лайков</div>
                        </div>
                      </div>

                      {/* Вкладки */}
                      <div className="flex border-b border-[#40444b] mb-3">
                        <button
                          onClick={() => setActiveTab("posts")}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium ${activeTab === "posts" ? "text-white border-b-2 border-[#5865f2]" : "text-[#8e9297] hover:text-[#dcddde]"}`}
                        >
                          Публикации
                        </button>
                        <button
                          onClick={() => setActiveTab("videos")}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 ${activeTab === "videos" ? "text-white border-b-2 border-[#5865f2]" : "text-[#8e9297] hover:text-[#dcddde]"}`}
                        >
                          <Icon name="Video" size={12} />
                          Видео
                        </button>
                        <button
                          onClick={() => setActiveTab("music")}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 ${activeTab === "music" ? "text-white border-b-2 border-[#5865f2]" : "text-[#8e9297] hover:text-[#dcddde]"}`}
                        >
                          <Icon name="Music" size={12} />
                          Музыка
                        </button>
                        <button
                          onClick={() => setActiveTab("reels")}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 ${activeTab === "reels" ? "text-white border-b-2 border-[#5865f2]" : "text-[#8e9297] hover:text-[#dcddde]"}`}
                        >
                          <Icon name="Clapperboard" size={12} />
                          Рилсы
                        </button>
                        <button
                          onClick={() => setActiveTab("friends")}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium ${activeTab === "friends" ? "text-white border-b-2 border-[#5865f2]" : "text-[#8e9297] hover:text-[#dcddde]"}`}
                        >
                          Друзья
                        </button>
                      </div>

                      {/* Содержимое вкладок */}
                      {activeTab === "posts" && (
                        <div className="space-y-2">
                          {[
                            { text: "Сегодня побывала в Питере — невероятно красиво! 🌉", likes: 34, time: "2 ч назад" },
                            { text: "Новый рецепт борща — просто объедение 🍲❤️", likes: 57, time: "Вчера" },
                          ].map((post, i) => (
                            <div key={i} className="bg-[#36393f] rounded-lg p-2 sm:p-3">
                              <p className="text-[#dcddde] text-xs sm:text-sm mb-2">{post.text}</p>
                              <div className="flex items-center gap-3 text-[#8e9297] text-xs">
                                <button className="flex items-center gap-1 hover:text-[#ed4245]">
                                  <Heart className="w-3 h-3" />
                                  <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-[#5865f2]">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>Ответить</span>
                                </button>
                                <span className="ml-auto">{post.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "videos" && (
                        <div className="space-y-2">
                          {/* Кнопка загрузки */}
                          <button className="w-full border-2 border-dashed border-[#40444b] hover:border-[#5865f2] rounded-lg p-3 flex flex-col items-center gap-1 transition-colors group">
                            <Icon name="Upload" size={20} className="text-[#8e9297] group-hover:text-[#5865f2]" />
                            <span className="text-[#8e9297] group-hover:text-[#5865f2] text-xs font-medium">Загрузить видео</span>
                          </button>
                          {/* Демо-видео */}
                          {[
                            { title: "Закат в Санкт-Петербурге", views: 1240, duration: "1:23", time: "3 дня назад" },
                            { title: "Мой утренний влог ☕", views: 856, duration: "4:07", time: "Неделю назад" },
                          ].map((video, i) => (
                            <div key={i} className="bg-[#36393f] rounded-lg overflow-hidden flex gap-2">
                              <div className="w-20 h-14 bg-gradient-to-br from-[#5865f2] to-[#7c3aed] flex items-center justify-center flex-shrink-0 relative">
                                <Icon name="Play" size={20} className="text-white" />
                                <span className="absolute bottom-1 right-1 text-white text-xs bg-black/50 px-1 rounded">{video.duration}</span>
                              </div>
                              <div className="flex-1 py-2 pr-2 min-w-0">
                                <div className="text-white text-xs font-medium truncate">{video.title}</div>
                                <div className="text-[#8e9297] text-xs mt-0.5 flex items-center gap-2">
                                  <span className="flex items-center gap-1"><Icon name="Eye" size={10} />{video.views}</span>
                                  <span>{video.time}</span>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <button className="flex items-center gap-1 text-[#8e9297] hover:text-[#ed4245] text-xs">
                                    <Heart className="w-3 h-3" />
                                  </button>
                                  <button className="flex items-center gap-1 text-[#8e9297] hover:text-[#5865f2] text-xs">
                                    <MessageCircle className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "music" && (
                        <div className="space-y-2">
                          {/* Кнопка загрузки трека */}
                          <button className="w-full border-2 border-dashed border-[#40444b] hover:border-[#5865f2] rounded-lg p-3 flex flex-col items-center gap-1 transition-colors group">
                            <Icon name="Upload" size={20} className="text-[#8e9297] group-hover:text-[#5865f2]" />
                            <span className="text-[#8e9297] group-hover:text-[#5865f2] text-xs font-medium">Загрузить трек</span>
                          </button>

                          {/* Мини-плеер активного трека */}
                          {playingId !== null && (
                            <div className="bg-gradient-to-r from-[#5865f2]/20 to-[#7c3aed]/20 border border-[#5865f2]/40 rounded-lg p-2 flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#5865f2] to-[#7c3aed] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="Music2" size={14} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-xs font-medium truncate">
                                  {playingId === 1 ? "Белые ночи" : "Летний вечер"}
                                </div>
                                <div className="w-full bg-[#40444b] rounded-full h-1 mt-1">
                                  <div className="bg-[#5865f2] h-1 rounded-full w-2/5 animate-pulse"></div>
                                </div>
                              </div>
                              <button onClick={() => setPlayingId(null)} className="text-[#8e9297] hover:text-white">
                                <Icon name="Square" size={14} />
                              </button>
                            </div>
                          )}

                          {/* Список треков */}
                          {[
                            { id: 1, title: "Белые ночи", artist: "Катя Соколова", duration: "3:42", plays: 2140, genre: "Инди" },
                            { id: 2, title: "Летний вечер", artist: "Катя Соколова", duration: "4:15", plays: 987, genre: "Лаунж" },
                            { id: 3, title: "Дождь в городе", artist: "Катя Соколова", duration: "2:58", plays: 543, genre: "Поп" },
                          ].map((track) => (
                            <div
                              key={track.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${playingId === track.id ? "bg-[#5865f2]/20 border border-[#5865f2]/30" : "bg-[#36393f] hover:bg-[#393c43]"}`}
                            >
                              {/* Обложка / кнопка play */}
                              <button
                                onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${playingId === track.id ? "bg-[#5865f2]" : "bg-gradient-to-br from-[#5865f2] to-[#7c3aed]"}`}
                              >
                                <Icon name={playingId === track.id ? "Pause" : "Play"} size={14} className="text-white" />
                              </button>

                              {/* Название */}
                              <div className="flex-1 min-w-0">
                                <div className={`text-xs font-medium truncate ${playingId === track.id ? "text-[#5865f2]" : "text-white"}`}>{track.title}</div>
                                <div className="text-[#8e9297] text-xs flex items-center gap-2">
                                  <span>{track.artist}</span>
                                  <span className="bg-[#40444b] px-1 rounded text-[10px]">{track.genre}</span>
                                </div>
                              </div>

                              {/* Прослушивания + длительность */}
                              <div className="text-right flex-shrink-0">
                                <div className="text-[#8e9297] text-xs flex items-center gap-1 justify-end">
                                  <Icon name="Headphones" size={10} />
                                  <span>{track.plays.toLocaleString("ru")}</span>
                                </div>
                                <div className="text-[#8e9297] text-xs">{track.duration}</div>
                              </div>

                              {/* Лайк */}
                              <button className="text-[#8e9297] hover:text-[#ed4245] ml-1">
                                <Heart className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "reels" && (
                        <div className="space-y-2">
                          {/* Загрузить рилс */}
                          <button className="w-full border-2 border-dashed border-[#40444b] hover:border-[#ed4245] rounded-lg p-3 flex flex-col items-center gap-1 transition-colors group">
                            <Icon name="Clapperboard" size={20} className="text-[#8e9297] group-hover:text-[#ed4245]" />
                            <span className="text-[#8e9297] group-hover:text-[#ed4245] text-xs font-medium">Снять рилс</span>
                          </button>

                          {/* Сетка рилсов */}
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 1, caption: "Питер за 60 секунд ⚡", views: 14200, duration: "0:58", gradient: "from-pink-500 to-rose-600", emoji: "🌉" },
                              { id: 2, caption: "Рецепт кофе утром ☕", views: 8900, duration: "0:45", gradient: "from-orange-500 to-amber-600", emoji: "☕" },
                              { id: 3, caption: "Танцы под дождём 💃", views: 22100, duration: "0:30", gradient: "from-purple-500 to-violet-600", emoji: "💃" },
                              { id: 4, caption: "Закат с крыши 🌅", views: 5400, duration: "1:00", gradient: "from-blue-500 to-cyan-600", emoji: "🌅" },
                            ].map((reel) => (
                              <div key={reel.id} className="relative rounded-lg overflow-hidden cursor-pointer group aspect-[9/16] max-h-44">
                                {/* Обложка */}
                                <div className={`w-full h-full bg-gradient-to-br ${reel.gradient} flex items-center justify-center text-4xl`}>
                                  {reel.emoji}
                                </div>
                                {/* Оверлей */}
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Icon name="Play" size={18} className="text-white ml-0.5" />
                                  </div>
                                </div>
                                {/* Длительность */}
                                <span className="absolute top-1.5 right-1.5 text-white text-xs bg-black/50 px-1 rounded">{reel.duration}</span>
                                {/* Просмотры снизу */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                  <p className="text-white text-xs font-medium truncate">{reel.caption}</p>
                                  <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                                    <Icon name="Eye" size={10} />
                                    <span>{(reel.views / 1000).toFixed(1)}к</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "friends" && (
                        <div className="space-y-2">
                          {[
                            { name: "Игорь_SPB", status: "В сети", avatar: "И", color: "from-blue-500 to-cyan-500" },
                            { name: "Оля Новикова", status: "Не беспокоить", avatar: "О", color: "from-green-500 to-teal-500" },
                            { name: "Макс_Геймер", status: "В сети", avatar: "М", color: "from-orange-500 to-red-500" },
                          ].map((friend, i) => (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded hover:bg-[#36393f] cursor-pointer">
                              <div className={`w-7 h-7 bg-gradient-to-r ${friend.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-xs font-medium">{friend.avatar}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-xs font-medium truncate">{friend.name}</div>
                                <div className={`text-xs truncate ${friend.status === "В сети" ? "text-[#3ba55c]" : "text-[#faa61a]"}`}>{friend.status}</div>
                              </div>
                              <Button size="sm" className="text-xs bg-[#5865f2] hover:bg-[#4752c4] text-white px-2 py-0.5 h-auto rounded">
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Сообщение о голосовом канале */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">И</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Игорь_SPB</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:15</span>
                  </div>
                  <div className="text-[#dcddde] mb-2 text-sm sm:text-base">
                    Кто идёт в голосовой? Жду в «Общем голосовом» 🎙️
                  </div>
                  <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-3 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-[#3ba55c]" />
                      <span className="text-white text-sm font-semibold">Общий голосовой</span>
                      <span className="text-[#3ba55c] text-xs">● 3 участника</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { avatar: "И", color: "from-blue-500 to-cyan-500" },
                        { avatar: "К", color: "from-purple-500 to-pink-500" },
                        { avatar: "М", color: "from-orange-500 to-red-500" },
                      ].map((u, i) => (
                        <div key={i} className={`w-7 h-7 bg-gradient-to-r ${u.color} rounded-full flex items-center justify-center`}>
                          <span className="text-white text-xs font-medium">{u.avatar}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="mt-2 bg-[#3ba55c] hover:bg-[#2d7d46] text-white text-xs px-3 py-1 rounded w-full">
                      Присоединиться
                    </Button>
                  </div>
                </div>
              </div>

              {/* Секция возможностей */}
              <div className="bg-[#2f3136] rounded-xl p-4 sm:p-6 border border-[#202225]">
                <h2 className="text-white text-lg sm:text-xl font-bold mb-1">Друзья — общение без границ</h2>
                <p className="text-[#b9bbbe] text-sm mb-4 sm:mb-6">
                  Русскоязычный мессенджер с голосовыми и текстовыми каналами, системой друзей и личными страницами
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    {
                      icon: <Hash className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Текстовые каналы",
                      desc: "Общайтесь по темам в удобных каналах",
                    },
                    {
                      icon: <Mic className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Голосовые каналы",
                      desc: "Разговаривайте вживую с друзьями",
                    },
                    {
                      icon: <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Система друзей",
                      desc: "Добавляйте друг друга и общайтесь напрямую",
                    },
                    {
                      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Личная страница",
                      desc: "Публикуйте посты, делитесь жизнью",
                    },
                    {
                      icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Фото и медиа",
                      desc: "Отправляйте фото, видео и файлы",
                    },
                    {
                      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Безопасность",
                      desc: "Ваши данные под надёжной защитой",
                    },
                    {
                      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Быстро и стабильно",
                      desc: "Мгновенная доставка сообщений",
                    },
                    {
                      icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
                      title: "Личные сообщения",
                      desc: "Пишите напрямую любому пользователю",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded hover:bg-[#36393f] transition-colors"
                    >
                      <div className="text-[#5865f2] mt-0.5">{feature.icon}</div>
                      <div>
                        <div className="text-white font-medium text-xs sm:text-sm">{feature.title}</div>
                        <div className="text-[#b9bbbe] text-xs sm:text-sm">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-medium flex-1">
                    Начать общаться бесплатно
                  </Button>
                  <Button variant="outline" className="border-[#40444b] text-[#dcddde] hover:bg-[#40444b] px-6 py-2 rounded font-medium flex-1">
                    Узнать больше
                  </Button>
                </div>
              </div>
            </div>

            {/* Поле ввода */}
            <div className="p-2 sm:p-4">
              <div className="bg-[#40444b] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                <span className="text-[#72767d] text-xs sm:text-sm flex-1">Написать в #общий</span>
                <div className="flex gap-2 text-[#b9bbbe]">
                  <Image className="w-4 h-4 cursor-pointer hover:text-white" />
                  <MessageCircle className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель участников */}
          <div className="hidden xl:block w-60 bg-[#2f3136] p-4">
            <div className="mb-4">
              <h3 className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide mb-2">В сети — 5</h3>
              <div className="space-y-2">
                {[
                  { name: "Катя_Москва", status: "Пишет пост...", avatar: "К", color: "from-purple-500 to-pink-500" },
                  { name: "Игорь_SPB", status: "В голосовом", avatar: "И", color: "from-blue-500 to-cyan-500" },
                  { name: "Оля Новикова", status: "В сети", avatar: "О", color: "from-green-500 to-teal-500" },
                  { name: "Макс_Геймер", status: "В сети", avatar: "М", color: "from-orange-500 to-red-500" },
                  { name: "Алексей", status: "В сети", avatar: "А", color: "from-blue-500 to-purple-500" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-[#36393f] cursor-pointer group">
                    <div className={`w-8 h-8 bg-gradient-to-r ${user.color} rounded-full flex items-center justify-center relative flex-shrink-0`}>
                      <span className="text-white text-sm font-medium">{user.avatar}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] border-2 border-[#2f3136] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{user.name}</div>
                      <div className="text-[#b9bbbe] text-xs truncate">{user.status}</div>
                    </div>
                    <Button size="sm" className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0 bg-[#5865f2] hover:bg-[#4752c4] rounded transition-opacity">
                      <UserPlus className="w-3 h-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Не в сети */}
            <div>
              <h3 className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide mb-2">Не в сети — 12</h3>
              <div className="space-y-2">
                {[
                  { name: "Настя_Краснодар", avatar: "Н", color: "from-pink-400 to-rose-400" },
                  { name: "Дима Уфа", avatar: "Д", color: "from-yellow-500 to-orange-500" },
                  { name: "Вика_Новосиб", avatar: "В", color: "from-cyan-500 to-blue-500" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-[#36393f] cursor-pointer opacity-50">
                    <div className={`w-8 h-8 bg-gradient-to-r ${user.color} rounded-full flex items-center justify-center relative flex-shrink-0`}>
                      <span className="text-white text-sm font-medium">{user.avatar}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#72767d] border-2 border-[#2f3136] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#8e9297] text-sm font-medium truncate">{user.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;