// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGigs } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const data = await getGigs(search);
      setGigs(data.gigs);
    } catch (err) {
      setError('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGigs();
  };

  const handleBidClick = (gigId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/bid/${gigId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Discovering opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Hero Section with Search */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
            Find the perfect <span className="text-indigo-600">Gig</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Browse through hundreds of available projects and start earning today.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100">
            <div className="flex-1 flex items-center px-4 gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What project are you looking for?"
                className="w-full py-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Latest Opportunities</h2>
          <span className="text-sm font-semibold text-gray-400">{gigs.length} results found</span>
        </div>

        {gigs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 font-bold text-lg">No gigs match your search</p>
            <p className="text-gray-400 text-sm mt-1">Try using different keywords or browse all gigs.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className="group bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 flex flex-col"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {gig.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                    {gig.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</p>
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{gig.budget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posted By</p>
                    <p className="text-sm font-bold text-gray-700">{gig.ownerId.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBidClick(gig._id)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 shadow-lg shadow-gray-100 hover:shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;