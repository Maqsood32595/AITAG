/**
 * AITAG Profile & Delivered Workflows Service
 * Fractal Kernel Slice: aitag-profile
 */

const supabase = require('../../supabase');

// In-Memory store for fast fallback & caching
const PROFILES_CACHE = new Map([
  ['6e36f593-b9e6-4ead-8266-31ac91cf44c5', {
    userId: '6e36f593-b9e6-4ead-8266-31ac91cf44c5',
    name: 'User1',
    email: 'user1@aitag.com',
    role: 'admin',
    headline: 'Principal AI Systems Architect & Automation Specialist',
    bio: 'Specializing in high-ROI automation pipelines, email deliverability engines, and Meta ads optimization.',
    hourlyRate: 3500,
    skills: ['Email Automation', 'Meta Marketing API', 'Python', 'FastAPI', 'LangGraph'],
    links: {
      github: 'https://github.com/Maqsood32595',
      linkedin: 'https://linkedin.com/in/maqsood',
      website: 'https://aitag.in',
      twitter: 'https://x.com/aitag_ai'
    },
    deliveredWorkflows: [
      {
        id: 'wf-1',
        title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
        category: 'Email Automation & Growth',
        businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
        liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
      },
      {
        id: 'wf-2',
        title: 'Facebook & Meta Ads AI Optimization Engine',
        category: 'Growth & Ads',
        businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
        liveUrl: 'https://user1.ai/meta-ads-case-study'
      }
    ]
  }]
]);

class ProfileService {
  async getProfileByUserId(userId) {
    // 1. Fetch user base record
    let user = null;
    try {
      const { data } = await supabase
        .from('aitag_users')
        .select('id, name, email, role, photo_url')
        .eq('id', userId)
        .single();
      user = data;
    } catch {
      // Fallback
    }

    const cached = PROFILES_CACHE.get(userId) || {};

    const name = user?.name || cached.name || 'AI Specialist';
    const email = user?.email || cached.email || '';
    const role = user?.role || cached.role || 'freelancer';
    const photoUrl = user?.photo_url || cached.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`;

    return {
      userId,
      name,
      email,
      role,
      photoUrl,
      headline: cached.headline || (role === 'admin' ? 'Full-Stack AI Engineer & Admin' : 'Senior AI Researcher & Specialist'),
      bio: cached.bio || 'Delivering production-grade AI automations, agentic swarms, and data pipelines.',
      hourlyRate: cached.hourlyRate || (role === 'admin' ? 3500 : 2800),
      skills: cached.skills || ['Python', 'LangGraph', 'FastAPI', 'Supabase', 'TypeScript'],
      links: cached.links || {
        github: 'https://github.com/Maqsood32595',
        linkedin: 'https://linkedin.com/in/maqsood',
        website: 'https://aitag.in'
      },
      deliveredWorkflows: cached.deliveredWorkflows || [
        {
          id: 'wf-default-1',
          title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
          category: 'Email Automation & Growth',
          businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability.',
          demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
          liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
        },
        {
          id: 'wf-default-2',
          title: 'Facebook & Meta Ads AI Optimization Engine',
          category: 'Growth & Ads',
          businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
          demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
          liveUrl: 'https://user1.ai/meta-ads-case-study'
        }
      ],
      updatedAt: cached.updatedAt || new Date().toISOString()
    };
  }

  async updateProfile(userId, updateData) {
    const existing = await this.getProfileByUserId(userId);

    const updated = {
      ...existing,
      headline: updateData.headline !== undefined ? updateData.headline : existing.headline,
      bio: updateData.bio !== undefined ? updateData.bio : existing.bio,
      hourlyRate: updateData.hourlyRate !== undefined ? Number(updateData.hourlyRate) : existing.hourlyRate,
      skills: updateData.skills !== undefined ? updateData.skills : existing.skills,
      links: {
        ...(existing.links || {}),
        ...(updateData.links || {})
      },
      deliveredWorkflows: updateData.deliveredWorkflows !== undefined ? updateData.deliveredWorkflows : existing.deliveredWorkflows,
      updatedAt: new Date().toISOString()
    };

    PROFILES_CACHE.set(userId, updated);
    return updated;
  }
}

module.exports = new ProfileService();
