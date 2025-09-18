import React from 'react';

const InfoCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  change,
  color = 'blue',
  className = '',
  onClick,
  style
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    rose: 'from-rose-500 to-rose-600'
  };

  const trendColors = {
    positive: 'bg-emerald-100 text-emerald-700',
    negative: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return (
    <div
      className={`glass-card-lg p-6 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 cursor-pointer group ${className}`}
      onClick={onClick}
      style={style}
    >
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {change && (
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${trendColors[trend]}`}>
            {change}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          {title}
        </h3>

        <div className="text-3xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
          {value}
        </div>

        <p className="text-sm text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Hover Effect Indicator */}
      <div className="mt-4 h-1 w-0 bg-gradient-to-r from-transparent via-slate-300 to-transparent group-hover:w-full transition-all duration-500 rounded-full"></div>
    </div>
  );
};

export default InfoCard;