import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

type Screen = 
  | 'splash' 
  | 'menu' 
  | 'birthdate' 
  | 'goals' 
  | 'main';

type Goal = 
  | 'pregnant'
  | 'tracking-pregnancy'
  | 'track-cycle'
  | 'understand-body'
  | 'discharge'
  | 'sex-life'
  | 'weight'
  | 'contraception';

const API_URL = 'https://functions.poehali.dev/36022ce5-0fc6-4195-865d-b7e45dfdbb8f';

const Index = () => {
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedMode, setSelectedMode] = useState<'self' | 'partner' | null>(null);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'today' | 'articles' | 'messages' | 'partner' | 'profile'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [userId, setUserId] = useState<number | null>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [currentMood, setCurrentMood] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 'splash') {
        setCurrentScreen('menu');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentScreen]);

  useEffect(() => {
    if (userId) {
      loadCycles();
    }
  }, [userId]);

  useEffect(() => {
    if (currentScreen === 'main') {
      loadArticles();
    }
  }, [currentScreen]);

  const goals = [
    { id: 'pregnant' as Goal, label: 'Забеременеть', icon: 'Baby' },
    { id: 'tracking-pregnancy' as Goal, label: 'Отслеживание', icon: 'Heart' },
    { id: 'track-cycle' as Goal, label: 'Отслеживать цикл', icon: 'Calendar' },
    { id: 'understand-body' as Goal, label: 'Понимать тело', icon: 'User' },
    { id: 'discharge' as Goal, label: 'О выделениях', icon: 'Droplets' },
    { id: 'sex-life' as Goal, label: 'Секс жизнь', icon: 'Heart' },
    { id: 'weight' as Goal, label: 'Вес', icon: 'TrendingUp' },
    { id: 'contraception' as Goal, label: 'Контрацепция', icon: 'Shield' },
  ];

  const toggleGoal = (goalId: Goal) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const createUser = async () => {
    try {
      const response = await fetch(`${API_URL}?action=create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_year: birthYear,
          usage_mode: selectedMode,
          goals: selectedGoals
        })
      });
      const data = await response.json();
      setUserId(data.user_id);
      localStorage.setItem('cycle_user_id', data.user_id.toString());
      setCurrentScreen('main');
      toast({ title: 'Профиль создан!', description: 'Начинаем отслеживание цикла' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать профиль', variant: 'destructive' });
    }
  };

  const loadCycles = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}?action=get_cycles&user_id=${userId}`);
      const data = await response.json();
      setCycles(data);
    } catch (error) {
      console.error('Failed to load cycles', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await fetch(`${API_URL}?action=get_articles`);
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles', error);
    }
  };

  const addCycle = async () => {
    if (!userId || !selectedDate) return;
    try {
      await fetch(`${API_URL}?action=add_cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          start_date: selectedDate.toISOString().split('T')[0]
        })
      });
      loadCycles();
      toast({ title: 'Добавлено!', description: 'Месячные отмечены в календаре' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить данные', variant: 'destructive' });
    }
  };

  const saveDailyNote = async (type: 'mood' | 'energy' | 'sleep', value: string) => {
    if (!userId) return;
    try {
      const noteData: any = { user_id: userId, note_date: new Date().toISOString().split('T')[0] };
      noteData[type === 'mood' ? 'mood' : type === 'energy' ? 'energy_level' : 'sleep_quality'] = value;
      
      await fetch(`${API_URL}?action=save_daily_note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (type === 'mood') setCurrentMood(value);
      toast({ title: 'Сохранено!', description: `${type === 'mood' ? 'Настроение' : type === 'energy' ? 'Энергия' : 'Сон'} отмечено` });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 flex items-center justify-center">
        <h1 className="text-6xl sm:text-7xl font-light text-white tracking-wider animate-fade-in">
          Цикл
        </h1>
      </div>
    );
  }

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 animate-scale-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-light">Добро пожаловать</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Как планируете использовать?</p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setSelectedMode('self');
                setCurrentScreen('birthdate');
              }}
              className="w-full h-12 sm:h-14 text-base sm:text-lg"
            >
              Для себя
            </Button>
            <Button 
              onClick={() => {
                setSelectedMode('partner');
                setCurrentScreen('birthdate');
              }}
              className="w-full h-12 sm:h-14 text-base sm:text-lg"
              variant="outline"
            >
              С партнером
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentScreen === 'birthdate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-light">Год рождения</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Для персонализации</p>
          </div>
          <div className="space-y-4">
            <select 
              className="w-full p-3 sm:p-4 border rounded-xl text-base sm:text-lg bg-white"
              value={birthYear || ''}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            >
              <option value="">Выберите год</option>
              {Array.from({ length: 50 }, (_, i) => 2010 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button 
              onClick={() => setCurrentScreen('goals')}
              className="w-full h-11 sm:h-12"
              disabled={!birthYear}
            >
              Далее
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentScreen === 'goals') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 sm:p-8 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-light">Ваши цели?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Выберите одну или несколько</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {goals.map(goal => (
              <Button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                variant={selectedGoals.includes(goal.id) ? 'default' : 'outline'}
                className="h-auto py-3 sm:py-4 px-3 sm:px-4 justify-start text-left text-xs sm:text-sm"
              >
                <Icon name={goal.icon} className="mr-2 flex-shrink-0" size={18} />
                <span className="flex-1 leading-tight">{goal.label}</span>
              </Button>
            ))}
          </div>
          <Button 
            onClick={createUser}
            className="w-full h-11 sm:h-12"
            disabled={selectedGoals.length === 0}
          >
            Начать
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-light">Цикл</h1>
          <Button variant="ghost" size="icon">
            <Icon name="Settings" size={20} />
          </Button>
        </div>

        {activeTab === 'calendar' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-light">Календарь</h2>
                <Badge variant="secondary" className="text-xs sm:text-sm">День 15</Badge>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border-0 mx-auto"
              />
              <Button onClick={addCycle} className="w-full mt-4 h-11 sm:h-12 text-sm sm:text-base">
                Отметить месячные
              </Button>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-light mb-3">Совет дня</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ваш организм сейчас наиболее восприимчив к физическим нагрузкам. 
                Отличное время для активных тренировок!
              </p>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-light mb-4">Мои циклы</h3>
              <div className="space-y-2 sm:space-y-3">
                {cycles.length > 0 ? cycles.map((cycle, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm sm:text-base font-medium">{new Date(cycle.start_date).toLocaleDateString('ru')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{cycle.cycle_length || 28} дней</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Регулярный</Badge>
                  </div>
                )) : (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    Отметьте первый день цикла
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'today' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Card className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-light mb-4">Сегодня</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Calendar" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium">День цикла: 15</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Фолликулярная фаза</p>
                  </div>
                </div>
                <Button onClick={addCycle} className="w-full h-11 sm:h-12 text-sm sm:text-base">
                  Отметить месячные
                </Button>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-light mb-3">Самочувствие</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Настроение', icon: 'Smile', type: 'mood' },
                  { label: 'Энергия', icon: 'Zap', type: 'energy' },
                  { label: 'Сон', icon: 'Moon', type: 'sleep' }
                ].map(item => (
                  <Button 
                    key={item.label} 
                    onClick={() => saveDailyNote(item.type as any, 'good')}
                    variant="outline" 
                    className="h-auto py-3 sm:py-4 flex flex-col gap-1 sm:gap-2"
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="text-xs leading-tight">{item.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-light mb-4">Статьи</h2>
            {(articles.length > 0 ? articles : [
              { title: 'Как правильно отслеживать цикл', category: 'Здоровье', reading_time: '5 мин' },
              { title: 'Признаки овуляции', category: 'Планирование', reading_time: '7 мин' },
              { title: 'Питание и цикл', category: 'Питание', reading_time: '4 мин' }
            ]).map((article, idx) => (
              <Card key={idx} className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="mb-2 text-xs">{article.category}</Badge>
                    <h3 className="text-sm sm:text-base font-medium mb-1 leading-tight">{article.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Время: {article.reading_time || article.time}
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6 sm:p-8 text-center">
              <Icon name="MessageCircle" size={40} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg sm:text-xl font-light mb-2">Сообщения</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Пока нет сообщений</p>
            </Card>
          </div>
        )}

        {activeTab === 'partner' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-light mb-3 sm:mb-4">Партнер</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Пригласите партнера для совместного отслеживания
              </p>
              <input 
                type="text" 
                placeholder="Код партнера"
                className="w-full p-3 border rounded-lg mb-3 text-sm sm:text-base"
              />
              <Button className="w-full h-11 sm:h-12 text-sm sm:text-base">
                Добавить партнера
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={32} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-medium">Профиль</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Год: {birthYear}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Уведомления', icon: 'Bell' },
                  { label: 'Цели', icon: 'Target' },
                  { label: 'Настройки', icon: 'Settings' },
                  { label: 'Помощь', icon: 'HelpCircle' },
                ].map(item => (
                  <Button 
                    key={item.label}
                    variant="ghost" 
                    className="w-full justify-start h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <Icon name={item.icon} className="mr-3" size={18} />
                    {item.label}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="flex items-center justify-around max-w-7xl mx-auto px-1 py-2">
          {[
            { id: 'calendar' as const, label: 'Календарь', icon: 'Calendar' },
            { id: 'today' as const, label: 'Сегодня', icon: 'Home' },
            { id: 'articles' as const, label: 'Статьи', icon: 'BookOpen' },
            { id: 'messages' as const, label: 'Чат', icon: 'MessageCircle' },
            { id: 'partner' as const, label: 'Партнер', icon: 'Users' },
            { id: 'profile' as const, label: 'Профиль', icon: 'User' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 sm:px-2 rounded-lg transition-colors min-w-0 ${
                activeTab === tab.id 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground'
              }`}
            >
              <Icon name={tab.icon} size={20} className="flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-light leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
