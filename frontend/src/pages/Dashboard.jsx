// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import MyPostedGigs from '../components/MyPostedGigs';
import AssignedToMe from '../components/AssignedToMe';
import MyApplications from '../components/MyApplications';
import CompletedGigs from '../components/CompletedGigs';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('posted');

  const tabs = [
    { id: 'posted', label: 'My Posted Gigs', component: MyPostedGigs },
    { id: 'assigned', label: 'Assigned To Me', component: AssignedToMe },
    { id: 'applications', label: 'My Applications', component: MyApplications },
    { id: 'completed', label: 'Completed', component: CompletedGigs }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            My Dashboard
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Manage your projects, track applications, and communicate with partners.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Navigation - Clean Pill Style */}
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-400 font-medium">Select a tab to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;