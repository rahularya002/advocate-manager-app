import { 
  Home, 
  Users, 
  Scale, 
  Calendar, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'cases', label: 'Cases', icon: Scale },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    const colors = {
      partner: 'bg-gold-100 text-gold-800',
      senior_associate: 'bg-blue-100 text-blue-800',
      associate: 'bg-green-100 text-green-800',
      paralegal: 'bg-purple-100 text-purple-800',
      admin: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.admin;
  };

  return (
    <div className="w-64 bg-primary-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center space-x-3">
          <Scale className="h-8 w-8 text-gold-400" />
          <div>
            <h1 className="text-xl font-bold">AdvocateManager</h1>
            <p className="text-sm text-primary-300">{user?.firm?.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-primary-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-300 hover:text-white hover:bg-primary-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700 mt-auto">
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-3 py-2 text-primary-300 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}