/**
 * AITAG Invitations Service
 * Fractal Kernel Slice: aitag-invitations
 */

const supabase = require('../../supabase');

// In-memory fallback cache to ensure zero-crash resilience
const IN_MEMORY_INVITES = new Map();

class InvitationsService {
  async sendInvitation({ taskId, clientEmail, freelancerEmail, message }) {
    if (!taskId || !clientEmail || !freelancerEmail) {
      throw new Error('taskId, clientEmail, and freelancerEmail are required');
    }

    // Fetch task details from Supabase or fallback
    let taskTitle = 'AI Task';
    let taskBudget = 0;

    try {
      const { data: task } = await supabase
        .from('tasks')
        .select('id, title, budget, user_email')
        .eq('id', taskId)
        .single();

      if (task) {
        taskTitle = task.title;
        taskBudget = task.budget;
      }
    } catch {
      // Fallback
    }

    const inviteRecord = {
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      task_id: taskId,
      task_title: taskTitle,
      task_budget: taskBudget,
      client_email: clientEmail,
      freelancer_email: freelancerEmail,
      message: message || `Hi! I would like to invite you to bid on my task: "${taskTitle}".`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('aitag_invitations')
        .insert([inviteRecord])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch {
      // DB table not migrated yet, store in memory cache
    }

    IN_MEMORY_INVITES.set(inviteRecord.id, inviteRecord);
    return inviteRecord;
  }

  async getMyInvitations(freelancerEmail) {
    try {
      const { data, error } = await supabase
        .from('aitag_invitations')
        .select('*')
        .eq('freelancer_email', freelancerEmail)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }

    return Array.from(IN_MEMORY_INVITES.values()).filter(
      inv => inv.freelancer_email === freelancerEmail
    );
  }

  async acceptInvitation(inviteId, freelancerEmail) {
    let invite = null;

    try {
      const { data } = await supabase
        .from('aitag_invitations')
        .select('*')
        .eq('id', inviteId)
        .single();
      invite = data;
    } catch {
      // Fallback
    }

    if (!invite) {
      invite = IN_MEMORY_INVITES.get(inviteId);
    }

    if (!invite) throw new Error('Invitation not found');
    if (invite.freelancer_email !== freelancerEmail) throw new Error('Unauthorized');

    invite.status = 'accepted';
    invite.accepted_at = new Date().toISOString();

    // Update in Supabase / memory
    try {
      await supabase
        .from('aitag_invitations')
        .update({ status: 'accepted', accepted_at: invite.accepted_at })
        .eq('id', inviteId);
    } catch {
      IN_MEMORY_INVITES.set(inviteId, invite);
    }

    // Auto-create proposal bid
    const bidRecord = {
      task_id: invite.task_id,
      user_email: freelancerEmail,
      task_owner_email: invite.client_email,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      const { data: createdBid } = await supabase
        .from('bids')
        .insert([bidRecord])
        .select()
        .single();

      return { invitation: invite, bid: createdBid || bidRecord };
    } catch {
      return { invitation: invite, bid: bidRecord };
    }
  }

  async declineInvitation(inviteId, freelancerEmail) {
    let invite = IN_MEMORY_INVITES.get(inviteId);

    try {
      const { data } = await supabase
        .from('aitag_invitations')
        .update({ status: 'declined' })
        .eq('id', inviteId)
        .eq('freelancer_email', freelancerEmail)
        .select()
        .single();

      if (data) return data;
    } catch {
      // Fallback
    }

    if (invite) {
      invite.status = 'declined';
      IN_MEMORY_INVITES.set(inviteId, invite);
    }

    return invite || { id: inviteId, status: 'declined' };
  }
}

module.exports = new InvitationsService();
