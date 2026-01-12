// frontend/src/components/MyApplications.jsx
import { useState, useEffect } from 'react';
import { getMyApplications } from '../services/api';

const MyApplications = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      setBids(data.bids);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      rejected: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center gap-3">
        <span className="text-red-500 text-xl">⚠️</span>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm mt-10">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">No applications yet</h3>
        <p className="text-gray-500 mt-2 px-6">You haven't bid on any gigs. Head over to the marketplace to get started!</p>
      </div>
    );
  }

  const pendingBids = bids.filter(b => b.status === 'pending');
  const rejectedBids = bids.filter(b => b.status === 'rejected');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
        <p className="text-gray-500 mt-1 font-medium">Review and track the status of your project proposals.</p>
      </div>

      {/* Pending Applications */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pending Review</h2>
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pendingBids.length}
          </span>
        </div>
        
        {pendingBids.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl py-8 text-center text-gray-400 font-medium italic">
            No pending proposals at the moment.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingBids.map((bid) => (
              <div key={bid._id} className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {bid.gigId.title}
                  </h3>
                  {getStatusBadge(bid.status)}
                </div>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{bid.gigId.description}</p>

                <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl mb-4 border border-indigo-50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <span>Client Budget</span>
                    <span className="text-gray-500">₹{bid.gigId.budget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 uppercase">Your Proposal</span>
                    <span className="text-xl font-black text-indigo-700 tracking-tighter">₹{bid.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Pitch Message</p>
                  <p className="text-sm text-gray-600 italic line-clamp-2 leading-relaxed">"{bid.message}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rejected Applications */}
      <section className="opacity-80">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-500">Not Selected</h2>
          <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {rejectedBids.length}
          </span>
        </div>

        {rejectedBids.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedBids.map((bid) => (
              <div key={bid._id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 grayscale transition-all hover:grayscale-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-md font-bold text-gray-600">{bid.gigId.title}</h3>
                  {getStatusBadge(bid.status)}
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                  <span>Your Bid:</span>
                  <span>₹{bid.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyApplications;