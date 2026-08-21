/**
 * AITAG Delivered Workflows & Profile Showcase Engine
 * Fractal Kernel Slice: aitag-profile
 * Complete Implementation: In-RAM Cache, GCS Dual-Persistence, Video Streaming, Multipart Upload
 */
require('events').EventEmitter.defaultMaxListeners = 50;
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const MAX_VIDEO_DURATION_SECONDS = 120; // 2 minutes strict policy

const MAQS_ID = 'f8dbf2cc-36a9-4228-bb50-13024787fd35';
const USER1_ID = '6e36f593-b9e6-4ead-8266-31ac91cf44c5';

const EXACT_4_MAQS_WORKFLOWS = [
  {
    id: 'wf-1',
    title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
    category: 'Email Automation & Growth',
    businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox deliverability.',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2Ff8dbf2cc-36a9-4228-bb50-13024787fd35%2Fworkflows%2Fwf-1%2F1787270540950_AITAG.mp4',
    techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
    liveUrl: 'https://aitag.onrender.com'
  },
  {
    id: 'wf-2',
    title: 'Facebook & Meta Ads AI Optimization Engine',
    category: 'Growth & Ads',
    businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
    demoVideoUrl: '/api/profile/workflows/stream-video?path=freelancers%2Ff8dbf2cc-36a9-4228-bb50-13024787fd35%2Fworkflows%2Fwf-2%2F1787230276571_SREDatabaseError.mp4',
    techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
    liveUrl: 'https://user1.ai/meta-ads'
  },
  {
    id: 'wf-3',
    title: 'Meta Ads Dynamic Multi-Variant AI Engine',
    category: 'Growth & Ads',
    businessImpact: 'Scaled ROAS by 34% across 500 campaigns with real-time budget re-allocation and dynamic creative optimization.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Python', 'Meta Marketing API', 'FastAPI', 'Redis'],
    liveUrl: 'https://aitag.in'
  },
  {
    id: 'wf-4',
    title: 'FractalSwarm (AetherSRE V2) — Autonomous Hierarchical SRE Control Plane',
    category: 'Agentic Systems & SRE',
    businessImpact: 'Automated cluster failure triage with sub-100ms self-healing actions across distributed Kubernetes pods.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Zig', 'Rust', 'Kubernetes', 'TypeScript', 'eBPF'],
    liveUrl: 'https://github.com/Maqsood32595'
  }
];

const EXACT_3_USER1_WORKFLOWS = [
  {
    id: 'wf-user1-1',
    title: 'FractalSwarm (AetherSRE V2) — Autonomous Hierarchical SRE Control Plane',
    category: 'Agentic Systems & SRE',
    businessImpact: 'Automated cluster failure triage with sub-100ms self-healing actions across distributed Kubernetes pods.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Zig', 'Rust', 'Kubernetes', 'TypeScript', 'eBPF'],
    liveUrl: 'https://aitag.onrender.com'
  },
  {
    id: 'wf-user1-2',
    title: 'AITAG Video Showcase & Automated AI Pipeline',
    category: 'AI Video & Automation',
    businessImpact: 'Built zero-latency streaming proxy and video case study showcase with sub-second playback.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Node.js', 'Google Cloud Storage', 'React', 'TypeScript'],
    liveUrl: 'https://aitag.onrender.com'
  },
  {
    id: 'wf-user1-3',
    title: 'Facebook & Meta Ads AI Optimization Engine',
    category: 'Growth & Ads',
    businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
    demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
    liveUrl: 'https://user1.ai'
  }
];

const PROFILES_CACHE = new Map();

class ProfileService {
  constructor() {
    this.storage = null;
    this.bucketName = process.env.GCS_BUCKET_NAME || 'shortshub_video_storage';
    this.initGCS();
  }

  initGCS() {
    try {
      const rawKey = process.env.GCS_PRIVATE_KEY || process.env.SHORTSHUB_GCS_PRIVATE_KEY || '';
      const cleanKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();
      const clientEmail = process.env.GCS_CLIENT_EMAIL || process.env.SHORTSHUB_GCS_CLIENT_EMAIL;
      const projectId = process.env.GCS_PROJECT_ID || process.env.SHORTSHUB_GCS_PROJECT_ID || 'corded-cable-460921-u1';

      if (cleanKey && clientEmail) {
        this.storage = new Storage({
          projectId,
          credentials: { client_email: clientEmail, private_key: cleanKey }
        });
      } else {
        this.storage = new Storage({ projectId });
      }
    } catch (e) {
      console.warn('[ProfileService] GCS initialization notice:', e.message);
    }
  }

  getBucket() {
    if (!this.storage) this.initGCS();
    return this.storage ? this.storage.bucket(this.bucketName) : null;
  }

  getLocalProfilePath(userId) {
    const dir = path.join(__dirname, '../../data/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${userId}.json`);
  }

  normalizeUserId(userId) {
    if (userId === 'l.maqsood.m@gmail.com' || userId === 'usr_01' || userId === 'user-admin-001') {
      return MAQS_ID;
    }
    if (userId === 'user1@aitag.com' || userId === 'User1') {
      return USER1_ID;
    }
    return userId;
  }

  async getProfileByUserId(rawUserId) {
    const userId = this.normalizeUserId(rawUserId);

    // 1. Check local disk persistence
    try {
      const localFile = this.getLocalProfilePath(userId);
      if (fs.existsSync(localFile)) {
        const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
        if (localData && localData.deliveredWorkflows && localData.deliveredWorkflows.length > 0) {
          PROFILES_CACHE.set(userId, localData);
          return localData;
        }
      }
    } catch (e) {}

    // 2. Check in-memory cache
    const cached = PROFILES_CACHE.get(userId);
    if (cached) return cached;

    // 3. Attempt to read from Google Cloud Storage
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const gcsPath = `freelancers/${userId}/profile.json`;
        const file = bucket.file(gcsPath);
        const [exists] = await file.exists();
        if (exists) {
          const [content] = await file.download();
          const parsed = JSON.parse(content.toString('utf8'));
          PROFILES_CACHE.set(userId, parsed);
          try {
            fs.writeFileSync(this.getLocalProfilePath(userId), JSON.stringify(parsed, null, 2), 'utf8');
          } catch {}
          return parsed;
        }
      } catch (e) {}
    }

    // 4. Clean Fallback Defaults
    const isUser1 = (userId === USER1_ID || userId === 'user1@aitag.com');
    const defaultProfile = {
      userId,
      name: isUser1 ? 'User1' : 'Maqs',
      email: isUser1 ? 'user1@aitag.com' : 'l.maqsood.m@gmail.com',
      role: isUser1 ? 'admin' : 'freelancer',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isUser1 ? 'User1' : 'Maqs'}`,
      headline: isUser1 
        ? 'Senior AI Automation & Full-Stack Machine Learning Engineer'
        : 'Senior AI Automation & Machine Learning Specialist',
      bio: isUser1
        ? 'Building autonomous multi-agent swarms with LangGraph, AutoGen, Next.js 15, and real-time streaming WebSocket sandboxes.'
        : 'Delivering production-grade AI automations, email pipelines, and machine learning tools.',
      hourlyRate: isUser1 ? 3200 : 4500,
      skills: isUser1
        ? ['Next.js', 'React', 'LangGraph', 'TypeScript', 'Supabase', 'Node.js', 'Zig']
        : ['Python', 'LangGraph', 'FastAPI', 'Supabase', 'SendGrid API', 'Google Cloud Storage', 'TypeScript', 'Docker', 'Zig'],
      links: {
        github: 'https://github.com/Maqsood32595',
        linkedin: `https://linkedin.com/in/${isUser1 ? 'user1' : 'maqsood'}`,
        website: 'https://aitag.in'
      },
      deliveredWorkflows: isUser1 ? EXACT_3_USER1_WORKFLOWS : EXACT_4_MAQS_WORKFLOWS,
      updatedAt: new Date().toISOString()
    };

    PROFILES_CACHE.set(userId, defaultProfile);
    try {
      fs.writeFileSync(this.getLocalProfilePath(userId), JSON.stringify(defaultProfile, null, 2), 'utf8');
    } catch {}

    return defaultProfile;
  }

  async updateProfile(rawUserId, updateData) {
    const userId = this.normalizeUserId(rawUserId);
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

    // Save to local disk
    try {
      fs.writeFileSync(this.getLocalProfilePath(userId), JSON.stringify(updated, null, 2), 'utf8');
    } catch (e) {}

    // Save to Google Cloud Storage
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const gcsPath = `freelancers/${userId}/profile.json`;
        const file = bucket.file(gcsPath);
        await file.save(Buffer.from(JSON.stringify(updated, null, 2)), {
          contentType: 'application/json',
          resumable: false
        });
      } catch (e) {}
    }

    return updated;
  }

  async streamWorkflowVideo(req, res, storagePath) {
    if (!storagePath) {
      return res.status(400).json({ error: 'Storage path is required' });
    }

    try {
      const bucket = this.getBucket();
      if (!bucket) {
        return res.status(503).json({ error: 'Storage service unavailable' });
      }

      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      const [metadata] = await file.getMetadata();
      const fileSize = Number(metadata.size);
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': metadata.contentType || 'video/mp4',
        });

        file.createReadStream({ start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': metadata.contentType || 'video/mp4',
        });
        file.createReadStream().pipe(res);
      }
    } catch (err) {
      console.error('[Video Stream Error]:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    }
  }

  async uploadWorkflowVideoBuffer(userId, { workflowId, filename, buffer, mimeType, durationSeconds }) {
    if (durationSeconds && Number(durationSeconds) > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video exceeds maximum duration of ${MAX_VIDEO_DURATION_SECONDS}s`);
    }

    const bucket = this.getBucket();
    if (!bucket) throw new Error('Storage service unavailable');

    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `freelancers/${userId}/workflows/${workflowId}/${Date.now()}_${cleanFilename}`;
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      contentType: mimeType || 'video/mp4',
      resumable: false
    });

    const streamUrl = `/api/profile/workflows/stream-video?path=${encodeURIComponent(storagePath)}`;

    // Attach to profile workflow
    await this.attachVideoToWorkflow(userId, {
      workflowId,
      videoUrl: streamUrl,
      durationSeconds
    });

    return {
      success: true,
      storagePath,
      videoUrl: streamUrl
    };
  }

  async generateWorkflowVideoSignedUrl(userId, { workflowId, filename, contentType, durationSeconds }) {
    if (durationSeconds && Number(durationSeconds) > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video exceeds maximum duration of ${MAX_VIDEO_DURATION_SECONDS}s`);
    }

    const bucket = this.getBucket();
    if (!bucket) throw new Error('Storage service unavailable');

    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `freelancers/${userId}/workflows/${workflowId}/${Date.now()}_${cleanFilename}`;
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: contentType || 'video/mp4'
    });

    const streamUrl = `/api/profile/workflows/stream-video?path=${encodeURIComponent(storagePath)}`;

    return {
      signedUrl,
      storagePath,
      videoUrl: streamUrl
    };
  }

  async attachVideoToWorkflow(userId, { workflowId, videoUrl, durationSeconds }) {
    const profile = await this.getProfileByUserId(userId);
    const workflows = profile.deliveredWorkflows || [];
    const wfIndex = workflows.findIndex(w => w.id === workflowId);

    if (wfIndex !== -1) {
      workflows[wfIndex].demoVideoUrl = videoUrl;
      if (durationSeconds) workflows[wfIndex].videoDurationSeconds = Number(durationSeconds);
      workflows[wfIndex].updatedAt = new Date().toISOString();
    } else {
      workflows.push({
        id: workflowId,
        title: 'New Automated Workflow',
        category: 'Automation & Growth',
        businessImpact: 'Production-grade AI automation pipeline.',
        demoVideoUrl: videoUrl,
        videoDurationSeconds: Number(durationSeconds || 0),
        techStack: ['Python', 'FastAPI'],
        updatedAt: new Date().toISOString()
      });
    }

    await this.updateProfile(userId, { deliveredWorkflows: workflows });
    return workflows[wfIndex !== -1 ? wfIndex : workflows.length - 1];
  }
}

module.exports = new ProfileService();
