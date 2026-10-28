import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Lazy Pages
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const BrowseTasks = lazy(() => import('./pages/BrowseTasks'));
const AddTask = lazy(() => import('./pages/AddTask'));
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

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress sx={{ color: '#4f46e5' }} />
  </Box>
);

import ScrollToTop from './components/ScrollToTop';

import { useLocation } from 'react-router-dom';

const ConditionalFooter = () => {
  const location = useLocation();
  const dashboardRoutes = ['/dashboard', '/my_tasks', '/analytics', '/profile', '/account', '/workflows'];
  const isDashboardRoute = dashboardRoutes.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  if (isDashboardRoute) {
    return null;
  }
  return <Footer />;
};

function App() {
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
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/all_tasks" element={<BrowseTasks />} />
              <Route path="/talent" element={<AITalent />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/task-details/:id" element={<TaskDetails />} />
              <Route path="/pay" element={<PaymentCheckout />} />
              <Route path="/tasks/:id/pay" element={<PaymentCheckout />} />
              <Route path="/checkout/:orderId" element={<PaymentCheckout />} />

              {/* Protected / App Routes */}
              <Route path="/add_task" element={<PrivateRoute><AddTask /></PrivateRoute>} />
              <Route path="/my_tasks" element={<PrivateRoute><MyPostedTasks /></PrivateRoute>} />
              <Route path="/update-task/:id" element={<PrivateRoute><UpdateTask /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/workflows" element={<PrivateRoute><Workflows /></PrivateRoute>} />
            </Routes>
          </Suspense>
          <ConditionalFooter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
