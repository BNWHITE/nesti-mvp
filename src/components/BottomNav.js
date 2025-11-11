import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  MapIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import './BottomNav.css';

const navItems = [
  { id: 'feed', icon: HomeIcon, label: 'Accueil' },
  { id: 'agenda', icon: CalendarIcon, label: 'Agenda' },
  { id: 'nest', icon: UserGroupIcon, label: 'Mon Nest' },
  { id: 'discover', icon: MapIcon, label: 'Découvertes' },
  { id: 'chat', icon: ChatBubbleLeftRightIcon, label: 'Nesti IA' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="max-w-mobile mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
