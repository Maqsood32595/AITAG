import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip,
  Stack, Paper, Avatar, Divider, Button
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    return selectedCategory === 'All' || article.category === selectedCategory;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ pt: 14, pb: 12 }}>
        {/* Clean Header Bar with Quick Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-1px',
              }}
            >
              AITAG Blog & Articles
            </Typography>
            <Typography sx={{ color: '#64748b', mt: 0.5, fontSize: '0.95rem' }}>
              Practical guides, case studies, and insights for hiring AI specialists on aitag.in
            </Typography>
          </Box>

          {/* Quick Action Navigation Buttons */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1 }}>
            <Button
              component={Link}
              to="/all_tasks"
              variant="outlined"
              sx={{
                borderRadius: '10px',
                color: '#4f46e5',
                borderColor: 'rgba(79,70,229,0.3)',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' },
              }}
            >
              Browse Tasks
            </Button>
            <Button
              component={Link}
              to="/talent"
              variant="outlined"
              sx={{
                borderRadius: '10px',
                color: '#0891b2',
                borderColor: 'rgba(8,145,178,0.3)',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                '&:hover': { borderColor: '#0891b2', bgcolor: 'rgba(8,145,178,0.04)' },
              }}
            >
              AI Talent Directory
            </Button>
            <Button
              component={Link}
              to="/add_task"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
              }}
            >
              + Post a Task
            </Button>
          </Stack>
        </Box>

        {/* Category Filters */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2,
                px: 1.5,
                borderRadius: '10px',
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
      </Container>
    </Box>
  );
};

export default BlogList;
