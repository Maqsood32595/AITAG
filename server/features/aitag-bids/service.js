/**
 * AITAG Bids Service — Supabase-backed
 * Fractal Kernel Slice: aitag-bids
 */
const supabase = require('../../supabase');
const tasksService = require('../aitag-tasks/service');

class BidsService {
  async getUserBids(email) {
    const { data, error } = await supabase
      .from('aitag_bids')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { bidCount: data.length, bids: data };
  }

  async checkUserBid(taskId, email) {
    const { data } = await supabase
      .from('aitag_bids')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_email', email)
      .single();

    return { hasBid: !!data };
  }

  async placeBid({ taskId, userEmail, userName }) {
    // Fetch task to validate
    const task = await tasksService.getTaskById(taskId);

    if (!task) throw new Error('Task not found');
    if (task.user_email === userEmail) throw new Error('You cannot bid on your own task');
    if (new Date() > new Date(task.deadline)) throw new Error('Task deadline has passed');

    // Check duplicate bid
    const { hasBid } = await this.checkUserBid(taskId, userEmail);
    if (hasBid) throw new Error('You have already placed a bid on this task');

    const { data, error } = await supabase
      .from('aitag_bids')
      .insert([{
        task_id: taskId,
        task_title: task.title,
        user_email: userEmail,
        user_name: userName,
        task_owner_email: task.user_email,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('You have already placed a bid on this task');
      throw new Error(error.message);
    }

    // Increment task bid count
    await tasksService.incrementBidCount(taskId);

    return { success: true, bid: data };
  }

  async getTaskBids(taskId, requestingEmail) {
    // Verify requesting user is the task owner
    const task = await tasksService.getTaskById(taskId);
    if (task.user_email !== requestingEmail) throw new Error('Unauthorized: only task owner can see bids');

    const { data, error } = await supabase
      .from('aitag_bids')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = new BidsService();
