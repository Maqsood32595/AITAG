/**
 * AITAG Tasks Service — Supabase-backed
 * Fractal Kernel Slice: aitag-tasks
 */
const supabase = require('../../supabase');

class TasksService {
  async getAllTasks({ category, search, limit } = {}) {
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
    if (error) throw new Error(error.message);
    return data;
  }

  async getFeaturedTasks() {
    const { data, error } = await supabase
      .from('aitag_tasks')
      .select('*')
      .eq('status', 'open')
      .order('budget', { ascending: false })
      .limit(8);

    if (error) throw new Error(error.message);
    return data;
  }

  async getTaskById(id) {
    const { data, error } = await supabase
      .from('aitag_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Task not found');
    return data;
  }

  async getMyTasks(email) {
    const { data, error } = await supabase
      .from('aitag_tasks')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createTask({ title, category, description, deadline, budget, image, userEmail, userName }) {
    const { data, error } = await supabase
      .from('aitag_tasks')
      .insert([{
        title,
        category,
        description,
        deadline,
        budget: Number(budget),
        image: image || 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
        status: 'open',
        user_email: userEmail,
        user_name: userName,
        total_bids: 0
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateTask(id, userEmail, updates) {
    // Verify ownership first
    const { data: existing } = await supabase
      .from('aitag_tasks')
      .select('user_email')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Task not found');
    if (existing.user_email !== userEmail) throw new Error('Unauthorized: not your task');

    const { data, error } = await supabase
      .from('aitag_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTask(id, userEmail) {
    const { data: existing } = await supabase
      .from('aitag_tasks')
      .select('user_email')
      .eq('id', id)
      .single();

    if (!existing) throw new Error('Task not found');
    if (existing.user_email !== userEmail) throw new Error('Unauthorized: not your task');

    const { error } = await supabase
      .from('aitag_tasks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { deleted: true };
  }

  async incrementBidCount(taskId) {
    const { data: task } = await supabase
      .from('aitag_tasks')
      .select('total_bids')
      .eq('id', taskId)
      .single();

    if (task) {
      await supabase
        .from('aitag_tasks')
        .update({ total_bids: (task.total_bids || 0) + 1 })
        .eq('id', taskId);
    }
  }
}

module.exports = new TasksService();
