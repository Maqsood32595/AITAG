/**
 * AITAG Bids Service — Zero-Downtime Resilient Implementation
 * Fractal Kernel Slice: aitag-bids
 * Child: aitag-bids/service.js
 * Grandchildren:
 *   - validators/proposal-validator.js
 *   - calculators/bid-escrow-modeler.js
 */
const supabase = require('../../supabase');
const tasksService = require('../aitag-tasks/service');
const proposalValidator = require('./validators/proposal-validator');
const bidEscrowModeler = require('./calculators/bid-escrow-modeler');

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
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data } = await supabase
          .from('aitag_bids')
          .select('*')
          .eq('task_id', taskId)
          .eq('user_email', cleanEmail)
          .single();

        if (data) return { hasBid: true, bid: data };
      }
    } catch (e) {}

    const found = IN_MEMORY_BIDS.find(b => b.task_id === taskId && b.user_email === cleanEmail);
    return { hasBid: !!found, bid: found || null };
  }

  async placeBid({ taskId, userEmail, userName, bid_amount, delivery_days, proposal_pitch }) {
    const task = await tasksService.getTaskById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.user_email === userEmail) throw new Error('You cannot bid on your own task');

    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const existing = await this.checkUserBid(taskId, cleanEmail);

    // Validate with grandchild proposalValidator
    const validated = proposalValidator.validate(
      { bid_amount, delivery_days, proposal_pitch },
      task
    );
    const escrow = bidEscrowModeler.modelPayout(validated.bid_amount);

    // If already placed, allow updating proposal price and details (Phase 1 Edit)
    if (existing.hasBid && existing.bid) {
      const updatedBid = {
        ...existing.bid,
        bid_amount: validated.bid_amount,
        delivery_days: validated.delivery_days,
        proposal_pitch: validated.proposal_pitch,
        escrow_splits: escrow,
        updated_at: new Date().toISOString()
      };

      try {
        if (supabase && typeof supabase.from === 'function') {
          const { data, error } = await supabase
            .from('aitag_bids')
            .update(updatedBid)
            .eq('id', existing.bid.id)
            .select()
            .single();

          if (!error && data) {
            return { success: true, bid: data, updated: true };
          }
        }
      } catch (e) {}

      const idx = IN_MEMORY_BIDS.findIndex(b => b.id === existing.bid.id);
      if (idx !== -1) {
        IN_MEMORY_BIDS[idx] = updatedBid;
      }
      return { success: true, bid: updatedBid, updated: true };
    }

    // New bid creation
    const newBidPayload = {
      task_id: taskId,
      task_title: task.title,
      user_email: cleanEmail,
      user_name: userName,
      task_owner_email: task.user_email,
      bid_amount: validated.bid_amount,
      delivery_days: validated.delivery_days,
      proposal_pitch: validated.proposal_pitch,
      escrow_splits: escrow,
      status: 'pending'
    };

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_bids')
          .insert([newBidPayload])
          .select()
          .single();

        if (!error && data) {
          await tasksService.incrementBidCount(taskId);
          return { success: true, bid: data };
        }
      }
    } catch (e) {}

    const memoryBid = {
      id: `bid-${Date.now()}`,
      ...newBidPayload,
      created_at: new Date().toISOString()
    };
    IN_MEMORY_BIDS.push(memoryBid);
    await tasksService.incrementBidCount(taskId);

    return { success: true, bid: memoryBid };
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

    const agreedPrice = Number(bid.bid_amount || task.budget);
    const escrow = bidEscrowModeler.modelPayout(agreedPrice);

    if (task) {
      await tasksService.updateTask(task.id, task.user_email, {
        status: 'in-progress',
        agreed_price: agreedPrice,
        accepted_bid_id: bid.id,
        accepted_specialist_email: bid.user_email,
        accepted_specialist_name: bid.user_name,
        escrow_splits: escrow
      }, 'admin').catch(() => {});
      task.status = 'in-progress';
      task.agreed_price = agreedPrice;
      task.accepted_bid_id = bid.id;
    }

    return {
      success: true,
      bid,
      escrow: {
        grossAmount: escrow.grossAmount,
        platformFee: escrow.platformFee,
        section194OTDS: escrow.section194OTDS,
        freelancerNetPayout: escrow.freelancerNetPayout,
        status: 'HELD_IN_ESCROW'
      }
    };
  }
}

module.exports = new BidsService();
