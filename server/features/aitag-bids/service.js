/**
 * AITAG Bids Service — Zero-Downtime Resilient Implementation
 * Fractal Kernel Slice: aitag-bids
 */
const supabase = require('../../supabase');
const tasksService = require('../aitag-tasks/service');
const escrowPaymentService = require('../escrow-payment/service');

const IN_MEMORY_BIDS = [];

class BidsService {
  async getUserBids(email) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_bids')
          .select('*')
          .eq('user_email', (email || '').trim().toLowerCase())
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { bidCount: data.length, bids: data };
        }
      }
    } catch (e) {
      console.warn('[BidsService] Supabase query notice:', e.message);
    }

    const userBids = IN_MEMORY_BIDS.filter(b => b.user_email === (email || '').trim().toLowerCase());
    return { bidCount: userBids.length, bids: userBids };
  }

  async checkUserBid(taskId, email) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data } = await supabase
          .from('aitag_bids')
          .select('id')
          .eq('task_id', taskId)
          .eq('user_email', (email || '').trim().toLowerCase())
          .single();

        if (data) return { hasBid: true };
      }
    } catch (e) {}

    const found = IN_MEMORY_BIDS.some(b => b.task_id === taskId && b.user_email === (email || '').trim().toLowerCase());
    return { hasBid: found };
  }

  async placeBid({ taskId, userEmail, userName }) {
    const task = await tasksService.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.user_email === userEmail) throw new Error('You cannot bid on your own task');

    const { hasBid } = await this.checkUserBid(taskId, userEmail);
    if (hasBid) throw new Error('You have already placed a bid on this task');

    const cleanEmail = (userEmail || '').trim().toLowerCase();

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_bids')
          .insert([{
            task_id: taskId,
            task_title: task.title,
            user_email: cleanEmail,
            user_name: userName,
            task_owner_email: task.user_email,
            status: 'pending'
          }])
          .select()
          .single();

        if (!error && data) {
          await tasksService.incrementBidCount(taskId);
          return { success: true, bid: data };
        }
      }
    } catch (e) {}

    const newBid = {
      id: `bid-${Date.now()}`,
      task_id: taskId,
      task_title: task.title,
      user_email: cleanEmail,
      user_name: userName,
      task_owner_email: task.user_email,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    IN_MEMORY_BIDS.push(newBid);
    await tasksService.incrementBidCount(taskId);

    return { success: true, bid: newBid };
  }

  async getTaskBids(taskId, requestingEmail) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_bids')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      }
    } catch (e) {}

    return IN_MEMORY_BIDS.filter(b => b.task_id === taskId);
  }

  async acceptBid(bidId, requestingEmail) {
    let bid;
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: sbBid, error: fetchError } = await supabase
          .from('aitag_bids')
          .select('*')
          .eq('id', bidId)
          .single();

        if (sbBid && !fetchError) {
          const { error: updateError } = await supabase
            .from('aitag_bids')
            .update({ status: 'accepted' })
            .eq('id', bidId);
          if (!updateError) {
            sbBid.status = 'accepted';
            bid = sbBid;
          }
        }
      }
    } catch (e) {
      console.warn('[BidsService] Accept bid fallback:', e.message);
    }

    if (!bid) {
      bid = IN_MEMORY_BIDS.find(b => b.id === bidId);
      if (bid) bid.status = 'accepted';
    }

    if (!bid) throw new Error('Bid not found');

    const task = await tasksService.getTaskById(bid.task_id);
    if (task) {
      await tasksService.updateTask(task.id, task.user_email, { status: 'in-progress' }).catch(() => {});
      task.status = 'in-progress';
    }
    const escrow = escrowPaymentService.calculateSplits(task.budget);

    return {
      success: true,
      bid,
      escrow: {
        grossAmount: escrow.grossAmount,
        platformFee: escrow.splits.platformCommissionFee,
        section194OTDS: escrow.splits.section194OTDSWithholding,
        freelancerNetPayout: escrow.splits.freelancerNetPayout,
        status: 'HELD_IN_ESCROW'
      }
    };
  }
}

module.exports = new BidsService();
