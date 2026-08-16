import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar,
  Chip, Button, TextField, InputAdornment, Stack, Divider, Paper, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

interface Talent {
  id: string;
  name: string;
  email?: string;
  role: string;
  category: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  completedTasks: number;
  location: string;
  bio: string;
  skills: string[];
  verified: boolean;
  isRegisteredUser?: boolean;
}

const CURATED_TALENT: Talent[] = [
  {
    id: 'curated-1',
    name: 'Dr. Aarav Sharma',
    role: 'Senior LLM & RAG Architect',
    category: 'LLM & Generative AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    rating: 4.98,
    reviewsCount: 42,
    hourlyRate: 3500,
    completedTasks: 38,
    location: 'Bengaluru, India',
    bio: 'Ex-AI Research Lead specializing in fine-tuning open-source LLMs (LLaMA-3, Mistral) and enterprise RAG pipelines with Pinecone and LangChain.',
    skills: ['LLaMA-3', 'LangChain', 'Pinecone', 'Python', 'FastAPI', 'PyTorch'],
    verified: true,
  },
  {
    id: 'curated-2',
    name: 'Priya Mukherjee',
    role: 'Computer Vision & Edge AI Engineer',
    category: 'Computer Vision',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
    rating: 4.95,
    reviewsCount: 29,
    hourlyRate: 2800,
    completedTasks: 27,
    location: 'Hyderabad, India',
    bio: 'Specialist in real-time defect detection, YOLOv10 deployment, OCR document mining, and low-latency ONNX runtime optimizations.',
    skills: ['YOLOv10', 'OpenCV', 'PyTorch', 'TensorRT', 'Edge AI', 'Docker'],
    verified: true,
  },
  {
    id: 'curated-3',
    name: 'Vikramaditya Iyer',
    role: 'Full-Stack Agentic AI Developer',
    category: 'Agentic Systems',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    rating: 4.92,
    reviewsCount: 51,
    hourlyRate: 3200,
    completedTasks: 49,
    location: 'Mumbai, India',
    bio: 'Building autonomous multi-agent swarms with LangGraph, AutoGen, Next.js 15, and real-time streaming WebSocket sandboxes.',
    skills: ['Next.js', 'React', 'LangGraph', 'TypeScript', 'Supabase', 'Node.js'],
    verified: true,
  },
  {
    id: 'curated-4',
    name: 'Ananya Deshmukh',
    role: 'MLOps & Cloud Infrastructure Specialist',
    category: 'MLOps & Cloud',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
    rating: 4.99,
    reviewsCount: 36,
    hourlyRate: 4000,
    completedTasks: 34,
    location: 'Pune, India',
    bio: 'End-to-end ML model lifecycle automation on AWS SageMaker, Kubernetes (KServe), CI/CD model monitoring, and GPU cost optimization.',
    skills: ['AWS SageMaker', 'Kubernetes', 'MLflow', 'Docker', 'Terraform', 'CI/CD'],
    verified: true,
  }
];

const CATEGORIES = [
  'All',
  'LLM & Generative AI',
  'Computer Vision',
  'Agentic Systems',
  'MLOps & Cloud'
];

const AITalent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [talents, setTalents] = useState<Talent[]>(CURATED_TALENT);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const res = await authApi.getUsers();
        const rawUsers = res.data || [];

        // Transform registered users into Talent cards
        const registeredTalent: Talent[] = rawUsers
          .filter((u: any) => u.email !== user?.email) // Show other registered users
          .map((u: any) => {
            const isUser1 = u.email?.toLowerCase().includes('user1');
            const isMaqsood = u.email?.toLowerCase().includes('maqsood');

            return {
              id: u.id,
              name: u.name || u.email.split('@')[0],
              email: u.email,
              role: isUser1
                ? 'Full-Stack AI Engineer & Admin'
                : isMaqsood
                ? 'Lead AI Researcher & Platform Engineer'
                : `${u.role === 'admin' ? 'Admin / ' : ''}AI Developer & Specialist`,
              category: isUser1 ? 'Agentic Systems' : isMaqsood ? 'LLM & Generative AI' : 'Agentic Systems',
              avatar: u.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || u.email)}`,
              rating: 5.0,
              reviewsCount: 14,
              hourlyRate: isUser1 ? 3200 : isMaqsood ? 4500 : 2800,
              completedTasks: isUser1 ? 19 : isMaqsood ? 42 : 8,
              location: 'India',
              bio: `Registered AITAG Platform Specialist (${u.role.toUpperCase()}). Verified credentials, sub-millisecond AST sandbox testing, and active freelance contracts.`,
              skills: isUser1
                ? ['Next.js', 'LangGraph', 'Supabase', 'Python', 'Node.js']
                : isMaqsood
                ? ['LLM Fine-tuning', 'RAG Systems', 'PyTorch', 'FastAPI', 'Sandwich AST']
                : ['React', 'TypeScript', 'Supabase', 'Python'],
              verified: true,
              isRegisteredUser: true
            };
          });

        // Prepend real registered users at the top, followed by curated profiles
        setTalents([...registeredTalent, ...CURATED_TALENT]);
      } catch (err) {
        console.error('Failed to load registered users for talent directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredUsers();
  }, [user]);

  const filteredTalent = talents.filter((talent) => {
    const matchesCategory = selectedCategory === 'All' || talent.category === selectedCategory;
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (talent.email && talent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      talent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleHireClick = (talent: Talent) => {
    if (!user) {
      navigate('/signin', { state: { error: 'Please sign in to hire or invite talent.' }, replace: true });
    } else {
      navigate('/add_task', { state: { preferredTalent: talent.name } });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      {/* Hero Header */}
      <Box
        sx={{
          pt: 16,
          pb: 8,
          background: 'linear-gradient(180deg, rgba(79,70,229,0.06) 0%, rgba(248,250,252,1) 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important', color: '#4f46e5' }} />}
            label="Verified Global AI Specialists & Platform Talent"
            sx={{
              bgcolor: 'rgba(79,70,229,0.08)',
              color: '#4f46e5',
              fontWeight: 700,
              mb: 2,
              px: 1,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-1.5px',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Hire World-Class{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Talent & Engineers
            </Box>
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 620, mx: 'auto', mb: 4 }}>
            Pre-vetted specialists in LLM fine-tuning, autonomous agent architectures, computer vision, and MLOps pipelines.
          </Typography>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 0.8,
              borderRadius: '16px',
              border: '1px solid rgba(79,70,229,0.15)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              bgcolor: '#ffffff',
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by skill or user (e.g. User1, RAG, LLaMA-3, LangGraph, SageMaker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 1.5 }}>
                    <SearchIcon sx={{ color: '#4f46e5' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '0.95rem' },
              }}
            />
          </Paper>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        {/* Category Filters */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1, justifyContent: { xs: 'flex-start', md: 'center' } }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2.2,
                px: 1.5,
                borderRadius: '12px',
                cursor: 'pointer',
                bgcolor: selectedCategory === cat ? '#4f46e5' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#4f46e5' : 'rgba(79,70,229,0.1)',
                '&:hover': {
                  bgcolor: selectedCategory === cat ? '#4338ca' : 'rgba(79,70,229,0.06)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTalent.map((talent) => (
              <Grid xs={12} md={6} key={talent.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: talent.isRegisteredUser ? 'rgba(79,70,229,0.25)' : 'rgba(79,70,229,0.1)',
                    bgcolor: '#ffffff',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 36px rgba(79,70,229,0.08)',
                      borderColor: '#4f46e5',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ p: 3.5, flexGrow: 1 }}>
                    {/* Top Row: Avatar & Basic Info */}
                    <Box sx={{ display: 'flex', gap: 2.5, mb: 2.5 }}>
                      <Avatar
                        src={talent.avatar}
                        alt={talent.name}
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '16px',
                          border: '2px solid rgba(79,70,229,0.2)',
                          bgcolor: '#4f46e5'
                        }}
                      >
                        {talent.name?.[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                            {talent.name}
                          </Typography>
                          {talent.verified && (
                            <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} titleAccess="Verified Top AI Specialist" />
                          )}
                          {talent.isRegisteredUser && (
                            <Chip label="Platform Member" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                          )}
                        </Box>
                        <Typography sx={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                          {talent.role}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748b', fontSize: '0.8rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <LocationOnIcon sx={{ fontSize: 14 }} />
                            {talent.location}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <AssignmentIcon sx={{ fontSize: 14 }} />
                            {talent.completedTasks} tasks done
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bio */}
                    <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, mb: 2.5 }}>
                      {talent.bio}
                    </Typography>

                    {/* Skills Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
                      {talent.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(79,70,229,0.06)',
                            color: '#4f46e5',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                          }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    {/* Bottom Row: Rate & Action Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Rate
                        </Typography>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>
                          ₹{talent.hourlyRate.toLocaleString()}
                          <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                            /hr
                          </Typography>
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={() => handleHireClick(talent)}
                        endIcon={<SendIcon sx={{ fontSize: '16px !important' }} />}
                        sx={{
                          background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          borderRadius: '12px',
                          px: 3,
                          py: 1,
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                          textTransform: 'none',
                          '&:hover': {
                            boxShadow: '0 8px 24px rgba(79,70,229,0.4)',
                          },
                        }}
                      >
                        Invite / Hire
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && filteredTalent.length === 0 && (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 8, borderRadius: '20px', border: '1px dashed rgba(79,70,229,0.2)' }}>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
              No AI Specialists found matching "{searchQuery}"
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>
              Try searching with different keywords like User1, RAG, PyTorch, LLaMA-3, or Next.js.
            </Typography>
            <Button variant="outlined" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} sx={{ borderRadius: '10px' }}>
              Clear Filters
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AITalent;
