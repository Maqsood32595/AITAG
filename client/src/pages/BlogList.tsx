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
import AnimatedAvatar from '../components/AnimatedAvatar';
import { blogApi } from '../api';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LanguageIcon from '@mui/icons-material/Language';

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

const getBlogCategoryIcon = (category: string) => {
  if (category?.toLowerCase().includes('business')) return <AutoAwesomeIcon sx={{ fontSize: 13, color: '#38bdf8' }} />;
  if (category?.toLowerCase().includes('guide') || category?.toLowerCase().includes('tip')) return <EditNoteIcon sx={{ fontSize: 13, color: '#fbbf24' }} />;
  return <LanguageIcon sx={{ fontSize: 13, color: '#34d399' }} />;
};

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

      <Container maxWidth="lg" sx={{ pt: 14, pb: 12 }}>
        {/* Section Header - Central Pattern */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#4f46e5' }} />}
            label="AITAG KNOWLEDGE BASE — GUIDES & CASE STUDIES"
            sx={{
              bgcolor: '#eef2ff',
              color: '#4338ca',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
              mb: 2,
              px: 1
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            color="#0f172a"
            sx={{
              letterSpacing: '-1px',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1.5,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            AITAG Blog & Case Studies
          </Typography>
          <Typography
            variant="body1"
            fontWeight={500}
            color="#64748b"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              mb: 4
            }}
          >
            “Practical guides, tutorials, and field insights for hiring vetted AI specialists to scale operations and business revenue.”
          </Typography>
        </Box>

        {/* Centered Category Filters */}
        <Stack direction="row" spacing={1} sx={{ mb: 4.5, overflowX: 'auto', pb: 1, justifyContent: 'center' }}>
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

        {/* Articles List */}
        <Stack spacing={3} sx={{ width: '100%' }}>
          {filteredArticles.map((article) => {
            const articleImage = (article as any).image || (
              article.category.toLowerCase().includes('business')
                ? 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
            );

            return (
              <Card
                key={article.slug}
                elevation={0}
                component={Link}
                to={`/blog/${article.slug}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '310px',
                  minHeight: '310px',
                  maxHeight: '310px',
                  width: '100%',
                  boxSizing: 'border-box',
                  textDecoration: 'none',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  bgcolor: '#ffffff',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 28px rgba(79,70,229,0.08)',
                    borderColor: '#4f46e5',
                  },
                }}
              >
                {/* Cover Image matching #packages style */}
                <Box sx={{ position: 'relative', height: 160, width: '100%', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                  <img
                    src={articleImage}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Category Pill Top-Left */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      px: 1.2,
                      py: 0.4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: 0.3
                    }}
                  >
                    {getBlogCategoryIcon(article.category)}
                    {article.category}
                  </Box>
                  {/* Read Time Pill Top-Right */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(79, 70, 229, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      px: 1.2,
                      py: 0.4,
                      fontSize: '0.68rem',
                      fontWeight: 700
                    }}
                  >
                    {article.readTime}
                  </Box>
                </Box>

                <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    {/* Title */}
                    <Typography
                      sx={{
                        fontWeight: 750,
                        fontSize: '0.98rem',
                        color: '#0f172a',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.3px',
                        mb: 0.6,
                        lineHeight: 1.35,
                        minHeight: '2.6rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {article.title}
                    </Typography>

                    {/* Excerpt */}
                    <Typography
                      sx={{
                        color: '#64748b',
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                        mb: 1,
                        minHeight: '2.35rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {article.excerpt}
                    </Typography>
                  </Box>

                  <Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AnimatedAvatar src={article.author.avatar} name={article.author.name} size={26} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a', lineHeight: 1.2 }}>
                            {article.author.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#4f46e5', fontWeight: 700, fontSize: '0.78rem' }}>
                        Read Guide <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default BlogList;
