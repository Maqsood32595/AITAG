import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip,
  TextField, InputAdornment, Stack, Paper, Avatar, Divider, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/Navbar';
import { blogApi } from '../api';

interface ArticleSummary {
  slug: string;
  title: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  category: string;
  readTime: string;
  excerpt: string;
}

const FALLBACK_ARTICLES: ArticleSummary[] = [
  {
    slug: 'how-businesses-use-aitag-to-cut-operational-costs-with-ai-talent',
    title: 'How Smart Businesses Are Using AI Talent on aitag.in to Lower Operating Costs',
    publishedAt: '2026-08-16',
    author: {
      name: 'AITAG Editorial Team',
      role: 'Business & Marketplace',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    category: 'Business & Productivity',
    readTime: '4 min read',
    excerpt: 'Hiring full-time AI teams is expensive. Here is how founders and operations managers use aitag.in to hire verified AI specialists for specific, high-ROI workflow automations.'
  },
  {
    slug: 'step-by-step-guide-to-hiring-ai-freelancers-on-aitag',
    title: 'A Practical Guide to Hiring Your First AI Specialist on aitag.in',
    publishedAt: '2026-08-10',
    author: {
      name: 'AITAG Community',
      role: 'Hiring & Freelancing',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    category: 'Guides & Tips',
    readTime: '3 min read',
    excerpt: 'A straightforward walkthrough on how to write clear task descriptions, compare bids, and collaborate safely through milestone escrow on aitag.in.'
  }
];

const CATEGORIES = ['All', 'Business & Productivity', 'Guides & Tips'];

const BlogList = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    blogApi.getAll()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setArticles(res.data);
        }
      })
      .catch(() => {
        // Keeps fallback articles smoothly
      });
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
        }}
      >
        <Container maxWidth="md">
          <Chip
            icon={<MenuBookIcon sx={{ fontSize: '16px !important', color: '#4f46e5' }} />}
            label="AITAG Blog & Insights"
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
            Practical Insights on{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI & Business Workflows
            </Box>
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 620, mx: 'auto', mb: 4 }}>
            Learn how modern companies hire AI talent on aitag.in to automate operations and reduce costs.
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
              placeholder="Search articles by topic, keywords, or guides..."
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

      {/* Main Blog Feed */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        {/* Category Filters */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, justifyContent: { xs: 'flex-start', md: 'center' }, overflowX: 'auto', pb: 1 }}>
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

        {/* Articles Grid */}
        <Grid container spacing={4}>
          {filteredArticles.map((article) => (
            <Grid xs={12} md={6} key={article.slug}>
              <Card
                elevation={0}
                component={Link}
                to={`/blog/${article.slug}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  textDecoration: 'none',
                  borderRadius: '20px',
                  border: '1px solid rgba(79,70,229,0.1)',
                  bgcolor: '#ffffff',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 36px rgba(79,70,229,0.08)',
                    borderColor: '#4f46e5',
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Meta Bar: Category & Date */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={article.category}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(79,70,229,0.08)',
                        color: '#4f46e5',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#94a3b8', fontSize: '0.8rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthIcon sx={{ fontSize: 15 }} />
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} />
                        {article.readTime}
                      </Box>
                    </Box>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '-0.5px',
                      mb: 1.5,
                      lineHeight: 1.3,
                      '&:hover': { color: '#4f46e5' },
                    }}
                  >
                    {article.title}
                  </Typography>

                  {/* Excerpt */}
                  <Typography sx={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6, mb: 3, flexGrow: 1 }}>
                    {article.excerpt}
                  </Typography>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Bottom: Author & Read Action */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={article.author.avatar} alt={article.author.name} sx={{ width: 34, height: 34, bgcolor: '#4f46e5', fontSize: '0.8rem' }}>
                        {article.author.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                          {article.author.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {article.author.role}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4f46e5', fontWeight: 700, fontSize: '0.875rem' }}>
                      Read Article <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredArticles.length === 0 && (
          <Paper elevation={0} sx={{ textAlign: 'center', py: 8, borderRadius: '20px', border: '1px dashed rgba(79,70,229,0.2)' }}>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
              No articles found matching "{searchQuery}"
            </Typography>
            <Button variant="outlined" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} sx={{ borderRadius: '10px', mt: 2 }}>
              Clear Search
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default BlogList;
