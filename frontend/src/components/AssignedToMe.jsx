// frontend/src/components/AssignedToMe.jsx
import { useState, useEffect } from 'react';
import { getMyAssignedGigs, completeGig } from '../services/api';
import Chat from './Chat';

const AssignedToMe = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingGigId, setCompletingGigId] = useState(null);
  const [selectedGigId, setSelectedGigId] = useState(null);

  useEffect(() => {
    fetchAssignedGigs();
  }, []);

  const fetchAssignedGigs = async () => {
    try {
      setLoading(true);
      const data = await getMyAssignedGigs();
      setBids(data.bids);
    } catch (err) {
      setError('Failed to load assigned gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (gigId) => {
    if (!window.confirm('Mark this gig as completed?')) {
      return;
    }

    try {
      setCompletingGigId(gigId);
      await completeGig(gigId);
      await fetchAssignedGigs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setCompletingGigId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Fetching your assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="ml-3 text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No gigs assigned to you</h3>
        <p className="text-gray-500 mt-2 px-6">Your active projects will appear here once a client accepts your bid.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assigned Gigs</h1>
        <p className="mt-2 text-gray-600">Track your progress and communicate with clients.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {bids.map((bid) => (
          <div
            key={bid._id}
            className={`group bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl border-2 ${
              selectedGigId === bid.gigId._id ? 'border-indigo-500 ring-2 ring-indigo-50' : 'border-gray-100 hover:border-indigo-200'
            }`}
            onClick={() => setSelectedGigId(bid.gigId._id)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start gap-2 mb-4">
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {bid.gigId.title}
                </h3>
                <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                  bid.gigId.status === 'assigned' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                  {bid.gigId.status}
                </span>
              </div>

              <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                {bid.gigId.description}
              </p>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Budget</span>
                  <span className="text-sm font-medium text-gray-600">₹{bid.gigId.budget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Your Payout</span>
                  <span className="text-xl font-black text-indigo-600 tracking-tight">₹{bid.price}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Message to Client</p>
                <p className="text-sm text-gray-600 italic bg-white p-2 rounded border border-gray-50">
                  "{bid.message}"
                </p>
              </div>

              {bid.gigId.status === 'assigned' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(bid.gigId._id);
                  }}
                  disabled={completingGigId === bid.gigId._id}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 disabled:bg-indigo-300 transition-all shadow-md shadow-indigo-100"
                >
                  {completingGigId === bid.gigId._id ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Mark as Completed'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      {selectedGigId && (
        <div className="mt-12 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-bold text-white">Project Communication</h2>
            </div>
            <button
              onClick={() => setSelectedGigId(null)}
              className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
              title="Close Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-0">
            <Chat gigId={selectedGigId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedToMe;