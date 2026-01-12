// frontend/src/components/CompletedGigs.jsx
import { useState, useEffect } from 'react';
import { getMyPostedGigs, getMyAssignedGigs } from '../services/api';

const CompletedGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompletedGigs();
  }, []);

  const fetchCompletedGigs = async () => {
    try {
      setLoading(true);
      const [postedData, assignedData] = await Promise.all([
        getMyPostedGigs(),
        getMyAssignedGigs()
      ]);

      const completedPosted = postedData.gigs
        .filter(gig => gig.status === 'completed')
        .map(gig => ({
          ...gig,
          role: 'client',
          gigDetails: gig
        }));

      const completedAssigned = assignedData.bids
        .filter(bid => bid.gigId.status === 'completed')
        .map(bid => ({
          ...bid.gigId,
          role: 'freelancer',
          bidPrice: bid.price,
          gigDetails: bid.gigId
        }));

      const allCompleted = [...completedPosted, ...completedAssigned];
      setGigs(allCompleted);
    } catch (err) {
      setError('Failed to load completed gigs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
        {error}
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm mt-10">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">No completed gigs</h3>
        <p className="text-gray-500 mt-2 px-6">Gigs you finish as a client or freelancer will show up here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Project History</h1>
        <p className="text-gray-500 mt-1 font-medium">A summary of your successful collaborations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig) => (
          <div
            key={gig._id}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Status Ribbon */}
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-200 shadow-sm">
                Success
              </span>
            </div>

            <div className="flex flex-col h-full">
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide mb-3 ${
                  gig.role === 'client' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gig.role === 'client' ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                  {gig.role}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-green-600 transition-colors">
                  {gig.title}
                </h3>
              </div>

              <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {gig.description}
              </p>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                  <span>Total Budget</span>
                  <span className="text-gray-600">₹{gig.budget}</span>
                </div>
                {gig.role === 'freelancer' && gig.bidPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-green-500 uppercase">Earnings</span>
                    <span className="text-2xl font-black text-green-600 tracking-tighter">₹{gig.bidPrice}</span>
                  </div>
                )}
                {gig.role === 'client' && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-500 uppercase">Investment</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tighter">₹{gig.budget}</span>
                  </div>
                )}
              </div>

              {gig.role === 'client' && gig.hiredFreelancer && (
                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {gig.hiredFreelancer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Freelancer</p>
                    <p className="text-sm font-semibold text-gray-800 leading-none">{gig.hiredFreelancer.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedGigs;