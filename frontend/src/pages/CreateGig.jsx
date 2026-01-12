// frontend/src/pages/CreateGig.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGig } from '../services/api';

const CreateGig = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createGig({
        title,
        description,
        budget: parseFloat(budget)
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Post a New Gig
        </h1>
        <p className="text-gray-500 font-medium">
          Fill in the details below to find the perfect freelancer for your project.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-3">⚠️</span>
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-indigo-50 border border-gray-100 p-8 md:p-12 space-y-8">
        
        {/* Title Input */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 focus:bg-white transition-all outline-none text-gray-800 font-medium"
            placeholder="e.g., Design a modern landing page for a SaaS"
          />
          <p className="text-[11px] text-gray-400 mt-2 ml-1">Keep it short and descriptive.</p>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 focus:bg-white transition-all outline-none text-gray-800 leading-relaxed"
            placeholder="What needs to be done? Include specific requirements, tools, or deadlines..."
          />
        </div>

        {/* Budget Input */}
        <div className="max-w-xs">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">
            Project Budget (₹)
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              min="1"
              step="0.01"
              className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="0.00"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2 ml-1 italic">Enter a fair price for the work required.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:bg-indigo-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Project...
              </span>
            ) : 'Launch Gig'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGig;