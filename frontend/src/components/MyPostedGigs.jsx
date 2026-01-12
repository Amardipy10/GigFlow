// frontend/src/components/MyPostedGigs.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPostedGigs } from '../services/api';
import Chat from './Chat';

const MyPostedGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGigId, setSelectedGigId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const data = await getMyPostedGigs();
      setGigs(data.gigs);
    } catch (err) {
      setError('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      assigned: 'bg-blue-50 text-blue-700 border-blue-100',
      completed: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const groupedGigs = {
    open: gigs.filter(g => g.status === 'open'),
    assigned: gigs.filter(g => g.status === 'assigned'),
    completed: gigs.filter(g => g.status === 'completed')
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm text-red-700 font-medium">
        {error}
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl mt-10">
        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">You haven't posted anything yet</h3>
        <p className="text-gray-500 mt-2 mb-8 px-10">Need something done? Post a gig and find the perfect freelancer for your project.</p>
        <button
          onClick={() => navigate('/create-gig')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          Post Your First Gig
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage My Gigs</h1>
          <p className="text-gray-500 mt-1 font-medium">Track applicants and manage active collaborations.</p>
        </div>
        <button
          onClick={() => navigate('/create-gig')}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 text-sm"
        >
          <span>+</span> Post New Gig
        </button>
      </div>

      {/* Open Gigs - "Hiring Mode" */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight underline decoration-indigo-200 decoration-4 underline-offset-8">
            Open for Bidding
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            {groupedGigs.open.length}
          </span>
        </div>
        
        {groupedGigs.open.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic">No active listings currently open.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedGigs.open.map((gig) => (
              <div
                key={gig._id}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => navigate(`/bid/${gig._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {gig.title}
                  </h3>
                  {getStatusBadge(gig.status)}
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{gig.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black text-indigo-600 tracking-tighter">₹{gig.budget}</div>
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    View Bids →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Assigned Gigs - "Active Work" */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight underline decoration-blue-200 decoration-4 underline-offset-8">
            Active Projects
          </h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
            {groupedGigs.assigned.length}
          </span>
        </div>

        {groupedGigs.assigned.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic">No projects currently in progress.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupedGigs.assigned.map((gig) => (
              <div
                key={gig._id}
                className={`group bg-white border-2 rounded-2xl p-6 transition-all cursor-pointer ${
                  selectedGigId === gig._id ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-50' : 'border-gray-50 hover:border-blue-100 hover:shadow-md'
                }`}
                onClick={() => setSelectedGigId(gig._id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{gig.title}</h3>
                  {getStatusBadge(gig.status)}
                </div>
                <div className="text-2xl font-black text-blue-600 tracking-tighter mb-4">₹{gig.budget}</div>
                
                {gig.hiredFreelancer && (
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {gig.hiredFreelancer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Working with</p>
                      <p className="text-sm font-bold text-gray-800 leading-none">{gig.hiredFreelancer.name}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{gig.hiredFreelancer.email}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Chat Section */}
      {selectedGigId && groupedGigs.assigned.find(g => g._id === selectedGigId) && (
        <div className="mt-12 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="bg-indigo-600 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">Collaboration Hub</h2>
                <p className="text-indigo-200 text-xs mt-1 font-medium italic">Chat with your hired freelancer</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedGigId(null)}
              className="group p-2 bg-indigo-700 hover:bg-white text-white hover:text-indigo-600 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Chat gigId={selectedGigId} />
        </div>
      )}
    </div>
  );
};

export default MyPostedGigs;