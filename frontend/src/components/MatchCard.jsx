import React from 'react';

const MatchCard = ({ match, onConnect, onViewProfile }) => {
  const { user, matchScore, matchType } = match;

  const getMatchColor = () => {
    if (matchType === 'Perfect Match') return 'bg-green-100 text-green-700 border-green-300';
    if (matchType === 'Good Match') return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  return (
    <div className="bg-white rounded-xl p-4 card-hover border border-slate-200 shadow-sm inline-block w-56 flex-shrink-0">
      {/* Avatar & Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate text-sm">{user.name}</h3>
          <p className="text-xs text-slate-600">{user.location}</p>
        </div>
      </div>

      {/* Match Badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${getMatchColor()}`}>
        {matchType} • {matchScore}%
      </div>

      {/* Skills Summary */}
      <div className="mb-4 text-xs space-y-1">
        <p className="text-slate-700">
          <span className="font-semibold">Teaches:</span> {user.skillsTeach?.slice(0, 2).map(s => s.title).join(', ') || 'No skills'}
        </p>
        <p className="text-slate-700">
          <span className="font-semibold">Learns:</span> {user.skillsLearn?.slice(0, 2).map(s => s.title).join(', ') || 'No skills'}
        </p>
      </div>

      {/* Bio */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{user.bio}</p>

      {/* Trust Score */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
        <span className="text-xs font-medium text-slate-900">Trust Score</span>
        <span className="text-sm font-bold text-indigo-600">{user.trustScore || 0}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewProfile}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          Profile
        </button>
        <button
          onClick={onConnect}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
