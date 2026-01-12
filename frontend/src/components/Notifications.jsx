// frontend/src/components/Notifications.jsx
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const Notifications = () => {
  const { notifications, markAsRead, clearNotifications, unreadCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <p className="text-[11px] text-gray-500 font-medium">You have {unreadCount} unread messages</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 px-2 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No new notifications to show.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 relative ${
                    !notification.read ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                        !notification.read ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm leading-none ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                          Gig Assigned!
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-gray-100 text-gray-500 rounded uppercase tracking-tighter">
                          ₹{notification.bidPrice}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium italic">
                          from {notification.clientName}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                View All Activity
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Notifications;