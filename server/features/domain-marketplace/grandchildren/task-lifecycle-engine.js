/**
 * Grandchild: Task Lifecycle Engine
 * Unifies state transitions for both Vetted Experts and Open Marketplace Freelancers
 * Valid states: OPEN -> IN_PROGRESS -> DRAFT_SUBMITTED -> REVISION -> COMPLETED
 */

class TaskLifecycleEngine {
  /**
   * Validate if a transition from currentState to targetState is permitted
   * @param {string} current
   * @param {string} target
   * @returns {boolean}
   */
  canTransition(current = 'open', target) {
    const c = (current || 'open').toLowerCase().replace('_', '-');
    const t = (target || '').toLowerCase().replace('_', '-');

    const validTransitions = {
      'open': ['in-progress', 'assigned', 'cancelled'],
      'assigned': ['in-progress', 'draft-submitted', 'open'],
      'in-progress': ['draft-submitted', 'completed', 'open'],
      'draft-submitted': ['revision', 'completed'],
      'revision': ['draft-submitted', 'completed'],
      'completed': []
    };

    return (validTransitions[c] || []).includes(t);
  }

  /**
   * Normalize state names to standard kebab-case
   */
  normalizeState(state) {
    return (state || 'open').toLowerCase().replace('_', '-');
  }
}

module.exports = new TaskLifecycleEngine();
