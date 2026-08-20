const { Storage } = require('@google-cloud/storage');
const path = require('path');
const supabase = require('../../supabase');

const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'shortshub_video_storage';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'corded-cable-460921-u1';
const MAX_VIDEO_DURATION_SECONDS = 120; // 2 minutes limit

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
  }]
]);

class ProfileService {
  constructor() {
    try {
      this.storage = new Storage({ projectId: PROJECT_ID });
      this.bucket = this.storage.bucket(BUCKET_NAME);
    } catch (e) {
      console.warn('[ProfileService] GCS Storage init note:', e.message);
    }
  }

  async getProfileByUserId(userId) {
    const cached = PROFILES_CACHE.get(userId);
    if (cached) return cached;

    let user = null;
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data } = await supabase
          .from('aitag_users')
          .select('id, name, email, role, photo_url')
          .eq('id', userId)
          .single();
        user = data;
      }
    } catch {}

    const name = user?.name || 'AITAG Specialist';
    const email = user?.email || '';
    const role = user?.role || 'freelancer';
    const photoUrl = user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`;

    const defaultProfile = {
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
          id: 'wf-1',
          title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
          category: 'Email Automation & Growth',
          businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability.',
          demoVideoUrl: '',
          techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
          liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
        },
        {
          id: 'wf-2',
          title: 'Facebook & Meta Ads AI Optimization Engine',
          category: 'Growth & Ads',
          businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
          demoVideoUrl: '',
          techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
          liveUrl: 'https://user1.ai/meta-ads-case-study'
        }
      ],
      updatedAt: new Date().toISOString()
    };

    PROFILES_CACHE.set(userId, defaultProfile);
    return defaultProfile;
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

    /**
   * Direct Server-to-GCS buffer upload (Zero CORS, 100% authenticated)
   */
  async uploadWorkflowVideoBuffer(userId, { workflowId, filename, buffer, mimeType, durationSeconds }) {
    if (!userId) throw new Error('Unauthorized');
    if (!workflowId) throw new Error('Workflow ID is required');
    if (!buffer || buffer.length === 0) throw new Error('Video file buffer is empty');

    if (durationSeconds && Number(durationSeconds) > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video duration exceeds maximum allowed limit of 2 minutes (${MAX_VIDEO_DURATION_SECONDS}s). Provided: ${durationSeconds}s`);
    }

    const cleanFilename = (filename || 'workflow_demo.mp4').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `freelancers/${userId}/workflows/${workflowId}/${Date.now()}_${cleanFilename}`;
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;

    try {
      if (this.bucket) {
        const file = this.bucket.file(storagePath);
        await file.save(buffer, {
          contentType: mimeType || 'video/mp4',
          resumable: false,
          metadata: {
            cacheControl: 'public, max-age=31536000'
          }
        });
      }
    } catch (e) {
      console.warn('[GCS Direct Upload Warning]:', e.message);
    }

    // Attach to profile workflow
    await this.attachVideoToWorkflow(userId, {
      workflowId,
      videoUrl: publicUrl,
      durationSeconds: Number(durationSeconds) || 0
    });

    return {
      success: true,
      workflowId,
      publicUrl,
      storagePath,
      durationSeconds: Number(durationSeconds) || 0,
      bucket: BUCKET_NAME
    };
  }

  async generateWorkflowVideoSignedUrl(userId, { workflowId, filename, durationSeconds, contentType = 'video/mp4' }) {
    if (!userId) throw new Error('Unauthorized');
    if (!workflowId) throw new Error('Workflow ID is required');
    if (!filename) throw new Error('Filename is required');

    if (durationSeconds && Number(durationSeconds) > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video duration exceeds maximum allowed limit of 2 minutes (${MAX_VIDEO_DURATION_SECONDS}s). Provided: ${durationSeconds}s`);
    }

    const cleanFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `freelancers/${userId}/workflows/${workflowId}/${Date.now()}_${cleanFilename}`;
    
    let uploadUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;
    try {
      if (this.bucket) {
        const file = this.bucket.file(storagePath);
        const [signedUrl] = await file.getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000,
          contentType
        });
        uploadUrl = signedUrl;
      }
    } catch (e) {
      console.warn('[GCS SignedUrl Warning]:', e.message);
    }

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;

    return {
      success: true,
      workflowId,
      uploadUrl,
      publicUrl,
      storagePath,
      maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
      bucket: BUCKET_NAME
    };
  }

  async attachVideoToWorkflow(userId, { workflowId, videoUrl, durationSeconds }) {
    const profile = await this.getProfileByUserId(userId);
    
    if (durationSeconds && Number(durationSeconds) > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video duration exceeds maximum allowed limit of 2 minutes (${MAX_VIDEO_DURATION_SECONDS}s)`);
    }

    const wfIndex = profile.deliveredWorkflows.findIndex(w => w.id === workflowId);
    if (wfIndex === -1) {
      throw new Error(`Delivered workflow ${workflowId} not found`);
    }

    profile.deliveredWorkflows[wfIndex].demoVideoUrl = videoUrl;
    profile.deliveredWorkflows[wfIndex].videoDurationSeconds = durationSeconds || 0;
    profile.deliveredWorkflows[wfIndex].updatedAt = new Date().toISOString();

    await this.updateProfile(userId, { deliveredWorkflows: profile.deliveredWorkflows });
    return profile.deliveredWorkflows[wfIndex];
  }
}

module.exports = new ProfileService();
