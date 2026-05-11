import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const AlumniDashboard = React.lazy(() => import('./pages/AlumniDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AlumniDirectory = React.lazy(() => import('./pages/AlumniDirectory'));
const AlumniProfileView = React.lazy(() => import('./pages/AlumniProfileView'));
const JobPortal = React.lazy(() => import('./pages/JobPortal'));
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow pt-16">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route 
                                    path="/directory" 
                                    element={
                                        <ProtectedRoute>
                                            <AlumniDirectory />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/alumni/:userId" 
                                    element={
                                        <ProtectedRoute>
                                            <AlumniProfileView />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/jobs" 
                                    element={
                                        <ProtectedRoute>
                                            <JobPortal />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/events" 
                                    element={
                                        <ProtectedRoute>
                                            <EventsPage />
                                        </ProtectedRoute>
                                    } 
                                />
                                
                                <Route 
                                    path="/student-dashboard" 
                                    element={
                                        <ProtectedRoute role="student">
                                            <StudentDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/alumni-dashboard" 
                                    element={
                                        <ProtectedRoute role="alumni">
                                            <AlumniDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin-dashboard" 
                                    element={
                                        <ProtectedRoute role="admin">
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                            </Routes>
                        </React.Suspense>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
