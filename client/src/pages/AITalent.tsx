import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Avatar,
  Chip, Button, TextField, InputAdornment, Stack, Rating, Divider, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface Talent {
  id: string;
  name: string;
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
}

const TALENT_DATA: Talent[] = [
  {
    id: 'talent-1',
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
    id: 'talent-2',
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
    id: 'talent-3',
    name: 'Vikramaditya Iyer',
    role: 'Full-Stack Agentic AI Developer',
    category: 'Agentic Systems',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
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
    id: 'talent-4',
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
  },
  {
    id: 'talent-5',
    name: 'Rohan Verma',
    role: 'Autonomous AI Red Teamer & Security Expert',
    category: 'Agentic Systems',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    rating: 4.96,
    reviewsCount: 24,
    hourlyRate: 3800,
    completedTasks: 21,
    location: 'Delhi, India',
    bio: 'Penetration tester for LLM applications, prompt injection auditor, and sandbox vulnerability researcher.',
    skills: ['Prompt Hacking', 'OWASP LLM', 'Python', 'Security Audits', 'FastAPI'],
    verified: true,
  },
  {
    id: 'talent-6',
    name: 'Sneha Kulkarni',
    role: 'NLP & Multilingual Speech AI Engineer',
    category: 'LLM & Generative AI',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    rating: 4.94,
    reviewsCount: 33,
    hourlyRate: 3000,
    completedTasks: 31,
    location: 'Chennai, India',
    bio: 'Fine-tuning Whisper and multilingual Indic-BERT models for vernacular voice assistants and customer support bots.',
    skills: ['Whisper', 'HuggingFace', 'Indic-BERT', 'PyTorch', 'Audio DSP'],
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTalent = TALENT_DATA.filter((talent) => {
    const matchesCategory = selectedCategory === 'All' || talent.category === selectedCategory;
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            label="Verified Global AI Specialists"
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
              placeholder="Search by skill (e.g. RAG, LLaMA-3, YOLOv10, LangGraph, SageMaker)..."
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

        {/* Talent Grid */}
        <Grid container spacing={3}>
          {filteredTalent.map((talent) => (
            <Grid xs={12} md={6} key={talent.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  border: '1px solid rgba(79,70,229,0.1)',
                  bgcolor: '#ffffff',
                  transition: 'all 0.25s ease',
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
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
                          {talent.name}
                        </Typography>
                        {talent.verified && (
                          <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} titleAccess="Verified Top AI Specialist" />
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

        {filteredTalent.length === 0 && (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 8, borderRadius: '20px', border: '1px dashed rgba(79,70,229,0.2)' }}>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
              No AI Specialists found matching "{searchQuery}"
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>
              Try searching with different keywords like RAG, PyTorch, LLaMA-3, or Next.js.
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
