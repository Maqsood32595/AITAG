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

  async acceptBid(bidId, requestingEmail) {
    // 1. Fetch bid details
    const { data: bid, error: bidErr } = await supabase
      .from('aitag_bids')
      .select('*')
      .eq('id', bidId)
      .single();

    if (bidErr || !bid) throw new Error('Bid not found');
    if (bid.task_owner_email !== requestingEmail) {
      throw new Error('Unauthorized: only task owner can accept bids');
    }

    // 2. Fetch task
    const task = await tasksService.getTaskById(bid.task_id);
    if (!task) throw new Error('Associated task not found');

    // 3. Update accepted bid status
    const { data: updatedBid, error: updateBidErr } = await supabase
      .from('aitag_bids')
      .update({ status: 'accepted' })
      .eq('id', bidId)
      .select()
      .single();

    if (updateBidErr) throw new Error(updateBidErr.message);

    // 4. Reject other competing bids on this task
    await supabase
      .from('aitag_bids')
      .update({ status: 'rejected' })
      .eq('task_id', bid.task_id)
      .neq('id', bidId);

    // 5. Update task status to in-progress
    await tasksService.updateTask(task.id, requestingEmail, {
      status: 'in-progress'
    });

    // 6. Section 194-O (1% TDS) & Escrow splits calculation
    const gross = Number(task.budget);
    const platformFee = Number((gross * 0.10).toFixed(2));
    const tdsWithheld = Number((gross * 0.01).toFixed(2));
    const netPayout = Number((gross - (platformFee + tdsWithheld)).toFixed(2));

    return {
      success: true,
      bid: updatedBid,
      escrow: {
        grossAmount: gross,
        platformFee,
        section194OTDS: tdsWithheld,
        freelancerNetPayout: netPayout,
        status: 'HELD_IN_ESCROW'
      }
    };
  }
}

module.exports = new BidsService();
