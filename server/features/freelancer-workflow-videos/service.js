const { Storage } = require('@google-cloud/storage');
const path = require('path');
const supabase = require('../../supabase');

const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'shortshub_video_storage';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'corded-cable-460921-u1';

class WorkflowVideoService {
    constructor() {
        this.storage = new Storage({ projectId: PROJECT_ID });
        this.bucket = this.storage.bucket(BUCKET_NAME);
    }

    /**
     * Generate secure V4 signed upload URL for freelancer direct-to-bucket upload
     */
    async getSignedUploadUrl(freelancerId, filename, contentType = 'video/mp4') {
        if (!freelancerId) throw new Error('Freelancer ID required');
        if (!filename) throw new Error('Filename required');

        const cleanFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
        const storagePath = `freelancers/${freelancerId}/workflow_videos/${Date.now()}_${cleanFilename}`;
        const file = this.bucket.file(storagePath);

        const [uploadUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType
        });

        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${storagePath}`;

        return {
            uploadUrl,
            storagePath,
            publicUrl,
            bucket: BUCKET_NAME
        };
    }

    /**
     * Record video metadata in database under freelancer's login
     */
    async recordWorkflowVideo(freelancerId, { title, description, storagePath, publicUrl, fileSize, duration, taskId }) {
        const payload = {
            freelancer_id: freelancerId,
            title: title || 'Workflow Proof Video',
            description: description || '',
            storage_path: storagePath,
            public_url: publicUrl,
            file_size: fileSize || 0,
            duration_seconds: duration || 0,
            task_id: taskId || null,
            created_at: new Date().toISOString()
        };

        if (supabase && typeof supabase.from === 'function') {
            const { data, error } = await supabase.from('freelancer_workflow_videos').insert([payload]).select();
            if (error) {
                console.warn('[WorkflowVideoService] Supabase insert note:', error.message);
            }
            if (data && data.length > 0) return data[0];
        }

        return { id: `local_${Date.now()}`, ...payload };
    }

    /**
     * Fetch all workflow proof videos for logged-in freelancer
     */
    async getFreelancerVideos(freelancerId) {
        if (!freelancerId) throw new Error('Freelancer ID required');

        if (supabase && typeof supabase.from === 'function') {
            const { data, error } = await supabase
                .from('freelancer_workflow_videos')
                .select('*')
                .eq('freelancer_id', freelancerId)
                .order('created_at', { ascending: false });

            if (!error && data) return data;
        }

        // Fallback: list from GCS bucket prefix
        try {
            const [files] = await this.bucket.getFiles({
                prefix: `freelancers/${freelancerId}/workflow_videos/`
            });
            return files.map(f => ({
                storage_path: f.name,
                public_url: `https://storage.googleapis.com/${BUCKET_NAME}/${f.name}`,
                updated_at: f.metadata.updated
            }));
        } catch (e) {
            return [];
        }
    }
}

module.exports = new WorkflowVideoService();
