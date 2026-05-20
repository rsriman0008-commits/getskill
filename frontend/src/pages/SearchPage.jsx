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
      setToast({ type: 'error', message: 'Search failed' });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>
                      {rating === 'All' ? 'All' : `${rating}★ and above`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Mode</label>
                <select
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {modes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sorts.map(sort => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content - Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
                </div>
              </div>
            ) : Object.keys(results).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Results Found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search for a different skill</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(results).map(([category, skills]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-bold text-slate-900">{category}</h2>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {skills.length}
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;
