import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type Screen = 
  | 'splash' 
  | 'menu' 
  | 'birthdate' 
  | 'goals' 
  | 'goal-detail' 
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

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedMode, setSelectedMode] = useState<'self' | 'partner' | null>(null);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'calendar' | 'today' | 'articles' | 'messages' | 'partner' | 'profile'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  setTimeout(() => {
    if (currentScreen === 'splash') {
      setCurrentScreen('menu');
    }
  }, 2500);

  const goals = [
    { id: 'pregnant' as Goal, label: 'Забеременеть', icon: 'Baby' },
    { id: 'tracking-pregnancy' as Goal, label: 'Отслеживание беременности', icon: 'Heart' },
    { id: 'track-cycle' as Goal, label: 'Отслеживать цикл', icon: 'Calendar' },
    { id: 'understand-body' as Goal, label: 'Лучше понимать своё тело', icon: 'User' },
    { id: 'discharge' as Goal, label: 'Узнать больше о выделениях', icon: 'Droplets' },
    { id: 'sex-life' as Goal, label: 'Улучшить сексуальную жизнь', icon: 'Heart' },
    { id: 'weight' as Goal, label: 'Набрать или снизить вес', icon: 'TrendingUp' },
    { id: 'contraception' as Goal, label: 'Узнать больше о контрацепции', icon: 'Shield' },
  ];

  const toggleGoal = (goalId: Goal) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const articles = [
    { title: 'Как правильно отслеживать цикл', category: 'Здоровье', time: '5 мин' },
    { title: 'Признаки овуляции', category: 'Планирование', time: '7 мин' },
    { title: 'Питание и менструальный цикл', category: 'Питание', time: '4 мин' },
  ];

  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 flex items-center justify-center">
        <h1 className="text-7xl font-light text-white tracking-wider animate-fade-in">
          Цикл
        </h1>
      </div>
    );
  }

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6 animate-scale-in">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light text-foreground">Добро пожаловать</h2>
            <p className="text-muted-foreground">Как вы планируете использовать Цикл?</p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setSelectedMode('self');
                setCurrentScreen('birthdate');
              }}
              className="w-full h-14 text-lg font-normal"
              size="lg"
            >
              Для себя
            </Button>
            <Button 
              onClick={() => {
                setSelectedMode('partner');
                setCurrentScreen('birthdate');
              }}
              className="w-full h-14 text-lg font-normal"
              variant="outline"
              size="lg"
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light">Укажите год рождения</h2>
            <p className="text-muted-foreground text-sm">Это поможет персонализировать рекомендации</p>
          </div>
          <div className="space-y-4">
            <select 
              className="w-full p-4 border rounded-xl text-lg bg-white"
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
              className="w-full h-12"
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light">Какие у вас цели?</h2>
            <p className="text-muted-foreground text-sm">Выберите одну или несколько</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map(goal => (
              <Button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                variant={selectedGoals.includes(goal.id) ? 'default' : 'outline'}
                className="h-auto py-4 px-4 justify-start text-left"
              >
                <Icon name={goal.icon} className="mr-3" size={20} />
                <span className="flex-1">{goal.label}</span>
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setCurrentScreen('main')}
            className="w-full h-12"
            disabled={selectedGoals.length === 0}
          >
            Начать
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-light">Цикл</h1>
          <Button variant="ghost" size="icon">
            <Icon name="Settings" size={20} />
          </Button>
        </div>

        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light">Календарь цикла</h2>
                <Badge variant="secondary">День 15</Badge>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border-0"
              />
              <Button className="w-full mt-4 h-12">
                Отметить месячные
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-light mb-3">Совет дня</h3>
              <p className="text-muted-foreground">
                В этот период цикла ваш организм наиболее восприимчив к физическим нагрузкам. 
                Отличное время для активных тренировок!
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-light mb-4">Мои циклы</h3>
              <div className="space-y-3">
                {[
                  { date: 'Январь 2026', days: 28, status: 'regular' },
                  { date: 'Декабрь 2025', days: 29, status: 'regular' },
                  { date: 'Ноябрь 2025', days: 27, status: 'regular' },
                ].map((cycle, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{cycle.date}</p>
                      <p className="text-sm text-muted-foreground">{cycle.days} дней</p>
                    </div>
                    <Badge variant="outline">Регулярный</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'today' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-2xl font-light mb-4">Сегодня</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="Calendar" size={28} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">День цикла: 15</p>
                    <p className="text-sm text-muted-foreground">Фаза: Фолликулярная</p>
                  </div>
                </div>
                <Button className="w-full h-12">
                  Отметить месячные
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-light mb-3">Самочувствие</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Настроение', 'Энергия', 'Сон'].map(item => (
                  <Button key={item} variant="outline" className="h-auto py-3 flex flex-col">
                    <Icon name="Circle" size={24} className="mb-2" />
                    <span className="text-xs">{item}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-light mb-4">Статьи</h2>
            {articles.map((article, idx) => (
              <Card key={idx} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                    <h3 className="font-medium mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">Время чтения: {article.time}</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-8 text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-light mb-2">Сообщения</h2>
              <p className="text-muted-foreground">У вас пока нет сообщений</p>
            </Card>
          </div>
        )}

        {activeTab === 'partner' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-light mb-4">Партнер</h2>
              <p className="text-muted-foreground mb-4">
                Пригласите партнера для совместного отслеживания цикла
              </p>
              <input 
                type="text" 
                placeholder="Введите код партнера"
                className="w-full p-3 border rounded-lg mb-3"
              />
              <Button className="w-full h-12">
                Добавить партнера
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={36} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-medium">Профиль</h2>
                  <p className="text-muted-foreground">Год рождения: {birthYear}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Уведомления', icon: 'Bell' },
                  { label: 'Цели', icon: 'Target' },
                  { label: 'Настройки', icon: 'Settings' },
                  { label: 'Помощь', icon: 'HelpCircle' },
                ].map(item => (
                  <Button 
                    key={item.label}
                    variant="ghost" 
                    className="w-full justify-start h-12"
                  >
                    <Icon name={item.icon} className="mr-3" size={20} />
                    {item.label}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex items-center justify-around max-w-7xl mx-auto px-2 py-2">
          {[
            { id: 'calendar' as const, label: 'Календарь', icon: 'Calendar' },
            { id: 'today' as const, label: 'Сегодня', icon: 'Home' },
            { id: 'articles' as const, label: 'Статьи', icon: 'BookOpen' },
            { id: 'messages' as const, label: 'Сообщения', icon: 'MessageCircle' },
            { id: 'partner' as const, label: 'Партнер', icon: 'Users' },
            { id: 'profile' as const, label: 'Профиль', icon: 'User' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={20} />
              <span className="text-xs font-light">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
