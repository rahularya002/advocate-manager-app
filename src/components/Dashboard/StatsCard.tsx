import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'gold' | 'red' | 'purple';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  color = 'blue' 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    gold: 'bg-gold-500 text-gold-600',
    red: 'bg-red-500 text-red-600',
    purple: 'bg-purple-500 text-purple-600'
  };

  const changeClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-primary-600 bg-primary-50'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary-900">{value}</p>
          {change && (
            <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
}