import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProfileEditor from './pages/ProfileEditor';

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
const PrivacySettings = React.lazy(() => import('./pages/PrivacySettings'));
const Messaging = React.lazy(() => import('./pages/Messaging'));
const CommunityFeed = React.lazy(() => import('./pages/CommunityFeed'));
const Networking = React.lazy(() => import('./pages/Networking'));
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const AlumniVerification = React.lazy(() => import('./pages/admin/AlumniVerification'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const ContentModeration = React.lazy(() => import('./pages/admin/ContentModeration'));
const AlumniAnalytics = React.lazy(() => import('./pages/admin/AlumniAnalytics'));
const AdminEventCreator = React.lazy(() => import('./pages/admin/AdminEventCreator'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const SavedJobs = React.lazy(() => import('./pages/SavedJobs'));

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-20 text-center font-bold text-slate-500">Loading Session...</div>;
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
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full pt-20">Loading...</div>}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/directory" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
                                <Route path="/alumni/:userId" element={<ProtectedRoute><AlumniProfileView /></ProtectedRoute>} />
                                <Route path="/profile/edit" element={<ProtectedRoute role="alumni"><ProfileEditor /></ProtectedRoute>} />
                                <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
                                <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
                                <Route path="/feed" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
                                <Route path="/networking" element={<ProtectedRoute><Networking /></ProtectedRoute>} />
                                <Route path="/jobs" element={<ProtectedRoute><JobPortal /></ProtectedRoute>} />
                                <Route path="/saved-jobs" element={<ProtectedRoute role="student"><SavedJobs /></ProtectedRoute>} />
                                <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                                <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                                <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                                <Route path="/alumni-dashboard" element={<ProtectedRoute role="alumni"><AlumniDashboard /></ProtectedRoute>} />
                                
                                {/* Admin Routes */}
                                <Route path="/admin-dashboard" element={<Navigate to="/admin/overview" />} />
                                <Route path="/admin/*" element={<AdminDashboard />}>
                                    <Route path="overview" element={<AdminOverview />} />
                                    <Route path="analytics" element={<AlumniAnalytics />} />
                                    <Route path="verification" element={<AlumniVerification />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="jobs" element={<ContentModeration />} />
                                    <Route path="announcements" element={<AdminEventCreator />} />
                                </Route>

                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </React.Suspense>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
