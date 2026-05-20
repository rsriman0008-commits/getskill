import React from 'react';
import StarRating from './StarRating';

const SkillCard = ({ skill, onViewProfile, onConnect }) => {
  return (
    <div className="bg-slate-100 rounded-xl p-4 card-hover border border-indigo-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{skill.title || skill.courseName}</h3>
          <p className="text-xs text-slate-600">{skill.category}</p>
        </div>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
          {skill.targetLevel || skill.proficiency || 'Any'}
        </span>
      </div>

      {/* Teacher Info */}
      {skill.teacher && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
            {skill.teacher.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-900">{skill.teacher.name}</p>
            <p className="text-xs text-slate-600">{skill.teacher.location}</p>
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-300">
        <StarRating rating={skill.averageRating || skill.rating || 0} size="sm" />
        <span className="text-xs text-slate-600">
          ({skill.ratingCount || 0} reviews)
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="flex-1 bg-white hover:bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium transition-colors border border-indigo-200"
          >
            View Profile
          </button>
        )}
        {onConnect && (
          <button
            onClick={onConnect}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
