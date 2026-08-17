/**
 * AITAG Profile & Delivered Workflows Service
 * Fractal Kernel Slice: aitag-profile
 */

const supabase = require('../../supabase');

// Curated & Dynamic Profiles Store in Memory
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
      website: 'https://aitag.in'
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
  }],
  ['curated-1', {
    userId: 'curated-1',
    name: 'Dr. Aarav Sharma',
    role: 'Senior LLM & RAG Architect',
    headline: 'Senior LLM & RAG Architect',
    bio: 'Ex-AI Research Lead specializing in fine-tuning open-source LLMs (LLaMA-3, Mistral) and enterprise RAG pipelines with Pinecone and LangChain.',
    hourlyRate: 3500,
    skills: ['LLaMA-3', 'LangChain', 'Pinecone', 'Python', 'FastAPI', 'PyTorch'],
    links: {
      github: 'https://github.com/Maqsood32595',
      linkedin: 'https://linkedin.com/in/maqsood',
      website: 'https://aitag.in'
    },
    deliveredWorkflows: [
      {
        id: 'wf-rag-1',
        title: 'Enterprise Legal Document RAG Search Pipeline',
        category: 'LLM & Generative AI',
        businessImpact: 'Indexed 1.2M legal PDF documents with sub-60ms semantic search latency and zero hallucinations.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        techStack: ['LLaMA-3', 'Pinecone', 'LangChain', 'FastAPI', 'PyTorch'],
        liveUrl: 'https://github.com/Maqsood32595/legal-rag-pipeline'
      },
      {
        id: 'wf-rag-2',
        title: 'Multi-Tenant LLM Gateway with Dynamic Rate Limiting',
        category: 'AI Infrastructure',
        businessImpact: 'Reduced enterprise LLM API expenditure by 42% via prompt caching and fallback routing.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        techStack: ['Python', 'Redis', 'LiteLLM', 'FastAPI', 'Docker'],
        liveUrl: 'https://github.com/Maqsood32595/llm-gateway'
      }
    ]
  }],
  ['curated-2', {
    userId: 'curated-2',
    name: 'Priya Mukherjee',
    role: 'Computer Vision & Edge AI Engineer',
    headline: 'Computer Vision & Edge AI Engineer',
    bio: 'Specialist in real-time defect detection, YOLOv10 deployment, OCR document mining, and low-latency ONNX runtime optimizations.',
    hourlyRate: 2800,
    skills: ['YOLOv10', 'OpenCV', 'PyTorch', 'TensorRT', 'Edge AI', 'Docker'],
    links: {
      github: 'https://github.com/Maqsood32595',
      linkedin: 'https://linkedin.com/in/maqsood',
      website: 'https://aitag.in'
    },
    deliveredWorkflows: [
      {
        id: 'wf-cv-1',
        title: 'Real-Time Industrial Defect Detection with YOLOv10',
        category: 'Computer Vision',
        businessImpact: 'Processed 120 FPS video streams on edge NVIDIA Jetson devices with 99.4% precision.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        techStack: ['YOLOv10', 'OpenCV', 'TensorRT', 'C++', 'Python'],
        liveUrl: 'https://github.com/Maqsood32595/edge-cv'
      }
    ]
  }]
]);

class ProfileService {
  async getProfileByUserId(userId) {
    // 1. Check curated / in-memory cache first
    const cached = PROFILES_CACHE.get(userId);
    if (cached) return cached;

    // 2. Fetch user base record from Supabase
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

    const name = user?.name || 'AITAG Specialist';
    const email = user?.email || '';
    const role = user?.role || 'freelancer';
    const photoUrl = user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`;

    return {
      userId,
      name,
      email,
      role,
      photoUrl,
      headline: role === 'admin' ? 'Full-Stack AI Engineer & Admin' : 'Senior AI Researcher & Specialist',
      bio: 'Delivering production-grade AI automations, email pipelines, and machine learning tools.',
      hourlyRate: role === 'admin' ? 3500 : 2800,
      skills: ['Python', 'LangGraph', 'FastAPI', 'Supabase', 'TypeScript'],
      links: {
        github: 'https://github.com/Maqsood32595',
        linkedin: 'https://linkedin.com/in/maqsood',
        website: 'https://aitag.in'
      },
      deliveredWorkflows: [
        {
          id: 'wf-def-1',
          title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
          category: 'Email Automation & Growth',
          businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability.',
          demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
          liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
        },
        {
          id: 'wf-def-2',
          title: 'Facebook & Meta Ads AI Optimization Engine',
          category: 'Growth & Ads',
          businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
          demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
          liveUrl: 'https://user1.ai/meta-ads-case-study'
        }
      ],
      updatedAt: new Date().toISOString()
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
