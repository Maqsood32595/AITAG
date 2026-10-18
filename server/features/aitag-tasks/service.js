/**
 * AITAG Tasks Service — Resilient Supabase-backed with zero-downtime fallback
 * Fractal Kernel Slice: aitag-tasks
 */
const supabase = require('../../supabase');

const SEED_FALLBACK_TASKS = [
  {
    id: 'task-1',
    title: 'Studio White-Background Cutouts for 15 Amazon Cosmetic Products',
    category: 'Product Visuals',
    description: 'We have raw smartphone photos of 15 skincare cosmetic jars. Need clean pure white backgrounds, realistic contact shadows, blemish cleanup, and Amazon-compliant 2000x2000px JPG exports.',
    deadline: '2026-11-15',
    budget: 1499,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'task-2',
    title: 'Amazon & Flipkart SEO Listing Copy for Ethnic Footwear Store',
    category: 'E-Commerce & Copy',
    description: 'Need high-converting marketplace titles, 5 benefit-driven bullet points, and high-search-volume backend keywords for 5 new sandal SKUs in English and Hindi.',
    deadline: '2026-11-10',
    budget: 999,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    id: 'task-3',
    title: '30-Day Festival Creative & Offer Pack for Local Bakery',
    category: 'Social & Marketing',
    description: 'Need 25 branded Instagram & Facebook post designs, festive holiday greetings, discount banners, and WhatsApp Status offer templates for the upcoming festive season.',
    deadline: '2026-11-20',
    budget: 3499,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'task-4',
    title: 'One-Page Mobile Website with Instant WhatsApp Button for Boutique',
    category: 'Web & Funnels',
    description: 'Need a fast, mobile-friendly single-page business website featuring our clothing collections, Google Maps shop location, customer testimonials, and direct WhatsApp click-to-chat button.',
    deadline: '2026-11-25',
    budget: 3999,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'task-5',
    title: 'AI Product Photo Makeover for 20 Meesho Saree Listings',
    category: 'Product Visuals',
    description: 'Transform flat-lay smartphone saree photos into studio-lit catalogue images with clean elegant backgrounds. Must meet Meesho listing standards.',
    deadline: '2026-11-12',
    budget: 1999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'task-6',
    title: 'Multilingual Product Descriptions for Homemade Spices Brand',
    category: 'E-Commerce & Copy',
    description: 'Craft compelling, appetizing product descriptions for 8 organic masala powders in English, Hindi, and Tamil to increase buyer trust and reduce customer sizing/usage queries.',
    deadline: '2026-11-08',
    budget: 999,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'task-7',
    title: 'Instagram Carousel & Reels Cover Templates for Fitness Studio',
    category: 'Social & Marketing',
    description: 'Design 8 educational swipe-carousel graphic sets, weekly workout schedule graphics, and video reel cover cards in our brand colors with targeted hashtags.',
    deadline: '2026-11-18',
    budget: 2499,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'task-8',
    title: 'High-Converting Landing Page with Lead Enquiry Form for CA Firm',
    category: 'Web & Funnels',
    description: 'Build a clean, trustworthy one-page website explaining our tax and accounting services with an instant lead capture enquiry form, Google Search indexing, and WhatsApp CTA.',
    deadline: '2026-11-30',
    budget: 4499,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    status: 'open',
    user_email: 'client@aitag.com',
    user_name: 'AITAG Client',
    total_bids: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
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
          return data.map(t => ({ ...t, budget: Math.max(Number(t.budget) || 0, 999) }));
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

        if (!error && data && data.length > 0) {
          return data.map(t => ({ ...t, budget: Math.max(Number(t.budget) || 0, 999) }));
        }
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

        if (!error && data) {
          return { ...data, budget: Math.max(Number(data.budget) || 0, 999) };
        }
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
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .update(updates)
          .eq('id', id)
          .eq('user_email', userEmail)
          .select()
          .single();

        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('[TasksService] Update task fallback:', e.message);
    }

    const index = SEED_FALLBACK_TASKS.findIndex(t => t.id === id && t.user_email === userEmail);
    if (index !== -1) {
      SEED_FALLBACK_TASKS[index] = { ...SEED_FALLBACK_TASKS[index], ...updates };
      return SEED_FALLBACK_TASKS[index];
    }
    throw new Error('Task not found or unauthorized');
  }

  async deleteTask(id, userEmail) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { error } = await supabase
          .from('aitag_tasks')
          .delete()
          .eq('id', id)
          .eq('user_email', userEmail);
        
        if (!error) return { deleted: true, id };
      }
    } catch (e) {
      console.warn('[TasksService] Delete task fallback:', e.message);
    }

    const index = SEED_FALLBACK_TASKS.findIndex(t => t.id === id && t.user_email === userEmail);
    if (index !== -1) {
      SEED_FALLBACK_TASKS.splice(index, 1);
      return { deleted: true, id };
    }
    throw new Error('Task not found or unauthorized');
  }

  async incrementBidCount(taskId) {
    const task = SEED_FALLBACK_TASKS.find(t => t.id === taskId);
    if (task) task.total_bids = (task.total_bids || 0) + 1;
  }
}

module.exports = new TasksService();
