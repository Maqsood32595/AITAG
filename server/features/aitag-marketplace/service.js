/**
 * AITAG Marketplace Service
 * Role-Based User Management (Admin, Client, Freelancer),
 * Jobs, Proposals, & Escrow Payment Scaffolding.
 */

class AITAGMarketplaceService {
  constructor() {
    this.users = [
      { id: "usr_01", name: "Mohammed Maqsood", role: "Admin", email: "admin@aitag.com" },
      { id: "usr_02", name: "FinTech Systems", role: "Client", email: "client@fintech.com" },
      { id: "usr_03", name: "Alex Chen", role: "Freelancer", email: "alex@dev.com" }
    ];

    this.jobs = [
      {
        id: "job_101",
        title: "Full-Stack React/Node Refactoring via Sandwich AST Engine",
        category: "AI Code Generation",
        budget: 65000,
        currency: "INR",
        clientName: "FinTech Systems",
        status: "ACTIVE",
        proposalsCount: 3,
        roles: ["Client", "Freelancer"],
        escrowStatus: "SECURED_BY_RBI_TRUSTEE",
        description: "Migrate 100 React components to TypeScript using 15-token Sandwich AST slices."
      },
      {
        id: "job_102",
        title: "Implement Sec 194-O TDS & RBI Escrow Ledger",
        category: "Fintech Compliance",
        budget: 95000,
        currency: "INR",
        clientName: "Enterprise Global",
        status: "ACTIVE",
        proposalsCount: 5,
        roles: ["Client", "Freelancer"],
        escrowStatus: "SECURED_BY_RBI_TRUSTEE",
        description: "Automated 1% TDS deduction and Cashfree Easy Split Escrow integration."
      }
    ];

    this.proposals = [
      {
        id: "prop_01",
        jobId: "job_101",
        freelancerName: "Alex Chen",
        bidAmount: 60000,
        deliveryDays: 1,
        coverLetter: "Will execute via AITAG Sandwich AST Parallel Slicer in sub-second time."
      }
    ];
  }

  getJobs() {
    return this.jobs;
  }

  getUsers() {
    return this.users;
  }

  createJob({ title, category, budget, clientName, description }) {
    const newJob = {
      id: `job_${Date.now()}`,
      title,
      category: category || "AI Engineering",
      budget: Number(budget) || 15000,
      currency: "INR",
      clientName: clientName || "Client User",
      status: "ACTIVE",
      proposalsCount: 0,
      roles: ["Client", "Freelancer"],
      escrowStatus: "SECURED_BY_RBI_TRUSTEE",
      description: description || "No description provided",
      createdAt: new Date().toISOString()
    };
    this.jobs.unshift(newJob);
    return newJob;
  }

  submitProposal({ jobId, freelancerName, bidAmount, coverLetter }) {
    const prop = {
      id: `prop_${Date.now()}`,
      jobId,
      freelancerName: freelancerName || "Freelancer Agent",
      bidAmount: Number(bidAmount),
      deliveryDays: 1,
      coverLetter
    };
    this.proposals.push(prop);

    const job = this.jobs.find(j => j.id === jobId);
    if (job) job.proposalsCount++;

    return prop;
  }
}

module.exports = new AITAGMarketplaceService();
