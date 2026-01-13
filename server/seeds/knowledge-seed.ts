import { addKnowledge } from '../src/modules/knowledge/services/knowledge.service';

const seedData = [
  // Frontend Developer - Junior
  {
    type: 'job_requirements',
    role: 'Frontend Developer',
    seniority: 'Junior',
    category: 'skills',
    content: 'HTML, CSS, JavaScript, React, Git, REST APIs, responsive design, basic TypeScript, Figma/design tools, debugging with DevTools',
    source: 'Manual - Indeed/LinkedIn 2024',
    confidence: 95
  },
  {
    type: 'job_requirements',
    role: 'Frontend Developer',
    seniority: 'Mid',
    category: 'skills',
    content: 'React/Vue/Angular, TypeScript, Next.js, state management (Redux/Zustand), testing (Jest/Vitest), CI/CD basics, performance optimization, Web APIs, accessibility basics',
    source: 'Manual - 15 job postings',
    confidence: 95
  },
  {
    type: 'job_requirements',
    role: 'Frontend Developer',
    seniority: 'Senior',
    category: 'skills',
    content: 'Advanced React patterns, architecture decisions, mentoring, system design, A/B testing, Web Vitals, accessibility (WCAG), micro-frontends Frontend Developer, SSR/SSG, build optimization',
    source: 'Manual - Senior roles 2024',
    confidence: 90
  },
  
  // Backend Developer
  {
    type: 'job_requirements',
    role: 'Backend Developer',
    seniority: 'Junior',
    category: 'skills',
    content: 'Node.js or Python or Java, SQL basics (PostgreSQL/MySQL), REST APIs, Git, unit testing, basic AWS/GCP, JSON/XML, HTTP protocols, debugging',
    source: 'Manual - Entry level 2024',
    confidence: 95
  },
  {
    type: 'job_requirements',
    role: 'Backend Developer',
    seniority: 'Mid',
    category: 'skills',
    content: 'Microservices, PostgreSQL/MongoDB, Redis caching, Docker, Kubernetes basics, API design patterns, authentication (JWT/OAuth), message queues (RabbitMQ/Kafka), logging/monitoring',
    source: 'Manual - Mid level 2024',
    confidence: 95
  },
  {
    type: 'job_requirements',
    role: 'Backend Developer',
    seniority: 'Senior',
    category: 'skills',
    content: 'System architecture, scalability patterns, database optimization, event-driven architecture, service mesh, observability (Datadog/Sentry Backend Developer), security best practices, team leadership, code review',
    source: 'Manual - Senior 2024',
    confidence: 90
  },
  
  // Full Stack
  {
    type: 'job_requirements',
    role: 'Full Stack Developer',
    seniority: 'Mid',
    category: 'skills',
    content: 'React + Node.js, TypeScript, PostgreSQL, REST/GraphQL APIs, Docker, Git, testing (frontend + backend), deployment (Vercel/Railway), authentication, responsive design',
    source: 'Manual - Full Stack 2024',
    confidence: 90
  },
  
  // ATS Best Practices
  {
    type: 'ats_best_practices',
    category: 'formatting',
    content: 'Use standard fonts (Arial, Calibri, Times New Roman, Helvetica). Avoid tables, text boxes, headers/footers, and images. Use simple bullet points. Save as .docx or PDF. Avoid columns and complex layouts.',
    source: 'ATS Guidelines 2024',
    confidence: 100
  },
  {
    type: 'ats_best_practices',
    category: 'keywords',
    content: 'Mirror exact keywords from job description. Include both acronyms and full terms (e.g., "API" and "Application Programming Interface"). Use standard section headers (Experience, Education, Skills, Summary). Match job title exactly if possible.',
    source: 'ATS Guidelines 2024',
    confidence: 100
  },
  {
    type: 'ats_best_practices',
    category: 'content',
    content: 'Start bullet points with action verbs (Developed, Implemented, Led, Optimized). Quantify achievements with specific metrics (%, numbers, timeframes). Keep to 1-2 pages maximum. Avoid graphics, charts, or creative designs. Use standard bullet points (•), not custom symbols.',
    source: 'ATS Guidelines 2024',
    confidence: 100
  },
  {
    type: 'ats_best_practices',
    category: 'structure',
    content: 'Include contact information at top (email, phone, LinkedIn). List experience in reverse chronological order. Use clear job titles and company names. Include dates in consistent format (MM/YYYY). Add education section with degree, institution, graduation date.',
    source: 'ATS Best Practices',
    confidence: 100
  },
  
  // Tech Trends 2024-2025
  {
    type: 'tech_trends',
    category: 'frontend',
    content: 'React Server Components, Next.js 15 App Router, Tailwind CSS, shadcn/ui component library, TypeScript mandatory in most roles, AI integration (Vercel AI SDK, LangChain), Bun/Deno as alternative runtimes, Astro for content-heavy sites',
    source: 'Stack Overflow Survey 2024 + GitHub Trending',
    confidence: 85
  },
  {
    type: 'tech_trends',
    category: 'backend',
    content: 'Serverless architecture (Vercel Functions, AWS Lambda), Edge computing, GraphQL adoption, tRPC for end-to-end type-safety, PostgreSQL + Drizzle ORM, AI/LLM API integration, vector databases (pgvector, Pinecone), real-time features (WebSockets, Server-Sent Events)',
    source: 'Stack Overflow 2024 + RedMonk',
    confidence: 85
  },
  {
    type: 'tech_trends',
    category: 'devops',
    content: 'Docker + Kubernetes standard, GitHub Actions for CI/CD pipelines, Terraform/Pulumi for Infrastructure as Code, observability tools (Datadog, Sentry, Grafana), platform engineering mindset, GitOps workflows, security scanning in pipelines',
    source: 'DevOps Survey 2024',
    confidence: 80
  },
  {
    type: 'tech_trends',
    category: 'ai_ml',
    content: 'LLM integration in products, RAG (Retrieval-Augmented Generation) architectures, prompt engineering, vector embeddings for semantic search, OpenAI/Anthropic/Gemini APIs, LangChain/LlamaIndex frameworks, fine-tuning considerations',
    source: 'AI Trends 2024',
    confidence: 80
  },
  
  // Soft Skills
  {
    type: 'job_requirements',
    category: 'soft_skills',
    content: 'Communication skills (written and verbal), collaboration in cross-functional teams, problem-solving, adaptability to change, time management, attention to detail, continuous learning mindset, ability to work independently',
    source: 'General requirements',
    confidence: 85
  },
];

export async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base with initial data...');
  
  let successCount = 0;
  for (const data of seedData) {
    try {
      await addKnowledge(data);
      successCount++;
    } catch (error) {
      console.error(`Failed to add knowledge:`, error);
    }
  }
  
  console.log(`✅ Seeded ${successCount}/${seedData.length} knowledge entries`);
}

// Run seed if executed directly
if (require.main === module) {
  seedKnowledgeBase()
    .then(() => {
      console.log('Seed completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
