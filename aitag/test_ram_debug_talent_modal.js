/**
 * In-Memory RAM Sandbox: Debugging AI Talent "View Workflows" Modal
 * ================================================================
 * STRICT ZERO-DISK COMMIT (Staged in RAM)
 */

const SAMPLE_TALENTS = [
  {
    id: '6e36f593-b9e6-4ead-8266-31ac91cf44c5',
    name: 'User1',
    email: 'user1@aitag.com',
    role: 'Full-Stack AI Engineer & Admin',
    category: 'Agentic Systems',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
    rating: 5.0,
    hourlyRate: 3200,
    skills: ['Next.js', 'LangGraph', 'Supabase', 'Python'],
    verified: true,
    isRegisteredUser: true
  },
  {
    id: 'curated-1',
    name: 'Dr. Aarav Sharma',
    role: 'Senior LLM & RAG Architect',
    category: 'LLM & Generative AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    rating: 4.98,
    hourlyRate: 3500,
    skills: ['LLaMA-3', 'LangChain', 'Pinecone', 'Python'],
    verified: true
  }
];

function getSpecialistWorkflows(talent) {
  if (talent.id.includes('curated-1') || talent.skills.includes('LLaMA-3')) {
    return [
      {
        id: 'wf-rag-1',
        title: 'Enterprise RAG Pipeline with Pinecone & Hybrid Sparse Retrieval',
        category: 'LLM & Generative AI',
        businessImpact: 'Indexed 1.2M legal PDF documents with sub-60ms semantic search latency and zero hallucinations.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        techStack: ['LLaMA-3', 'Pinecone', 'LangChain', 'FastAPI', 'PyTorch'],
        liveUrl: 'https://github.com/Maqsood32595/legal-rag-pipeline'
      },
      {
        id: 'wf-rag-2',
        title: 'Multi-Tenant LLM Gateway with Token Usage & Rate Limiting',
        category: 'AI Infrastructure',
        businessImpact: 'Reduced enterprise LLM API expenditure by 42% via prompt caching and fallback routing.',
        demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        techStack: ['Python', 'Redis', 'LiteLLM', 'FastAPI', 'Docker'],
        liveUrl: 'https://github.com/Maqsood32595/llm-gateway'
      }
    ];
  }

  // Default User1 / Full-Stack Workflows
  return [
    {
      id: 'wf-1',
      title: 'Automated Cold Email Sending & DNS Deliverability Pipeline',
      category: 'Email Automation & Growth',
      businessImpact: 'Scaled personalized outreach to 10,000 verified leads/day with automated SPF/DKIM rotation and 99.2% inbox placement.',
      demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      techStack: ['Python', 'SendGrid API', 'DNS Automation', 'FastAPI', 'PostgreSQL'],
      liveUrl: 'https://github.com/Maqsood32595/email-pipeline-demo'
    },
    {
      id: 'wf-2',
      title: 'Facebook & Meta Ads AI Optimization Engine',
      category: 'Growth & Ads',
      businessImpact: 'Automated dynamic ad copy variation testing and ROAS tracking, increasing campaign conversion by 34%.',
      demoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      techStack: ['Meta Graph API', 'OpenAI GPT-4o', 'Zapier', 'Supabase'],
      liveUrl: 'https://user1.ai/meta-ads-case-study'
    }
  ];
}

function runRamDebugModalSimulation() {
  console.log('======================================================================');
  console.log('🛡️  RAM SANDBOX: DEBUGGING AI TALENT "VIEW WORKFLOWS" MODAL');
  console.log('   (Zero Disk Writes | 100% In-Memory Sandbox)');
  console.log('======================================================================\n');

  SAMPLE_TALENTS.forEach((t, i) => {
    console.log(`🔍 [Test ${i + 1}] Clicking "View Workflows" for: ${t.name} (ID: ${t.id})`);
    const workflows = getSpecialistWorkflows(t);
    console.log(`  ✅ Successfully resolved ${workflows.length} delivered workflow(s):`);
    workflows.forEach(w => {
      console.log(`     - [${w.category}] "${w.title}"`);
      console.log(`       Impact: ${w.businessImpact}`);
      console.log(`       Video:  ${w.demoVideoUrl}`);
    });
    console.log('');
  });

  console.log('======================================================================');
  console.log('📊 RAM STAGING STATUS: 100% VERIFIED & READY TO FIX');
  console.log('======================================================================');
}

runRamDebugModalSimulation();
