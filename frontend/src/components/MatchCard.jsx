import React from 'react';

const MatchCard = ({ match, onConnect, onViewProfile }) => {
  const { user, matchScore, matchType } = match;

  const getMatchStyles = () => {
    if (matchType === 'Perfect Match') {
      return {
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        card: 'border-emerald-500/20 shadow-emerald-950/20'
      };
    }
    if (matchType === 'Good Match') {
      return {
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        card: 'border-cyan-500/20 shadow-cyan-950/20'
      };
    }
    return {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      card: 'border-amber-500/10 shadow-amber-950/10'
    };
  };

  const styles = getMatchStyles();

  return (
    <div className={`glass-card p-5 card-hover flex-shrink-0 w-64 inline-flex flex-col justify-between ${styles.card}`}>
      <div>
        {/* Profile Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/10">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate text-sm leading-snug">{user.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>📍</span> {user.location || 'Remote'}
            </p>
          </div>
        </div>

        {/* Match Type Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${styles.badge}`}>
            ✨ {matchType} • {matchScore}%
          </span>
        </div>

        {/* Skills Description */}
        <div className="space-y-2.5 mb-4 text-xs">
          <div className="flex items-start gap-1">
            <span className="text-slate-400 font-medium whitespace-nowrap min-w-[54px]">Teaches:</span>
            <span className="text-purple-300 font-semibold truncate">
              {user.skillsTeach?.slice(0, 2).map(s => s.title).join(', ') || 'No skills listed'}
            </span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-slate-400 font-medium whitespace-nowrap min-w-[54px]">Learns:</span>
            <span className="text-cyan-300 font-semibold truncate">
              {user.skillsLearn?.slice(0, 2).map(s => s.title).join(', ') || 'No skills listed'}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 italic leading-relaxed">
          "{user.bio || 'Ready to exchange skills and grow!'}"
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div>
        <div className="flex items-center justify-between py-2 border-t border-white/5 mb-4">
          <span className="text-xs font-semibold text-slate-400">Trust Score</span>
          <span className="text-sm font-extrabold text-cyan-400">{user.trustScore || 0}%</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewProfile}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-xs font-bold border border-white/10 transition-all duration-200"
          >
            Profile
          </button>
          <button
            onClick={onConnect}
            className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 transition-all duration-200"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
