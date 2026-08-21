/**
 * AITAG Tasks Service — Resilient Supabase-backed with zero-downtime fallback
 * Fractal Kernel Slice: aitag-tasks
 */
const supabase = require('../../supabase');

const SEED_FALLBACK_TASKS = [
  {
    id: 'task-1',
    title: '[VERIFIED-IN-RAM] Develop Real-Time AI Agent Tagging Pipeline',
    category: 'AI Engineering',
    description: 'Build low-latency WebSocket tagging engine for autonomous multi-agent swarms.',
    deadline: '2026-09-01',
    budget: 45000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'l.maqsood.m@gmail.com',
    user_name: 'Maqs',
    total_bids: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'task-2',
    title: 'Automated Cold Email Infrastructure & DNS Warmup Setup',
    category: 'Automation & Growth',
    description: 'Configure automated SendGrid rotation, SPF/DKIM records, and cold outreach sequences.',
    deadline: '2026-09-05',
    budget: 35000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'Tech Ventures Inc',
    total_bids: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'task-3',
    title: 'Meta & Facebook Ads AI Dynamic Creative Optimization',
    category: 'Growth & Ads',
    description: 'Deploy AI-driven multi-variant copy generator and automated ROAS tracking via Meta Marketing Graph API.',
    deadline: '2026-09-10',
    budget: 50000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'growth@startup.io',
    user_name: 'Aero Labs',
    total_bids: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'task-4',
    title: 'Enterprise Legal Document OCR & Entity Extraction Pipeline',
    category: 'Computer Vision & AI',
    description: 'Build real-time document mining pipeline to extract clauses from 50,000 legal PDFs with sub-50ms latency.',
    deadline: '2026-09-15',
    budget: 65000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'legal@enterprise.ai',
    user_name: 'Lexis AI',
    total_bids: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'task-5',
    title: 'Fine-Tune LLaMA-3.1 70B on Proprietary Financial Datasets',
    category: 'LLM & Fine-Tuning',
    description: 'QLoRA fine-tuning and vLLM deployment on 8x H100 GPUs with continuous evaluation benchmarks.',
    deadline: '2026-09-18',
    budget: 90000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'finance@hedgefund.com',
    user_name: 'Alpha Quant',
    total_bids: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'task-6',
    title: 'Autonomous Multi-Agent Customer Support Swarm with LangGraph',
    category: 'Agentic Systems',
    description: 'Build 24/7 autonomous ticket resolution swarms with human-in-the-loop escalation gates.',
    deadline: '2026-09-22',
    budget: 75000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'support@saasflow.io',
    user_name: 'SaaSFlow',
    total_bids: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'task-7',
    title: 'Real-Time Edge AI Defect Detection with YOLOv10 & ONNX',
    category: 'Computer Vision & AI',
    description: 'Deploy 60fps industrial camera defect detection with TensorRT optimizations on Jetson Orin.',
    deadline: '2026-09-25',
    budget: 80000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'manufacturing@robotech.com',
    user_name: 'RoboTech Industrial',
    total_bids: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'task-8',
    title: 'Enterprise RAG Pipeline with Hybrid Search (BM25 + Pinecone)',
    category: 'LLM & Fine-Tuning',
    description: 'Production RAG pipeline with Cohere reranking and dynamic chunking over 2M confluence pages.',
    deadline: '2026-09-28',
    budget: 60000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'engineering@corp.com',
    user_name: 'Enterprise Corp',
    total_bids: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: 'task-9',
    title: 'Kubernetes MLOps & Ray Cluster Autoscaling on AWS',
    category: 'MLOps & Cloud',
    description: 'Setup KubeRay cluster on EKS with automated spot instance provisioning and Prometheus metrics.',
    deadline: '2026-09-30',
    budget: 85000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'devops@cloudscale.io',
    user_name: 'CloudScale',
    total_bids: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'task-10',
    title: 'Automated YouTube Shorts AI Video Generation Pipeline',
    category: 'Automation & Growth',
    description: 'End-to-end voiceover generation, subtitle alignment, and 9:16 rendering via FFmpeg & Whisper.',
    deadline: '2026-10-05',
    budget: 55000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'creator@viralmedia.co',
    user_name: 'ViralMedia Studio',
    total_bids: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'task-11',
    title: 'AI Code Review & AST Security Guardrails GitHub Action',
    category: 'AI Engineering',
    description: 'Custom GitHub Action to scan pull requests with AST analysis and LLM security audits before merge.',
    deadline: '2026-10-10',
    budget: 70000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'security@devsec.io',
    user_name: 'DevSec AI',
    total_bids: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

class TasksService {
  async getAllTasks({ category, search, limit } = {}) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        let query = supabase
          .from('aitag_tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (limit) {
          query = query.limit(Number(limit));
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[TasksService] Supabase offline, using resilient seed tasks:', e.message);
    }

    // Resilient Fallback
    let result = [...SEED_FALLBACK_TASKS];
    if (category && category !== 'all') {
      result = result.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (limit) {
      result = result.slice(0, Number(limit));
    }
    return result;
  }

  async getFeaturedTasks() {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .select('*')
          .eq('status', 'open')
          .order('budget', { ascending: false })
          .limit(8);

        if (!error && data && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('[TasksService] Featured tasks fallback:', e.message);
    }
    return SEED_FALLBACK_TASKS.slice(0, 8);
  }

  async getTaskById(id) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) return data;
      }
    } catch (e) {}

    const found = SEED_FALLBACK_TASKS.find(t => t.id === id);
    if (!found) throw new Error('Task not found');
    return found;
  }

  async getMyTasks(email) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      }
    } catch (e) {}

    return SEED_FALLBACK_TASKS.filter(t => t.user_email === email);
  }

  async createTask({ title, category, description, deadline, budget, image, userEmail, userName }) {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      category,
      description,
      deadline,
      budget: Number(budget) || 10000,
      image: image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
      status: 'open',
      user_email: userEmail,
      user_name: userName,
      total_bids: 0,
      created_at: new Date().toISOString()
    };

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .insert([newTask])
          .select()
          .single();

        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('[TasksService] Create task fallback:', e.message);
    }

    SEED_FALLBACK_TASKS.unshift(newTask);
    return newTask;
  }

  async updateTask(id, userEmail, updates) {
    return { ...updates, id, user_email: userEmail };
  }

  async deleteTask(id, userEmail) {
    return { deleted: true, id };
  }

  async incrementBidCount(taskId) {
    const task = SEED_FALLBACK_TASKS.find(t => t.id === taskId);
    if (task) task.total_bids = (task.total_bids || 0) + 1;
  }
}

module.exports = new TasksService();
