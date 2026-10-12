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
import { getHappyPastelAvatar } from '../utils/avatar';

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
    role: 'AI Product Photo & Catalogue Makeover Specialist',
    category: 'Product Visuals',
    avatar: getHappyPastelAvatar('Dr. Aarav Sharma'),
    rating: 4.98,
    reviewsCount: 42,
    hourlyRate: 1200,
    completedTasks: 38,
    location: 'Bengaluru, India',
    bio: 'Specialist in studio-quality AI product photo transformations, background removal, lighting correction, and marketplace compliance for Amazon, Flipkart, Meesho, and WhatsApp catalogues.',
    skills: ['AI Photo Makeover', 'White Backgrounds', 'Marketplace Compliance', 'Lighting Fixes', 'Catalogue Mockups', 'Photoshop AI'],
    verified: true,
  },
  {
    id: 'curated-2',
    name: 'Priya Mukherjee',
    role: 'AI E-Commerce Listing & Multilingual Copy Specialist',
    category: 'E-Commerce & Copy',
    avatar: getHappyPastelAvatar('Priya Mukherjee'),
    rating: 4.95,
    reviewsCount: 29,
    hourlyRate: 800,
    completedTasks: 27,
    location: 'Hyderabad, India',
    bio: 'Writes high-ranking product titles, bullet points, and persuasive descriptions in English, Hindi, and regional languages for Amazon, Flipkart, Meesho, and Shopify.',
    skills: ['Product Listing Copy', 'Amazon SEO Keywords', 'Flipkart Descriptions', 'Hindi/English Copy', 'Buyer Search Tags', 'Return Reduction Copy'],
    verified: true,
  },
  {
    id: 'curated-3',
    name: 'Vikramaditya Iyer',
    role: 'AI Social Media Content & Campaign Creator',
    category: 'Social & Marketing',
    avatar: getHappyPastelAvatar('Vikramaditya Iyer'),
    rating: 4.92,
    reviewsCount: 51,
    hourlyRate: 1200,
    completedTasks: 49,
    location: 'Mumbai, India',
    bio: 'Designs monthly social media content calendars, festive promotional banners, Instagram carousel kits, and viral captions with targeted hashtags for small businesses.',
    skills: ['Monthly Content Calendars', 'Festival Creatives', 'Instagram Carousels', 'Engaging Captions', 'Hashtag Research', 'Canva AI'],
    verified: true,
  },
  {
    id: 'curated-4',
    name: 'Ananya Deshmukh',
    role: 'AI Website & High-Converting Landing Page Builder',
    category: 'Web & Funnels',
    avatar: getHappyPastelAvatar('Ananya Deshmukh'),
    rating: 4.99,
    reviewsCount: 36,
    hourlyRate: 1500,
    completedTasks: 34,
    location: 'Pune, India',
    bio: 'Builds fast, mobile-friendly one-page business websites with one-tap WhatsApp chat buttons, lead enquiry forms, Google Map integration, and search visibility.',
    skills: ['1-Page Business Websites', 'WhatsApp Click-to-Chat', 'Mobile Responsive', 'Lead Enquiry Forms', 'Google Maps & SEO', 'Fast Launch'],
    verified: true,
  }
];

const CATEGORIES = [
  'All',
  'Product Visuals',
  'E-Commerce & Copy',
  'Social & Marketing',
  'Web & Funnels'
];

import InviteModal from '../components/InviteModal';
import TalentShowcaseModal from '../components/TalentShowcaseModal';

const AITalent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [talents, setTalents] = useState<Talent[]>(CURATED_TALENT);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [selectedShowcaseTalent, setSelectedShowcaseTalent] = useState<any>(null);

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const res = await authApi.getUsers();
        const rawUsers = res.data || [];

        // Deduplicate registered users and consolidate legacy records
        const uniqueUsersMap = new Map();

        rawUsers.forEach((u: any) => {
          const cleanEmail = (u.email || '').trim().toLowerCase();
          const cleanName = (u.name || '').trim();

          // Consolidate legacy 'Mohammed Maqsood' into verified 'Maqs'
          if (cleanEmail === 'l.maqsood.m@gmail.com' || cleanEmail === 'maqsood@gmail.com' || cleanName === 'Mohammed Maqsood' || cleanName === 'Maqs') {
            if (!uniqueUsersMap.has('l.maqsood.m@gmail.com')) {
              uniqueUsersMap.set('l.maqsood.m@gmail.com', {
                id: 'f8dbf2cc-36a9-4228-bb50-13024787fd35',
                name: 'Maqs',
                email: 'l.maqsood.m@gmail.com',
                role: 'freelancer',
                photo_url: u.photo_url || getHappyPastelAvatar('Maqs')
              });
            }
          } else if (cleanEmail === 'user1@aitag.com' || cleanName === 'User1 Admin' || cleanName === 'User1') {
            if (!uniqueUsersMap.has('user1@aitag.com')) {
              uniqueUsersMap.set('user1@aitag.com', {
                id: '6e36f593-b9e6-4ead-8266-31ac91cf44c5',
                name: 'User1',
                email: 'user1@aitag.com',
                role: 'admin',
                photo_url: u.photo_url || getHappyPastelAvatar('User1')
              });
            }
          } else if (cleanEmail && !uniqueUsersMap.has(cleanEmail)) {
            uniqueUsersMap.set(cleanEmail, u);
          }
        });

        const dedupedUsers = Array.from(uniqueUsersMap.values());

        // Transform registered users into Talent cards mapped to our 4 core service categories
        const registeredTalent: Talent[] = dedupedUsers.map((u: any) => {
          const isUser1 = u.email?.toLowerCase().includes('user1');
          const isMaqsood = u.email?.toLowerCase().includes('maqsood') || u.name === 'Maqs';

          return {
            id: u.id,
            name: u.name || u.email.split('@')[0],
            email: u.email,
            role: isUser1
              ? 'AI Landing Page & Conversion Funnel Specialist'
              : isMaqsood
              ? 'AI Product Visuals & Catalogue Lead'
              : `${u.role === 'admin' ? 'Admin / ' : ''}AI Business Service Specialist`,
            category: isUser1 ? 'Web & Funnels' : isMaqsood ? 'Product Visuals' : 'E-Commerce & Copy',
            avatar: u.photo_url || getHappyPastelAvatar(u.name || u.email),
            rating: 5.0,
            reviewsCount: isUser1 ? 19 : isMaqsood ? 42 : 14,
            hourlyRate: isUser1 ? 1800 : isMaqsood ? 2500 : 1200,
            completedTasks: isUser1 ? 19 : isMaqsood ? 42 : 8,
            location: 'India',
            bio: isUser1
              ? 'Registered AITAG Platform Specialist (ADMIN). Vetted expert in rapid AI one-page website creation, mobile responsive design, and WhatsApp lead funnels.'
              : isMaqsood
              ? 'Registered AITAG Platform Specialist (FREELANCER). Vetted expert in AI product photo makeovers, high-conversion catalogue visuals, and marketplace compliance.'
              : `Registered AITAG Platform Specialist (${u.role.toUpperCase()}). Vetted provider for AI-powered business services and practical outcomes.`,
            skills: isUser1
              ? ['AI Landing Pages', 'Mobile Web Funnels', 'WhatsApp Integration', 'Conversion Copy', 'Fast Deployment', 'SEO Setup']
              : isMaqsood
              ? ['AI Product Photos', 'White Backgrounds', 'Lifestyle Mockups', 'Amazon/Flipkart Optimizations', 'Catalogue Styling', 'Photoshop AI']
              : ['Product Copy', 'Social Media', 'Landing Pages', 'Marketplace SEO'],
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
      setSelectedTalent(talent);
      setInviteModalOpen(true);
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
            label="Verified AITAG AI Specialists & Vetted Providers"
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
            Hire Vetted{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Business Specialists
            </Box>
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 650, mx: 'auto', mb: 4 }}>
            Pre-vetted specialists ready to deliver product photo makeovers, high-ranking e-commerce listings, monthly social media packs, and high-converting landing pages.
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
              placeholder="Search by service or specialist (e.g. Photo Makeover, Amazon Listing, Social Media, Landing Page, Maqs, User1)..."
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

                    {/* Bottom Row: Rate & Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
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

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedShowcaseTalent(talent);
                            setShowcaseModalOpen(true);
                          }}
                          sx={{
                            borderRadius: '10px',
                            color: '#4f46e5',
                            borderColor: 'rgba(79,70,229,0.3)',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                          }}
                        >
                          🎬 View Workflows
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleHireClick(talent)}
                          endIcon={<SendIcon sx={{ fontSize: '14px !important' }} />}
                          sx={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            borderRadius: '10px',
                            px: 2,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                            textTransform: 'none',
                          }}
                        >
                          Invite
                        </Button>
                      </Stack>
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
              Try searching with services like Product Photos, Amazon Descriptions, Social Media, or Landing Pages.
            </Typography>
            <Button variant="outlined" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} sx={{ borderRadius: '10px' }}>
              Clear Filters
            </Button>
          </Paper>
        )}
      </Container>

      {/* Talent Showcase Modal (Delivered Workflows + Video Demos) */}
      <TalentShowcaseModal
        open={showcaseModalOpen}
        onClose={() => setShowcaseModalOpen(false)}
        talent={selectedShowcaseTalent}
        onInvite={(t) => handleHireClick(t)}
      />

      {/* Invite Talent Modal */}
      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        talent={selectedTalent}
      />
    </Box>
  );
};

export default AITalent;
