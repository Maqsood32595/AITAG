import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AddTask = lazy(() => import('./pages/AddTask'));
const BrowseTasks = lazy(() => import('./pages/BrowseTasks'));
const TaskDetails = lazy(() => import('./pages/TaskDetails'));
const MyPostedTasks = lazy(() => import('./pages/MyPostedTasks'));
const UpdateTask = lazy(() => import('./pages/UpdateTask'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AITalent = lazy(() => import('./pages/AITalent'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Profile = lazy(() => import('./pages/Profile'));
const Workflows = lazy(() => import('./pages/Workflows'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PaymentCheckout = lazy(() => import('./pages/PaymentCheckout'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const HowToBecomeAnExpert = lazy(() => import('./pages/HowToBecomeAnExpert'));

const Loader = () => (
  <Box sx={{ minHeight: '85vh', bgcolor: '#f8fafc' }} aria-hidden="true" />
);

import ScrollToTop from './components/ScrollToTop';

import { useLocation } from 'react-router-dom';

const ConditionalFooter = () => {
  const location = useLocation();
  const dashboardRoutes = ['/dashboard', '/my_tasks', '/analytics', '/profile', '/account', '/workflows', '/work-reels'];
  const isDashboardRoute = dashboardRoutes.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  if (isDashboardRoute) {
    return null;
  }
  return <Footer />;
};

function App() {
  // Prefetch primary public route chunks on idle so navigation never flashes a blank fallback
  useEffect(() => {
    const prefetch = () => {
      void import('./pages/HowItWorks');
      void import('./pages/Services');
      void import('./pages/AITalent');
      void import('./pages/BlogList');
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(prefetch, 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/services" element={<Services />} />
              <Route path="/packages" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contact-us" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/talent" element={<AITalent />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/how-to-become-an-expert" element={<HowToBecomeAnExpert />} />
              <Route path="/become-expert" element={<HowToBecomeAnExpert />} />
              <Route path="/become-an-expert" element={<HowToBecomeAnExpert />} />
              <Route path="/add_task" element={<AddTask />} />

              {/* Protected / App Routes (Secured against unauthorized / incognito access) */}
              <Route path="/all_tasks" element={<PrivateRoute><BrowseTasks /></PrivateRoute>} />
              <Route path="/task-details/:id" element={<PrivateRoute><TaskDetails /></PrivateRoute>} />
              <Route path="/pay" element={<PrivateRoute><PaymentCheckout /></PrivateRoute>} />
              <Route path="/tasks/:id/pay" element={<PrivateRoute><PaymentCheckout /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><PaymentCheckout /></PrivateRoute>} />
              <Route path="/checkout/:orderId" element={<PrivateRoute><PaymentCheckout /></PrivateRoute>} />
              <Route path="/my_tasks" element={<PrivateRoute><MyPostedTasks /></PrivateRoute>} />
              <Route path="/update-task/:id" element={<PrivateRoute><UpdateTask /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/workflows" element={<PrivateRoute><Workflows /></PrivateRoute>} />
              <Route path="/work-reels" element={<PrivateRoute><Workflows /></PrivateRoute>} />

              {/* Fallback / Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <ConditionalFooter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
