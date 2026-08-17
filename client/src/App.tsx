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

// Placeholder pages (to be built next)
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

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress sx={{ color: '#4f46e5' }} />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
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

              {/* Protected */}
              <Route path="/add_task" element={<PrivateRoute><AddTask /></PrivateRoute>} />
              <Route path="/my_tasks" element={<PrivateRoute><MyPostedTasks /></PrivateRoute>} />
              <Route path="/update-task/:id" element={<PrivateRoute><UpdateTask /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
            <Footer />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
