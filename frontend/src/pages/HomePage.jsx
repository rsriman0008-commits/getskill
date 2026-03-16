import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, courseAPI, searchAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import MatchCard from '../components/MatchCard';
import SkillCard from '../components/SkillCard';
import ChatBox from '../components/ChatBox';
import Toast from '../components/Toast';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const categories = ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, coursesRes, trendingRes] = await Promise.all([
        userAPI.getMatches(),
        courseAPI.getMyCourses(),
        searchAPI.getTrending()
      ]);

      if (matchesRes.data.success) setMatches(matchesRes.data.matches);
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
      if (trendingRes.data.success) setTrending(trendingRes.data.trending);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      try {
        const res = await searchAPI.getSuggestions(value);
        if (res.data.success) {
          setSearchSuggestions(res.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleCategoryFilter = (category) => {
    navigate(`/search?category=${category}`);
  };

  const handleMatchConnect = (match) => {
    navigate(`/profile/${match.user._id}`);
  };

  const handleTrendingFind = (category) => {
    navigate(`/search?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 sticky top-20">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <h3 className="font-bold text-lg text-slate-900">{user?.name}</h3>
                <p className="text-sm text-slate-600">{user?.location}</p>
              </div>

              <p className="text-xs text-slate-700 text-center mb-4 line-clamp-2">{user?.bio}</p>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-indigo-600">{user?.trustScore || 0}</p>
                  <p className="text-xs text-slate-600">Trust Score</p>
                </div>
                <div className="flex-1 text-center border-l border-indigo-200">
                  <p className="text-lg font-bold text-indigo-600">{user?.skillsTeach?.length || 0}</p>
                  <p className="text-xs text-slate-600">Teaching</p>
                </div>
                <div className="flex-1 text-center border-l border-indigo-200">
                  <p className="text-lg font-bold text-indigo-600">{user?.skillsLearn?.length || 0}</p>
                  <p className="text-xs text-slate-600">Learning</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Section */}
            <div>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search for skills, people, or courses..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full px-6 py-4 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-indigo-500 text-lg"
                />
                {searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-lg z-10">
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion.name);
                          navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
                        }}
                        className="w-full text-left px-6 py-3 hover:bg-indigo-50 border-b border-slate-200 last:border-b-0"
                      >
                        <p className="font-semibold text-slate-900">{suggestion.name}</p>
                        <p className="text-xs text-slate-600">{suggestion.category}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryFilter(cat)}
                    className="px-4 py-2 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Matching Profiles */}
                {matches.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">People who match your skills</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {matches.slice(0, 5).map(match => (
                        <MatchCard
                          key={match.user._id}
                          match={match}
                          onConnect={() => handleMatchConnect(match)}
                          onViewProfile={() => navigate(`/profile/${match.user._id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Your Courses */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Your Services</h2>
                    <button
                      onClick={() => navigate('/provide-service')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Register New
                    </button>
                  </div>

                  {courses.length === 0 ? (
                    <div className="text-center bg-slate-50 rounded-2xl py-12">
                      <p className="text-slate-600 mb-4">You haven't registered any courses yet</p>
                      <button
                        onClick={() => navigate('/provide-service')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Register Your First Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map(course => (
                        <SkillCard
                          key={course._id}
                          skill={course}
                          onViewProfile={() => navigate(`/profile/${course.teacher._id}`)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Trending Skills */}
                {trending.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Trending skills to learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trending.map(skill => (
                        <div
                          key={skill.category}
                          className="bg-slate-50 rounded-xl p-6 card-hover border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg text-slate-900">{skill.category}</h3>
                            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                              {skill.courseCount} courses
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {skill.topCourse?.overview}
                          </p>
                          <button
                            onClick={() => handleTrendingFind(skill.category)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Find Teachers
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Box */}
      <ChatBox />

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

export default HomePage;
