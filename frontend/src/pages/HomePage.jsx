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
      setToast({ type: 'error', message: 'Failed to load dashboard data' });
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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Exchange Skills, <span className="gradient-text">Grow Together.</span>
          </h1>
          <p className="text-slate-400 mt-2.5 text-base md:text-lg max-w-2xl leading-relaxed">
            Welcome back, <span className="text-purple-300 font-bold">{user?.name || 'Explorer'}</span>! Connect with partners, review matches, and manage your courses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 border-white/5 sticky top-24 glow-purple">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl shadow-purple-500/20">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <h3 className="font-extrabold text-lg text-white leading-snug">{user?.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <span>📍</span> {user?.location || 'Global Citizen'}
                </p>
              </div>

              {/* Bio */}
              {user?.bio && (
                <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 italic">
                  "{user.bio}"
                </p>
              )}

              {/* User Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-3 rounded-xl border border-white/5 mb-6">
                <div>
                  <p className="text-base font-black text-cyan-400">{user?.trustScore || 0}%</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Trust</p>
                </div>
                <div className="border-l border-white/10">
                  <p className="text-base font-black text-purple-400">{user?.skillsTeach?.length || 0}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Teach</p>
                </div>
                <div className="border-l border-white/10">
                  <p className="text-base font-black text-pink-400">{user?.skillsLearn?.length || 0}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Learn</p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => navigate('/profile?edit=true')}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                ⚙️ Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-10">
            {/* Search and Category section */}
            <div className="glass-card p-6 border-white/5 glow-cyan">
              <div className="relative mb-5">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="What skill do you want to learn or teach today?"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-12 pr-6 py-4 bg-slate-900 border-2 border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 text-base md:text-lg transition-all duration-300 shadow-inner"
                />
                
                {/* Suggestions Dropdown */}
                {searchSuggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setSearchSuggestions([])}></div>
                    <div className="absolute top-full left-0 right-0 mt-3 glass border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden animate-slide-down">
                      {searchSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(suggestion.name);
                            setSearchSuggestions([]);
                            navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
                          }}
                          className="w-full text-left px-6 py-4 hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <p className="font-extrabold text-white text-sm">{suggestion.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Category: {suggestion.category}</p>
                          </div>
                          <span className="text-xs text-purple-400 font-bold">Search →</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Pills */}
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs text-slate-400 font-bold mr-2 uppercase tracking-wide">Category Quick Access:</span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryFilter(cat)}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-white rounded-full text-xs font-semibold transition-all duration-200"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-8">
                <div className="glass-card p-6 border-white/5 space-y-4">
                  <div className="h-6 w-48 bg-white/5 skeleton rounded-lg"></div>
                  <div className="flex gap-4 overflow-hidden">
                    <div className="w-64 h-48 bg-white/5 skeleton flex-shrink-0"></div>
                    <div className="w-64 h-48 bg-white/5 skeleton flex-shrink-0"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Matching Profiles */}
                {matches.length > 0 && (
                  <section className="glass-card p-6 border-white/5 glow-purple">
                    <h2 className="text-xl font-extrabold text-white mb-5 flex items-center gap-2">
                      <span>⚡</span> Perfect Matchups For You
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {matches.map(match => (
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

                {/* Your Services/Courses */}
                <section className="glass-card p-6 border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <span>🏫</span> Your Registered Teaching Services
                    </h2>
                    <button
                      onClick={() => navigate('/provide-service')}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      + Register Service
                    </button>
                  </div>

                  {courses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-white/5">
                      <p className="text-slate-400 text-sm mb-4">You have not registered any skills you teach yet.</p>
                      <button
                        onClick={() => navigate('/provide-service')}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Register a Teaching Service
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

                {/* Trending Skills Categories */}
                {trending.length > 0 && (
                  <section className="glass-card p-6 border-white/5">
                    <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                      <span>🔥</span> Trending Skill Exchanges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {trending.map(skill => (
                        <div
                          key={skill.category}
                          className="glass-card p-5 border-white/5 card-hover flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-extrabold text-white text-sm">{skill.category}</h3>
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                                {skill.courseCount} course{skill.courseCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                              {skill.topCourse?.overview || `Explore popular ${skill.category.toLowerCase()} workshops.`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleTrendingFind(skill.category)}
                            className="w-full bg-white/5 hover:bg-purple-500/20 text-white hover:text-purple-300 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-purple-500/20 transition-all duration-200"
                          >
                            Explore Teachers
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

      <ChatBox />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default HomePage;
