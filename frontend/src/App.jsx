// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateGig from './pages/CreateGig';
import BidPage from './pages/BidPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          {/* min-h-screen ensures the background color covers the whole page.
            bg-gray-50 provides a soft, professional neutral tone behind our white cards.
          */}
          <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
            <Navbar />
            
            {/* Main content wrapper. 
              The 'pb-20' ensures content doesn't hit the bottom of the screen on mobile.
            */}
            <main className="pb-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/create-gig"
                  element={
                    <ProtectedRoute>
                      <CreateGig />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/bid/:gigId"
                  element={
                    <ProtectedRoute>
                      <BidPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;