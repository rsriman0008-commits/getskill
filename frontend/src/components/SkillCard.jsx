import React from 'react';
import StarRating from './StarRating';

const SkillCard = ({ skill, onViewProfile, onConnect }) => {
  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Technology': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Music': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Language': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Art': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Cooking': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Fitness': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Business': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const badgeStyle = getBadgeStyle(skill.category);

  return (
    <div className="glass-card p-5 card-hover flex flex-col justify-between h-full relative overflow-hidden">
      {/* Visual top highlight */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-60"></div>

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div>
            <h3 className="font-extrabold text-white text-base leading-snug">{skill.title || skill.courseName}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-2 ${badgeStyle}`}>
              {skill.category}
            </span>
          </div>
          <span className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg font-bold whitespace-nowrap">
            📶 {skill.targetLevel || skill.proficiency || 'Any'}
          </span>
        </div>

        {/* Short Description if available */}
        {(skill.description || skill.overview) && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed italic">
            "{skill.description || skill.overview}"
          </p>
        )}

        {/* Teacher Info */}
        {skill.teacher && (
          <div className="flex items-center gap-2.5 mb-4 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              {skill.teacher.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{skill.teacher.name}</p>
              <p className="text-[10px] text-slate-400 truncate">📍 {skill.teacher.location || 'Remote'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rating & Actions */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
          <StarRating rating={skill.averageRating || skill.rating || 0} size="sm" />
          <span className="text-xs text-slate-400 font-medium">
            ({skill.ratingCount || 0} reviews)
          </span>
        </div>

        <div className="flex gap-2">
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-xs font-bold border border-white/10 transition-all duration-200"
            >
              Teacher Profile
            </button>
          )}
          {onConnect && (
            <button
              onClick={onConnect}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 transition-all duration-200"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
