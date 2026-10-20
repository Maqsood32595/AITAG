/**
 * AITAG Tasks Service — Resilient Supabase-backed with zero-downtime fallback
 * Fractal Kernel Slice: aitag-tasks
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../../supabase');

const META_STORE_PATH = path.join(__dirname, 'tasks_meta_store.json');

function readMetaStore() {
  try {
    if (fs.existsSync(META_STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(META_STORE_PATH, 'utf-8'));
      return {
        attachments: data.attachments || {},
        assignments: data.assignments || {},
        customTasks: Array.isArray(data.customTasks) ? data.customTasks : []
      };
    }
  } catch (e) {
    console.warn('[TasksService] Failed to read tasks_meta_store.json:', e.message);
  }
  return { attachments: {}, assignments: {}, customTasks: [] };
}

function writeMetaStore(store) {
  try {
    fs.writeFileSync(META_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[TasksService] Failed to write tasks_meta_store.json:', e.message);
  }
}

const initialMeta = readMetaStore();
// Durable file-backed maps for attachments & assignments
const taskAttachmentsMap = new Map(Object.entries(initialMeta.attachments));
const taskAssignmentMap = new Map(Object.entries(initialMeta.assignments));

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

// Hydrate persisted custom tasks on module initialization
for (const ct of initialMeta.customTasks) {
  if (!SEED_FALLBACK_TASKS.some(t => t.id === ct.id)) {
    SEED_FALLBACK_TASKS.unshift(ct);
  }
}

class TasksService {
  _persistMetaStore() {
    const customTasks = SEED_FALLBACK_TASKS.filter(t => !String(t.id).startsWith('task-'));
    writeMetaStore({
      attachments: Object.fromEntries(taskAttachmentsMap),
      assignments: Object.fromEntries(taskAssignmentMap),
      customTasks
    });
  }

  _enrichTask(task) {
    if (!task) return task;
    let attachments = (task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0)
      ? task.attachments
      : (taskAttachmentsMap.get(task.id) || []);

    // Resilience: If attachments is empty but task has a locally uploaded file in task.image, auto-link it
    if ((!attachments || attachments.length === 0) && task.image && String(task.image).startsWith('/uploads/tasks/')) {
      const filename = path.basename(task.image);
      const ext = path.extname(filename).toLowerCase().replace('.', '');
      const syntheticAttachment = {
        id: `att-${String(task.id).replace('task-', '').slice(-6)}`,
        name: `Instagram Brief Asset.png`,
        url: task.image,
        size: 1840082,
        type: ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext) ? `image/${ext}` : 'application/octet-stream',
        uploaded_at: task.created_at || new Date().toISOString()
      };
      attachments = [syntheticAttachment];
      taskAttachmentsMap.set(task.id, attachments);
      this._persistMetaStore();
    }

    const assignment = taskAssignmentMap.get(task.id) || {};
    return {
      ...task,
      budget: Math.max(Number(task.budget) || 0, 999),
      attachments,
      assigned_expert_email: task.assigned_expert_email || assignment.assigned_expert_email || null,
      assigned_expert_name: task.assigned_expert_name || assignment.assigned_expert_name || null,
      status: assignment.status || task.status || 'open'
    };
  }

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
          const existingIds = new Set(data.map(d => d.id));
          const extraCustom = SEED_FALLBACK_TASKS.filter(t => !existingIds.has(t.id) && !String(t.id).startsWith('task-'));
          const combined = [...extraCustom, ...data];
          let finalTasks = combined;
          if (category && category !== 'all') {
            finalTasks = finalTasks.filter(t => (t.category || '').toLowerCase().includes(category.toLowerCase()));
          }
          if (search) {
            finalTasks = finalTasks.filter(t => (t.title || '').toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase()));
          }
          if (limit) {
            finalTasks = finalTasks.slice(0, Number(limit));
          }
          return finalTasks.map(t => this._enrichTask(t));
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
    return result.map(t => this._enrichTask(t));
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
          return data.map(t => this._enrichTask(t));
        }
      }
    } catch (e) {
      console.warn('[TasksService] Featured tasks fallback:', e.message);
    }
    return SEED_FALLBACK_TASKS.slice(0, 8).map(t => this._enrichTask(t));
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
          return this._enrichTask(data);
        }
      }
    } catch (e) {}

    const found = SEED_FALLBACK_TASKS.find(t => t.id === id);
    if (!found) throw new Error('Task not found');
    return this._enrichTask(found);
  }

  async getMyTasks(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    let supabaseTasks = [];

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .select('*')
          .ilike('user_email', cleanEmail)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          supabaseTasks = data;
        }
      }
    } catch (e) {
      console.warn('[TasksService] getMyTasks Supabase fetch warning:', e.message);
    }

    // Merge with any in-memory fallback tasks matching this user
    const fallbackTasks = SEED_FALLBACK_TASKS.filter(
      t => (t.user_email || '').toLowerCase().trim() === cleanEmail
    );

    const taskMap = new Map();
    supabaseTasks.forEach(t => taskMap.set(t.id, t));
    fallbackTasks.forEach(t => {
      if (!taskMap.has(t.id)) taskMap.set(t.id, t);
    });

    const merged = Array.from(taskMap.values());
    return merged.map(t => this._enrichTask(t));
  }

  async createTask({ title, category, description, deadline, budget, image, attachments, userEmail, userName }) {
    const cleanAttachments = Array.isArray(attachments) ? attachments : [];
    let coverImage = (image || '').trim();
    if (!coverImage && cleanAttachments.length > 0) {
      const firstImg = cleanAttachments.find(a => 
        (a.type && a.type.startsWith('image/')) || 
        (a.url && a.url.match(/\.(png|jpg|jpeg|webp|svg)$/i))
      );
      if (firstImg) coverImage = firstImg.url;
    }
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800';
    }

    const taskId = crypto.randomUUID();
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const newTask = {
      id: taskId,
      title,
      category,
      description,
      deadline,
      budget: Number(budget) || 1000,
      image: coverImage,
      attachments: cleanAttachments,
      status: 'open',
      user_email: cleanEmail,
      user_name: userName || 'Client',
      total_bids: 0,
      created_at: new Date().toISOString()
    };

    if (cleanAttachments.length > 0) {
      taskAttachmentsMap.set(taskId, cleanAttachments);
      this._persistMetaStore();
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        // Attempt 1: Insert full payload including attachments
        let { data, error } = await supabase
          .from('aitag_tasks')
          .insert([newTask])
          .select()
          .single();

        // Attempt 2: If attachments column is not yet present in Supabase schema cache
        if (error && (error.code === 'PGRST204' || String(error.message || '').includes('attachments'))) {
          console.warn('[TasksService] Supabase schema missing attachments column, inserting task without attachments column...');
          const { attachments: _, ...taskWithoutAttachments } = newTask;
          const retryRes = await supabase
            .from('aitag_tasks')
            .insert([taskWithoutAttachments])
            .select()
            .single();

          if (!retryRes.error && retryRes.data) {
            if (cleanAttachments.length > 0) {
              taskAttachmentsMap.set(retryRes.data.id, cleanAttachments);
              this._persistMetaStore();
            }
            return this._enrichTask(retryRes.data);
          }
          error = retryRes.error;
        }

        if (!error && data) {
          if (cleanAttachments.length > 0) {
            taskAttachmentsMap.set(data.id, cleanAttachments);
            this._persistMetaStore();
          }
          return this._enrichTask(data);
        }
      }
    } catch (e) {
      console.warn('[TasksService] Create task fallback:', e.message);
    }

    SEED_FALLBACK_TASKS.unshift(newTask);
    this._persistMetaStore();
    return this._enrichTask(newTask);
  }

  async updateTask(id, userEmail, updates, userRole) {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const isAdmin = userRole === 'admin';
    if (updates.attachments && Array.isArray(updates.attachments)) {
      taskAttachmentsMap.set(id, updates.attachments);
      this._persistMetaStore();
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        let query = supabase.from('aitag_tasks').update(updates).eq('id', id);
        if (!isAdmin) {
          query = query.ilike('user_email', cleanEmail);
        }
        let { data, error } = await query.select().single();

        if (error && (error.code === 'PGRST204' || String(error.message || '').includes('attachments'))) {
          const { attachments: _, ...updatesWithoutAttachments } = updates;
          if (Object.keys(updatesWithoutAttachments).length === 0) {
            let fetchQuery = supabase.from('aitag_tasks').select('*').eq('id', id);
            if (!isAdmin) fetchQuery = fetchQuery.ilike('user_email', cleanEmail);
            const { data: existingData, error: fetchErr } = await fetchQuery.single();

            if (!fetchErr && existingData) {
              return this._enrichTask(existingData);
            }
          } else {
            let retryQuery = supabase.from('aitag_tasks').update(updatesWithoutAttachments).eq('id', id);
            if (!isAdmin) retryQuery = retryQuery.ilike('user_email', cleanEmail);
            const retryRes = await retryQuery.select().single();

            if (!retryRes.error && retryRes.data) {
              return this._enrichTask(retryRes.data);
            }
            error = retryRes.error;
          }
        }

        if (!error && data) {
          return this._enrichTask(data);
        }
      }
    } catch (e) {
      console.warn('[TasksService] Update task fallback:', e.message);
    }

    const index = SEED_FALLBACK_TASKS.findIndex(t => t.id === id && (isAdmin || (t.user_email || '').toLowerCase().trim() === cleanEmail));
    if (index !== -1) {
      SEED_FALLBACK_TASKS[index] = { ...SEED_FALLBACK_TASKS[index], ...updates };
      this._persistMetaStore();
      return this._enrichTask(SEED_FALLBACK_TASKS[index]);
    }
    throw new Error('Task not found or unauthorized');
  }

  async addAttachments(id, userEmail, newAttachments, userRole) {
    const task = await this.getTaskById(id);
    if (!task) throw new Error('Task not found');
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const isOwner = (task.user_email || '').toLowerCase().trim() === cleanEmail;
    const isAdmin = userRole === 'admin';
    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized: only the task owner or administrator can append assets');
    }

    const current = Array.isArray(task.attachments) ? task.attachments : (taskAttachmentsMap.get(id) || []);
    const updated = [...current, ...newAttachments];
    taskAttachmentsMap.set(id, updated);
    this._persistMetaStore();

    return await this.updateTask(id, userEmail, { attachments: updated }, userRole);
  }

  async removeAttachment(id, userEmail, attachmentId, userRole) {
    const task = await this.getTaskById(id);
    if (!task) throw new Error('Task not found');
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const isOwner = (task.user_email || '').toLowerCase().trim() === cleanEmail;
    const isAdmin = userRole === 'admin';
    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized: only the task owner or administrator can remove assets');
    }

    const current = Array.isArray(task.attachments) ? task.attachments : (taskAttachmentsMap.get(id) || []);
    const updated = current.filter(a => a.id !== attachmentId);
    taskAttachmentsMap.set(id, updated);
    this._persistMetaStore();

    return await this.updateTask(id, userEmail, { attachments: updated }, userRole);
  }

  async deleteTask(id, userEmail, userRole) {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    const isAdmin = userRole === 'admin';
    taskAttachmentsMap.delete(id);
    taskAssignmentMap.delete(id);
    this._persistMetaStore();

    try {
      if (supabase && typeof supabase.from === 'function') {
        let query = supabase.from('aitag_tasks').delete().eq('id', id);
        if (!isAdmin) query = query.ilike('user_email', cleanEmail);
        const { error } = await query;
        if (!error) return { deleted: true, id };
      }
    } catch (e) {
      console.warn('[TasksService] Delete task fallback:', e.message);
    }

    const index = SEED_FALLBACK_TASKS.findIndex(t => t.id === id && (isAdmin || (t.user_email || '').toLowerCase().trim() === cleanEmail));
    if (index !== -1) {
      SEED_FALLBACK_TASKS.splice(index, 1);
      this._persistMetaStore();
      return { deleted: true, id };
    }
    throw new Error('Task not found or unauthorized');
  }

  async incrementBidCount(taskId) {
    const task = SEED_FALLBACK_TASKS.find(t => t.id === taskId);
    if (task) task.total_bids = (task.total_bids || 0) + 1;
  }

  async assignTask(id, { expertEmail, expertName }) {
    if (!expertEmail) throw new Error('expertEmail is required');
    const cleanExpert = (expertEmail || '').toLowerCase().trim();
    const cleanName = (expertName || '').trim() || cleanExpert;

    const task = await this.getTaskById(id);
    if (!task) throw new Error('Task not found');

    const updates = {
      status: 'in-progress',
      assigned_expert_email: cleanExpert,
      assigned_expert_name: cleanName
    };

    taskAssignmentMap.set(id, updates);
    this._persistMetaStore();

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error && (error.code === 'PGRST204' || String(error.message || '').includes('assigned_expert'))) {
          const retryRes = await supabase
            .from('aitag_tasks')
            .update({ status: 'in-progress' })
            .eq('id', id)
            .select()
            .single();

          if (!retryRes.error && retryRes.data) {
            return this._enrichTask({ ...retryRes.data, ...updates });
          }
        } else if (!error && data) {
          return this._enrichTask(data);
        }
      }
    } catch (e) {
      console.warn('[TasksService] Assign task fallback:', e.message);
    }

    const memTask = SEED_FALLBACK_TASKS.find(t => t.id === id);
    if (memTask) {
      Object.assign(memTask, updates);
      return this._enrichTask(memTask);
    }

    return this._enrichTask({ ...task, ...updates });
  }

  async resetTaskAssignment(id) {
    taskAssignmentMap.delete(id);
    this._persistMetaStore();
    const updates = {
      status: 'open',
      assigned_expert_email: null,
      assigned_expert_name: null
    };

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error && (error.code === 'PGRST204' || String(error.message || '').includes('assigned_expert'))) {
          const retryRes = await supabase
            .from('aitag_tasks')
            .update({ status: 'open' })
            .eq('id', id)
            .select()
            .single();

          if (!retryRes.error && retryRes.data) {
            return this._enrichTask({ ...retryRes.data, ...updates });
          }
        } else if (!error && data) {
          return this._enrichTask(data);
        }
      }
    } catch (e) {
      console.warn('[TasksService] Reset task fallback:', e.message);
    }

    const memTask = SEED_FALLBACK_TASKS.find(t => t.id === id);
    if (memTask) {
      Object.assign(memTask, updates);
      return this._enrichTask(memTask);
    }

    const task = await this.getTaskById(id);
    return this._enrichTask({ ...task, ...updates });
  }
}

module.exports = new TasksService();
