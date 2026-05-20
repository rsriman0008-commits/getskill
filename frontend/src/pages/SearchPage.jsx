import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import Toast from '../components/Toast';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    level: searchParams.get('level') || 'All',
    minRating: searchParams.get('minRating') || 'All',
    mode: searchParams.get('mode') || 'All',
    sort: searchParams.get('sort') || 'newest'
  });

  const categories = ['All', 'Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const ratings = ['All', '3', '4'];
  const modes = ['All', 'Online', 'In-person'];
  const sorts = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    performSearch();
  }, [searchParams, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const query = searchParams.get('q') || '';

      const params = {
        q: query,
        category: filters.category !== 'All' ? filters.category : undefined,
        level: filters.level !== 'All' ? filters.level : undefined,
        minRating: filters.minRating !== 'All' ? filters.minRating : undefined,
        mode: filters.mode !== 'All' ? filters.mode : undefined,
        sort: filters.sort
      };

      const response = await searchAPI.search(params);

      if (response.data.success) {
        setResults(response.data.results || {});
      }
    } catch (error) {
      console.error('Search error:', error);
      setToast({ type: 'error', message: 'Failed to complete search query' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleViewProfile = (teacherId) => {
    navigate(`/profile/${teacherId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-700/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-700/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            Explore <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {searchParams.get('q') 
              ? `Search results for "${searchParams.get('q')}"` 
              : 'Browse and search registered courses and expertise fields from nearby teachers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 border-white/5 sticky top-24 glow-purple">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎛️</span> Filters
                </h3>
                {(filters.category !== 'All' || filters.level !== 'All' || filters.minRating !== 'All' || filters.mode !== 'All') && (
                  <button 
                    onClick={() => setFilters({ category: 'All', level: 'All', minRating: 'All', mode: 'All', sort: 'newest' })}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Skill Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all cursor-pointer"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all cursor-pointer"
                >
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>
                      {rating === 'All' ? 'All ratings' : `${rating}★ and above`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Interaction Mode</label>
                <select
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all cursor-pointer"
                >
                  {modes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all cursor-pointer"
                >
                  {sorts.map(sort => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Results Section */}
          <div className="lg:col-span-3">
            {loading ? (
              /* Skeletal Loading */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="glass-card p-6 border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-32 bg-white/5 skeleton rounded-lg"></div>
                      <div className="h-5 w-16 bg-white/5 skeleton rounded-lg"></div>
                    </div>
                    <div className="h-4 w-40 bg-white/5 skeleton rounded-lg"></div>
                    <div className="h-10 w-full bg-white/5 skeleton rounded-xl mt-4"></div>
                  </div>
                ))}
              </div>
            ) : Object.keys(results).length === 0 ? (
              <div className="glass-card p-12 text-center border-white/5 glow-purple animate-scale-in">
                <div className="text-6xl mb-5">🔍</div>
                <h3 className="text-2xl font-black text-white mb-2">No Matching Services Found</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  We couldn't find any courses matching your specific search and filter criteria. Try relaxing your filters or exploring different keywords.
                </p>
                <button
                  onClick={() => {
                    setFilters({ category: 'All', level: 'All', minRating: 'All', mode: 'All', sort: 'newest' });
                    navigate('/search');
                  }}
                  className="btn-primary py-3 px-6 text-sm"
                >
                  Reset Filters & View All
                </button>
              </div>
            ) : (
              <div className="space-y-10 animate-fade-in">
                {Object.entries(results).map(([category, skills]) => (
                  <div key={category} className="glass-card p-6 border-white/5">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                      <h2 className="text-xl font-extrabold text-white">{category}</h2>
                      <span className="bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-0.5 rounded-full text-xs font-extrabold">
                        {skills.length} course{skills.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map(skill => (
                        <SkillCard
                          key={skill._id}
                          skill={skill}
                          onViewProfile={() => handleViewProfile(skill.teacher._id)}
                          onConnect={() => navigate(`/profile/${skill.teacher._id}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SearchPage;
