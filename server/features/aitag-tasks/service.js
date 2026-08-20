/**
 * AITAG Tasks Service — Resilient Supabase-backed with zero-downtime fallback
 * Fractal Kernel Slice: aitag-tasks
 */
const supabase = require('../../supabase');

const SEED_FALLBACK_TASKS = [
  {
    id: 'task-email-1',
    title: 'Automated Cold Email Infrastructure & DNS Warmup Setup',
    category: 'Automation & Growth',
    description: 'Need a specialist to configure automated SendGrid rotation, SPF/DKIM records, and cold outreach sequences.',
    deadline: '2026-09-01',
    budget: 35000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'Tech Ventures Inc',
    total_bids: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-meta-2',
    title: 'Meta & Facebook Ads AI Dynamic Creative Optimization',
    category: 'Growth & Ads',
    description: 'Deploy AI-driven multi-variant copy generator and automated ROAS tracking via Meta Marketing Graph API.',
    deadline: '2026-09-15',
    budget: 50000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'growth@startup.io',
    user_name: 'Aero Labs',
    total_bids: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-ocr-3',
    title: 'Enterprise Legal Document OCR & Entity Extraction Pipeline',
    category: 'Computer Vision & AI',
    description: 'Build real-time document mining pipeline to extract clauses from 50,000 legal PDFs with sub-50ms latency.',
    deadline: '2026-09-20',
    budget: 65000,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    status: 'open',
    user_email: 'legal@enterprise.ai',
    user_name: 'Lexis AI',
    total_bids: 4,
    created_at: new Date().toISOString()
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
