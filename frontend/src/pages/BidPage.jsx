// frontend/src/pages/BidPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// IMPORT getGigs from your existing api service
import { createBid, getBidsForGig, hireBid, getGigs } from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const BidPage = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchGigAndBids();
  }, [gigId]);

  const fetchGigAndBids = async () => {
    try {
      setLoading(true);
      setError('');
      
      // FIX: Use your getGigs service instead of raw axios.
      // This ensures the request uses the absolute Render URL.
      const data = await getGigs(''); 
      
      if (data && data.gigs) {
        const foundGig = data.gigs.find(g => g._id === gigId);
        
        if (!foundGig) {
          setError('Gig not found');
          setLoading(false);
          return;
        }
        
        setGig(foundGig);
        
        // SAFE CHECK: Use optional chaining ?. to prevent crash if data is incomplete
        const ownerId = foundGig.ownerId?._id || foundGig.ownerId;
        const currentUserId = user?.id || user?._id;
        
        const checkOwner = ownerId === currentUserId;
        setIsOwner(checkOwner);

        if (checkOwner) {
          try {
            const bidResponse = await getBidsForGig(gigId);
            setBids(bidResponse.bids || []);
          } catch (err) {
            console.error("Error fetching bids:", err);
          }
        }
      }
    } catch (err) {
      console.error("Page Load Error:", err);
      setError('Failed to load gig details. Server might be waking up.');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createBid({ gigId, message, price: parseFloat(price) });
      setSuccess('Bid submitted successfully! Redirecting...');
      setMessage('');
      setPrice('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) return;
    try {
      await hireBid(bidId);
      setSuccess('Freelancer hired successfully!');
      await fetchGigAndBids();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hire freelancer');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading gig details...</p>
      </div>
    );
  }

  // If gig is still null after loading (due to error), show error state
  if (!gig) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Gig data unavailable'}</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 underline">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Gig Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-indigo-600 px-8 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">
          Project Details
        </div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  gig.status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                  {gig.status}
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-tight">
                  Posted by {gig.ownerId?.name || 'User'}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-4">{gig.title}</h1>
              <p className="text-gray-600 leading-relaxed max-w-2xl">{gig.description}</p>
            </div>
            
            <div className="w-full md:w-auto bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center md:text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
              <p className="text-4xl font-black text-indigo-600 tracking-tighter">₹{gig.budget}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging (Error/Success) */}
      {(error || success) && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        }`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${error ? 'bg-red-100' : 'bg-emerald-100'}`}>
            {error ? '⚠️' : '✅'}
          </div>
          <p className="font-bold text-sm">{error || success}</p>
        </div>
      )}

      {/* Context-based Section (Owner View vs Freelancer View) */}
      {isOwner ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Received Proposals</h2>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{bids?.length || 0} Bids</span>
          </div>

          {!bids || bids.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No one has bid on this project yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bids.map((bid) => (
                <div key={bid._id} className="group relative bg-gray-50/50 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl p-6 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {bid.freelancerId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{bid.freelancerId?.name || 'User'}</p>
                          <p className="text-xs text-gray-400">{bid.freelancerId?.email}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">"{bid.message}"</p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{bid.price}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          bid.status === 'hired' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      
                      {bid.status === 'pending' && gig.status === 'open' && (
                        <button
                          onClick={() => handleHire(bid._id)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                        >
                          Hire Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Send a Proposal</h2>
            <p className="text-sm text-gray-500 mt-1">Pitch your services and set your price.</p>
          </div>

          {gig.status !== 'open' ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 px-6 py-4 rounded-2xl font-medium text-sm">
              🔒 This gig is currently closed for new bids.
            </div>
          ) : (
            <form onSubmit={handleBidSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cover Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 focus:bg-white transition-all text-sm outline-none"
                    placeholder="Tell the client why you're perfect for this task..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="1"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 focus:bg-white transition-all font-bold outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Client's max budget: ₹{gig.budget}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  Send Proposal
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BidPage;