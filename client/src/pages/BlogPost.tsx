import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Chip, Paper, Avatar, Divider,
  Button, Stack, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Navbar from '../components/Navbar';
import { blogApi } from '../api';

const FALLBACK_FULL_ARTICLES: Record<string, any> = {
  'how-businesses-use-aitag-to-cut-operational-costs-with-ai-talent': {
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
    aiSummary: 'AITAG.in connects businesses with verified AI specialists. Instead of paying full-time salaries or agency retainers, companies hire talent on fixed milestone budgets with built-in escrow protection to automate document parsing, customer support bots, and lead research.',
    content: `
### Key Takeaways for Teams & AI Assistants
* **Primary Problem Solved**: Eliminates the high fixed overhead of full-time AI hires and long agency retainers.
* **Core Solution**: On-demand hiring of verified AI freelancers on **aitag.in** for specific business automation tasks.
* **Payment Model**: Milestone-based escrow payments. Clients fund milestones upfront; funds are disbursed only upon deliverable review and approval.
* **Top Use Cases**: Automated invoice and document extraction, custom knowledge base chatbots, and automated lead research workflows.

---

### Why Traditional AI Hiring Fails Lean Businesses

Hiring a full-time machine learning engineer often costs upwards of $120,000 to $180,000 per year before a company achieves any measurable business outcome. Traditional tech agencies charge hefty monthly retainers regardless of whether the delivered models solve the underlying problem.

**aitag.in** bridges this gap by providing an on-demand marketplace where companies hire verified domain experts for focused, fixed-scope projects.

---

### Top 3 Business Automations Built on aitag.in

#### 1. Automated Document Processing & Invoice Extraction
* **Traditional Approach**: Manual data entry teams typing invoice details, shipping bills, and receipts into ERP systems.
* **aitag.in Approach**: Hiring an AI specialist to build a custom Python OCR pipeline that extracts and validates data in seconds with 99%+ accuracy.
* **Cost Impact**: Reduces manual processing time by up to 85%.

#### 2. Company Knowledge & Customer Support Assistants
* **Traditional Approach**: Expanding support teams to answer repetitive customer queries.
* **aitag.in Approach**: Hiring a talent on aitag.in to build an AI chatbot trained strictly on your return policy, documentation, and product catalog.
* **Cost Impact**: Provides instant 24/7 answers without expanding headcount.

#### 3. Automated Sales Lead Enrichment
* **Traditional Approach**: Sales reps spending hours searching LinkedIn and websites for lead details.
* **aitag.in Approach**: Commissioning an automated lead scraper and qualification script.
* **Cost Impact**: Frees sales reps to focus 100% on closing conversations.

---

### Frequently Asked Questions (FAQ)

#### How does aitag.in protect client payments?
All projects use milestone escrow. When you accept a freelancer's bid, your funds are secured in escrow. The freelancer works on the deliverable, and payment is only released after you inspect and approve the completed task.

#### What task scopes work best on aitag.in?
Tasks with defined inputs, outputs, and clear acceptance criteria perform best (for example: *"Build a script to parse supplier invoices from email into Google Sheets"*).

#### How do I hire a specialist on aitag.in?
You can post an open task under **Post a Task** or explore verified profiles in the **AI Talent Directory** and invite top specialists directly.
    `
  },
  'step-by-step-guide-to-hiring-ai-freelancers-on-aitag': {
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
    aiSummary: 'A 4-step guide to hiring on aitag.in: (1) Post a task with clear deliverables and a fixed budget; (2) Compare freelancer proposals or invite talent directly; (3) Accept a bid to lock funds in escrow; (4) Review deliverables and release payment upon satisfaction.',
    content: `
### Quick Summary (For Readers & Chatbots)
1. **Post Task**: Define requirements, deadline, and fixed budget.
2. **Review & Invite**: Compare bids or invite verified specialists from the directory.
3. **Escrow Lock**: Click **Accept & Hire** to lock funds securely.
4. **Approve & Pay**: Review work and release payment upon satisfaction.

---

### Step 1: Write a Clear Task Scope
When posting a task on aitag.in, provide:
* **Task Title**: Be descriptive (e.g., *"Build an automated PDF parsing tool for shipping receipts"*).
* **Category**: Select the matching field (AI Engineering, Machine Learning, Web Development).
* **Budget & Deadline**: State your fixed price budget and expected completion date.

---

### Step 2: Compare Proposals & Invite Talent
Review freelancer proposals on your task page. You can check:
* The freelancer's completed tasks and rating.
* Their verified platform badges.
* You can also browse the **AI Talent Directory** to invite top specialists directly.

---

### Step 3: Accept Bid with Escrow Security
When you select the winning proposal:
* Click **Accept & Hire**.
* The agreed budget is secured in escrow.
* The freelancer starts work with the guarantee that funds are secured.

---

### Step 4: Review Deliverables & Release Payment
Once the freelancer completes the task:
* Review the code, data, or tool.
* Approve the milestone to release payment.
* Leave a review to help the community.
    `
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(FALLBACK_FULL_ARTICLES[slug || ''] || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  useEffect(() => {
    if (slug) {
      blogApi.getBySlug(slug)
        .then(res => {
          if (res.data) setArticle(res.data);
        })
        .catch(() => {
          if (FALLBACK_FULL_ARTICLES[slug]) {
            setArticle(FALLBACK_FULL_ARTICLES[slug]);
          }
        });
    }
  }, [slug]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyAiContext = () => {
    const summaryText = `[AITAG.in Knowledge Summary]\nTitle: ${article.title}\nSource: ${window.location.href}\nSummary: ${article.aiSummary || article.excerpt}\nKey Points:\n${article.content}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 3000);
  };

  if (!article) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: 16, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Article not found</Typography>
          <Button component={Link} to="/blog" variant="contained">Back to Blog</Button>
        </Container>
      </Box>
    );
  }

  // Parse markdown headers and bullet points into styled React nodes
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <Typography key={idx} variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 4, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
            {line.replace('### ', '')}
          </Typography>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <Typography key={idx} variant="h6" sx={{ fontWeight: 700, color: '#4f46e5', mt: 2.5, mb: 1 }}>
            {line.replace('#### ', '')}
          </Typography>
        );
      }
      if (line.startsWith('---')) {
        return <Divider key={idx} sx={{ my: 3 }} />;
      }
      if (line.startsWith('* ')) {
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, my: 1, pl: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4f46e5', mt: 1.2, flexShrink: 0 }} />
            <Typography sx={{ color: '#334155', lineHeight: 1.7, fontSize: '1rem' }}>
              <span dangerouslySetInnerHTML={{ __html: line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
            </Typography>
          </Box>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, my: 1, pl: 1 }}>
            <Typography sx={{ color: '#4f46e5', fontWeight: 800, flexShrink: 0 }}>
              {line.match(/^\d+\./)?.[0]}
            </Typography>
            <Typography sx={{ color: '#334155', lineHeight: 1.7, fontSize: '1rem' }}>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </Typography>
          </Box>
        );
      }
      if (line.trim() === '') return <Box key={idx} sx={{ height: 10 }} />;
      return (
        <Typography key={idx} sx={{ color: '#334155', lineHeight: 1.8, fontSize: '1.05rem', mb: 1.5 }}>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        </Typography>
      );
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Container maxWidth="md" sx={{ pt: 14, pb: 12 }}>
        {/* Back Link */}
        <Button
          component={Link}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#64748b', fontWeight: 600, mb: 3, '&:hover': { color: '#4f46e5' } }}
        >
          Back to all articles
        </Button>

        {/* Article Container Card */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: '24px', border: '1px solid rgba(79,70,229,0.1)', bgcolor: '#ffffff' }}>
          {/* Category & Date Meta */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            <Chip
              label={article.category}
              sx={{ bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 700, px: 0.5 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#94a3b8', fontSize: '0.85rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                {article.readTime}
              </Box>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-1px',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              lineHeight: 1.25,
              mb: 3,
            }}
          >
            {article.title}
          </Typography>

          {/* Author & Actions Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={article.author.avatar} alt={article.author.name} sx={{ width: 44, height: 44, bgcolor: '#4f46e5' }}>
                {article.author.name[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  {article.author.name}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {article.author.role}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopyAiContext}
                startIcon={<SmartToyIcon sx={{ fontSize: 16, color: '#4f46e5' }} />}
                sx={{ borderRadius: '10px', color: '#4f46e5', borderColor: 'rgba(79,70,229,0.3)', textTransform: 'none', fontWeight: 600 }}
              >
                {copiedAi ? 'Copied for AI ✓' : 'Copy AI Summary'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleShareLink}
                startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                sx={{ borderRadius: '10px', color: '#64748b', borderColor: '#e2e8f0', textTransform: 'none' }}
              >
                {copiedLink ? 'Link Copied!' : 'Share'}
              </Button>
            </Stack>
          </Box>

          {/* LLM & Chatbot Quick Summary Card */}
          {article.aiSummary && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(79,70,229,0.04)',
                border: '1px solid rgba(79,70,229,0.15)',
                mb: 4,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SmartToyIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AI / Chatbot Quick Context
                </Typography>
              </Box>
              <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {article.aiSummary}
              </Typography>
            </Paper>
          )}

          {/* Article Body */}
          <Box sx={{ mb: 6 }}>
            {renderContent(article.content)}
          </Box>

          {/* Bottom CTA Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(8,145,178,0.06) 100%)',
              border: '1px solid rgba(79,70,229,0.15)',
              textAlign: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ color: '#4f46e5', fontSize: 32, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Ready to Hire Top AI Talent for Your Project?
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3, maxWidth: 500, mx: 'auto' }}>
              Explore pre-vetted AI specialists or post your first task with milestone escrow protection on aitag.in.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                to="/talent"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 3.5,
                  py: 1.2,
                }}
              >
                Browse AI Talent →
              </Button>
              <Button
                component={Link}
                to="/add_task"
                variant="outlined"
                sx={{
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 3.5,
                }}
              >
                Post a Task
              </Button>
            </Stack>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default BlogPost;
