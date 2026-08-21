require('events').EventEmitter.defaultMaxListeners = 50;
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const supabase = require('../../supabase');

const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME || process.env.GCS_BUCKET_NAME || 'shortshub_video_storage';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'corded-cable-460921-u1';
const MAX_VIDEO_DURATION_SECONDS = 120; // 2 minutes strict limit

// Fast memory fallback cache for profiles
const PROFILES_CACHE = new Map([
  [
    'f8dbf2cc-36a9-4228-bb50-13024787fd35',
    {
      userId: 'f8dbf2cc-36a9-4228-bb50-13024787fd35',
      name: 'Maqs',
      email: 'l.maqsood.m@gmail.com',
      role: 'freelancer',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maqs',
      headline: 'Senior AI Automation & Machine Learning Specialist',
      bio: 'Delivering production-grade AI automations, email pipelines, and machine learning tools.',
      hourlyRate: 2800,
      skills: ['Python', 'LangGraph', 'FastAPI', 'Supabase', 'SendGrid API', 'Meta Graph API', 'TypeScript'],
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
    }
  ]
]);

class ProfileService {
  /**
   * Lazy On-Demand GCS Storage Initializer
   */
  getBucket() {
    if (this.bucket) return this.bucket;

    try {
      let credentials = null;

      // 1. Direct JSON string from Render / Cloud Env
      const rawJson = process.env.GCS_CREDENTIALS || process.env.GOOGLE_CREDENTIALS || process.env.GCS_KEY;
      if (rawJson) {
        try {
          credentials = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        } catch (e) {
          console.warn('[ProfileService] Failed to parse GCS_CREDENTIALS JSON directly:', e.message);
        }
      }

      // 2. Base64 encoded JSON string from Render / Cloud Env
      if (!credentials && process.env.GCS_KEY_BASE64) {
        try {
          const decoded = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf8');
          credentials = JSON.parse(decoded);
        } catch (e) {
          console.warn('[ProfileService] Failed to parse GCS_KEY_BASE64:', e.message);
        }
      }

      // Ensure private_key has proper newlines for RSA PEM parser
      if (credentials && credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }

      // 3. Local key file fallback
      if (!credentials) {
        const keyFile = process.env.GOOGLE_CLOUD_KEY_FILE || path.join(__dirname, '../../shortshub-service-account.json');
        if (fs.existsSync(keyFile)) {
          this.storage = new Storage({ projectId: PROJECT_ID, keyFilename: keyFile });
          console.log('[ProfileService] Authenticated via local key file:', keyFile);
        } else {
          this.storage = new Storage({ projectId: PROJECT_ID });
          console.log('[ProfileService] Using default GCP credentials');
        }
      } else {
        this.storage = new Storage({
          projectId: credentials.project_id || PROJECT_ID,
          credentials
        });
        console.log('[ProfileService] Authenticated with GCS environment credentials for project:', credentials.project_id || PROJECT_ID);
      }

      this.bucket = this.storage ? this.storage.bucket(BUCKET_NAME) : null;
      return this.bucket;
    } catch (e) {
      console.warn('[ProfileService] GCS getBucket error:', e.message);
      return null;
    }
  }

  getLocalProfilePath(userId) {
    const dir = path.join(__dirname, '../../data/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${userId}.json`);
  }

  async getProfileByUserId(userId) {
    const cached = PROFILES_CACHE.get(userId);
    if (cached) return cached;

    // 1. Check local disk persistence
    try {
      const localFile = this.getLocalProfilePath(userId);
      if (fs.existsSync(localFile)) {
        const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
        if (localData && localData.deliveredWorkflows && localData.deliveredWorkflows.length > 0) {
          PROFILES_CACHE.set(userId, localData);
          console.log(`✅ Loaded profile for ${userId} from local disk persistence`);
          return localData;
        }
      }
    } catch (e) {
      console.warn('[ProfileService] Local disk profile read note:', e.message);
    }

    // 2. Attempt to read persisted profile.json from shared Google Cloud Storage bucket
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
          console.log(`✅ Loaded synchronized profile for ${userId} from GCS profile.json`);
          return parsed;
        }
      } catch (e) {
        console.warn('[ProfileService] GCS profile fetch notice:', e.message);
      }
    }

    // 3. Fallback default rich profile
    const defaultProfile = {
      userId,
      name: 'Maqs',
      email: 'l.maqsood.m@gmail.com',
      role: 'freelancer',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maqs',
      headline: 'Senior AI Automation & Machine Learning Specialist',
      bio: 'Delivering production-grade AI automations, email pipelines, and machine learning tools.',
      hourlyRate: 3200,
      skills: ['Python', 'LangGraph', 'FastAPI', 'Supabase', 'SendGrid API', 'Google Cloud Storage', 'TypeScript', 'Docker'],
      links: {
        github: 'https://github.com/Maqsood32595',
        linkedin: 'https://linkedin.com/in/maqsood',
        website: 'https://aitag.in'
      },
      deliveredWorkflows: [
        {
          id: 'wf-1',
          title: 'AITAG Video Showcase & Automated AI Pipeline',
          category: 'AI Video & Automation',
          businessImpact: 'Built zero-latency streaming proxy and video case study showcase with sub-second playback and multi-tier GCS storage.',
          demoVideoUrl: `/api/profile/workflows/stream-video?path=freelancers%2F${userId}%2Fworkflows%2Fwf-1%2F1787270540950_AITAG.mp4`,
          videoDurationSeconds: 75,
          techStack: ['Node.js', 'Google Cloud Storage', 'React', 'TypeScript', 'TailwindCSS'],
          liveUrl: 'https://aitag.onrender.com'
        },
        {
          id: 'wf-2',
          title: 'SRE Database Recovery & Error Prevention Automation',
          category: 'DevOps & Reliability',
          businessImpact: 'Automated PostgreSQL connection resilience, preventing production downtime and eliminating 500 error cascades across microservices.',
          demoVideoUrl: `/api/profile/workflows/stream-video?path=freelancers%2F${userId}%2Fworkflows%2Fwf-2%2F1787230276571_SREDatabaseError.mp4`,
          videoDurationSeconds: 110,
          techStack: ['PostgreSQL', 'Node.js', 'Docker', 'SRE Automation', 'GCP'],
          liveUrl: 'https://github.com/Maqsood32595/AITAG'
        },
        {
          id: 'wf-1787232449495',
          title: 'Vercel & GitHub CI/CD Deployment Pipeline',
          category: 'CI/CD & Cloud Infrastructure',
          businessImpact: 'Configured automated multi-branch staging and zero-downtime containerized deployments with automated preview verification.',
          demoVideoUrl: `/api/profile/workflows/stream-video?path=freelancers%2F${userId}%2Fworkflows%2Fwf-1787232449495%2F1787233165363_VercelGithub.mp4`,
          videoDurationSeconds: 95,
          techStack: ['GitHub Actions', 'Vercel API', 'Docker', 'Render Blueprint'],
          liveUrl: 'https://aitag-dev.onrender.com'
        }
      ],
      updatedAt: new Date().toISOString()
    };

    PROFILES_CACHE.set(userId, defaultProfile);
    try {
      fs.writeFileSync(this.getLocalProfilePath(userId), JSON.stringify(defaultProfile, null, 2), 'utf8');
    } catch {}
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

    // 1. Save to local disk persistence
    try {
      fs.writeFileSync(this.getLocalProfilePath(userId), JSON.stringify(updated, null, 2), 'utf8');
      console.log(`✅ Saved profile for ${userId} to local disk persistence`);
    } catch (e) {
      console.warn('[ProfileService] Local disk profile save note:', e.message);
    }

    // 2. Persist to shared Google Cloud Storage so Dev, Prod, and Local remain 100% in sync
    const bucket = this.getBucket();
    if (bucket) {
      try {
        const gcsPath = `freelancers/${userId}/profile.json`;
        const file = bucket.file(gcsPath);
        await file.save(Buffer.from(JSON.stringify(updated, null, 2)), {
          contentType: 'application/json',
          resumable: false
        });
        console.log(`✅ Persisted synchronized profile.json to GCS for ${userId}`);
      } catch (e) {
        console.warn('[ProfileService] GCS profile save notice:', e.message);
      }
    }

    return updated;
  }

  async uploadWorkflowVideoBuffer(userId, { workflowId, filename, buffer, mimeType, durationSeconds }) {
    if (!userId) throw new Error('Unauthorized');
    const safeWfId = workflowId || 'wf-1';
    if (!buffer || buffer.length === 0) throw new Error('Video file buffer is empty');

    const durationNum = durationSeconds ? Number(durationSeconds) : 0;
    if (durationNum > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video duration exceeds maximum allowed limit of 2 minutes (${MAX_VIDEO_DURATION_SECONDS}s). Provided: ${durationNum}s`);
    }

    const bucket = this.getBucket();
    if (!bucket) {
      throw new Error('Google Cloud Storage bucket not configured on server. Please verify GCS_CREDENTIALS on Render.');
    }

    const cleanFilename = (filename || 'workflow_demo.mp4').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `freelancers/${userId}/workflows/${safeWfId}/${Date.now()}_${cleanFilename}`;
    const streamUrl = `/api/profile/workflows/stream-video?path=${encodeURIComponent(storagePath)}`;

    const file = bucket.file(storagePath);
    await file.save(buffer, {
      contentType: mimeType || 'video/mp4',
      resumable: false,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });
    console.log('✅ Uploaded video buffer directly to GCS:', storagePath);

    // Attach to profile workflow safely
    try {
      await this.attachVideoToWorkflow(userId, {
        workflowId: safeWfId,
        videoUrl: streamUrl,
        durationSeconds: durationNum
      });
    } catch (e) {
      console.warn('[Attach Video Note]:', e.message);
    }

    return {
      success: true,
      workflowId: safeWfId,
      publicUrl: streamUrl,
      storagePath,
      durationSeconds: durationNum,
      bucket: BUCKET_NAME
    };
  }

  /**
   * Secure Range (HTTP 206) Streamer for GCS Workflow Demo Videos
   */
  async streamWorkflowVideo(req, res, storagePath) {
    if (!storagePath || storagePath.includes('..') || !storagePath.startsWith('freelancers/')) {
      return res.status(403).json({ error: 'Access denied: Invalid or restricted video path' });
    }

    try {
      const bucket = this.getBucket();
      if (!bucket) {
        console.warn('[streamWorkflowVideo] GCS Bucket not initialized on server.');
        return res.status(503).json({
          error: 'Video storage bucket not initialized on cloud host. Please configure GCS_CREDENTIALS environment variable in Render.',
          storagePath
        });
      }

      const file = bucket.file(storagePath);
      let exists = false;
      try {
        const [fileExists] = await file.exists();
        exists = fileExists;
      } catch (checkErr) {
        console.warn('[streamWorkflowVideo] file.exists check error:', checkErr.message);
      }

      if (!exists) {
        return res.status(404).json({ error: 'Video file not found in storage bucket', storagePath });
      }

      const [metadata] = await file.getMetadata();
      const fileSize = parseInt(metadata.size, 10);
      const contentType = metadata.contentType || 'video/mp4';

      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
          return res.end();
        }

        const chunksize = (end - start) + 1;
        const stream = file.createReadStream({ start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });

        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });

        file.createReadStream().pipe(res);
      }
    } catch (err) {
      console.error('[Video Stream Error]:', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Failed to stream video from Google Cloud Storage',
          details: err.message,
          storagePath
        });
      }
    }
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
      const bucket = this.getBucket();
      if (bucket) {
        const file = bucket.file(storagePath);
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
