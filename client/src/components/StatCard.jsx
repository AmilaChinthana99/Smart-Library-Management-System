import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorStyles = {
    blue: 'from-blue-600/20 to-blue-900/10 text-blue-400 border-blue-500/20',
    purple: 'from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/20',
    emerald: 'from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/20',
    rose: 'from-rose-600/20 to-rose-900/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={`p-5 rounded-2xl glass-card bg-gradient-to-br ${colorStyles[color]} border flex items-start justify-between`}>
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 mt-2">
            {trend}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl bg-slate-800/60 backdrop-blur-md ${colorStyles[color].split(' ')[2]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
