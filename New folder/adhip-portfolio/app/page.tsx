'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
}

/* ── Animated counter ── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ── Data ── */
const stats = [
  { value: 5, suffix: '+', label: 'Years in AI & Development' },
  { value: 20, suffix: '+', label: 'AI Models Deployed' },
  { value: 15, suffix: '+', label: 'Companies Served' },
  { value: 10, suffix: '+', label: 'Professional Certifications' },
]

const techStack = [
  { category: 'AI / ML', items: ['Python', 'TensorFlow', 'PyTorch', 'Claude API', 'OpenAI', 'LangChain', 'n8n', 'MCP'] },
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis'] },
  { category: 'DevOps', items: ['Docker', 'AWS', 'Linux', 'Git', 'CI/CD', 'Vercel'] },
  { category: 'Security', items: ['Ethical Hacking', 'Network Security', 'Risk Assessment', 'SQL', 'Vulnerability Analysis'] },
]

const projects = [
  {
    title: 'AI Audit System',
    desc: 'Automated compliance and risk assessment platform that detects anomalies in real-time across enterprise systems. Reduced audit time by 70%.',
    tags: ['Python', 'ML', 'Anomaly Detection', 'Compliance'],
    status: 'Deployed',
  },
  {
    title: 'Smart Operations Platform',
    desc: 'Predictive maintenance and workflow optimization system for manufacturing. Uses sensor data and ML to predict failures before they happen.',
    tags: ['IoT', 'Predictive ML', 'Real-time Analytics', 'Dashboard'],
    status: 'Deployed',
  },
  {
    title: 'Healthcare AI Diagnostics',
    desc: 'Diagnostic model for early disease detection using patient data analysis. Achieved 94% accuracy on test datasets for initial screening.',
    tags: ['Healthcare', 'Deep Learning', 'Computer Vision', 'HIPAA'],
    status: 'In Progress',
  },
  {
    title: 'AI Agent Framework',
    desc: 'Multi-agent system using MCP protocol for autonomous task execution. Agents collaborate to handle complex workflows without human intervention.',
    tags: ['Agentic AI', 'MCP', 'Claude', 'Automation'],
    status: 'Deployed',
  },
]

const process = [
  { step: '01', title: 'Discovery', desc: 'Deep dive into your business, existing systems, and goals. Identify where AI can create the most impact.' },
  { step: '02', title: 'Architecture', desc: 'Design the AI solution architecture — model selection, data pipelines, integration points, and scalability plan.' },
  { step: '03', title: 'Development', desc: 'Build, train, and iterate. Clean code, thorough testing, and continuous validation against real-world data.' },
  { step: '04', title: 'Deployment', desc: 'Ship to production with monitoring, alerting, and rollback plans. Ensure the system performs under load.' },
  { step: '05', title: 'Optimization', desc: 'Continuous improvement — model retraining, performance tuning, and feature expansion based on usage data.' },
]

const testimonials = [
  {
    quote: 'Adhip transformed our legacy audit process into an intelligent system that catches issues we used to miss entirely. The ROI was visible within weeks.',
    name: 'Sarah Chen',
    role: 'CTO, FinanceCorp',
  },
  {
    quote: 'The AI operations platform he built reduced our downtime by 40%. His understanding of both AI and industrial systems is rare.',
    name: 'Marcus Rivera',
    role: 'VP Operations, ManufactureX',
  },
  {
    quote: 'Working with Adhip felt like having a senior AI engineer on our team. He delivered beyond expectations and explained everything clearly.',
    name: 'Dr. Priya Sharma',
    role: 'Director of Innovation, HealthFirst',
  },
]

const services = [
  { title: 'Web Development', desc: 'Full-stack applications with modern frameworks, AI-powered interfaces, and real-time capabilities.', icon: '⊞' },
  { title: 'App Development', desc: 'Cross-platform mobile apps with native performance, AI features, and seamless cloud integration.', icon: '▦' },
  { title: 'AI Integration', desc: 'Custom ML models, LLM fine-tuning, agent systems, and intelligent automation for any industry.', icon: '⎔' },
  { title: 'AI Consulting', desc: 'Strategy, feasibility analysis, technology selection, and roadmap development for AI adoption.', icon: '◎' },
]

/* ── Page ── */
export default function HomePage() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, 60])

  return (
    <div className="bg-stone-50">
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-24">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="glow-orange w-[600px] h-[600px] -top-48 -right-48 bg-orange-400" />
        <div className="glow-orange w-[400px] h-[400px] bottom-24 -left-24 bg-orange-300" />

        <motion.div className="relative container-wide" style={{ opacity: heroOpacity, y: heroY }}>
          <div className="max-w-4xl">
            <motion.div {...fadeUp(0)}>
              <span className="label inline-flex items-center gap-2 mb-6">
                <span className="badge-dot" />
                Available for projects
              </span>
            </motion.div>

            <motion.h1 className="heading-display text-stone-900 mb-6" {...fadeUp(0.1)}>
              I build AI systems
              <br />
              <span className="gradient-text">that work.</span>
            </motion.h1>

            <motion.p className="body-lg max-w-2xl mb-10" {...fadeUp(0.2)}>
              AI Integration Specialist helping companies embed intelligence into their operations.
              From audit systems to healthcare diagnostics — I design, build, and deploy AI that delivers measurable results.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3" {...fadeUp(0.3)}>
              <Link href="/contact">
                <button className="btn-primary">
                  Start a project
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/services">
                <button className="btn-secondary">View services</button>
              </Link>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            className="mt-20 lg:mt-28 grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 rounded-xl overflow-hidden"
            {...fadeUp(0.4)}
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-stone-50 px-6 py-8">
                <div className="number-display text-stone-900 mb-1">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-stone-400 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── About ─── */}
      <section className="section-lg">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div {...fadeUp()}>
              <span className="label mb-4 block">About</span>
              <h2 className="heading-xl text-stone-900 mb-6">
                Bridging the gap between AI research and real-world impact.
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.15)}>
              <p className="body-lg mb-6">
                I specialize in integrating artificial intelligence into business systems across industries.
                I don&apos;t just build models — I build systems that companies actually use, that solve real problems,
                and that deliver measurable ROI.
              </p>
              <p className="body-md mb-8">
                From AI-powered audit frameworks that detect compliance issues in real time, to smart operations
                platforms that predict equipment failures, to healthcare models that improve diagnostic accuracy —
                every solution I design starts with understanding the business problem first.
              </p>
              <div className="flex flex-wrap gap-2">
                {['AI Audit', 'Smart Operations', 'Healthcare AI', 'Agentic AI', 'Full Stack', 'Cybersecurity'].map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">What I do</span>
            <h2 className="heading-lg text-stone-900">Services built around AI, delivered with precision.</h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-4" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {services.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp(i * 0.08)} className="card-flat">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 flex items-center justify-center text-white text-lg flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="heading-md text-stone-900 mb-2">{s.title}</h3>
                    <p className="body-sm">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="mt-8" {...fadeUp(0.4)}>
            <Link href="/services">
              <button className="btn-secondary">
                Explore all services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Projects ─── */}
      <section className="section-lg">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">Selected work</span>
            <h2 className="heading-lg text-stone-900">Projects that demonstrate real-world AI integration.</h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-6" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {projects.map((p, i) => (
              <motion.div key={p.title} variants={fadeUp(i * 0.1)} className="card group">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.status === 'Deployed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="heading-md text-stone-900 mb-3 group-hover:text-orange-600 transition-colors">{p.title}</h3>
                <p className="body-sm mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="section bg-stone-900 text-white">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block" style={{ color: '#fb923c' }}>Tech stack</span>
            <h2 className="heading-lg">Tools and technologies I work with daily.</h2>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {techStack.map((cat, i) => (
              <motion.div key={cat.category} variants={fadeUp(i * 0.06)}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">{cat.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="section-lg">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">How I work</span>
            <h2 className="heading-lg text-stone-900">A proven process from discovery to deployment.</h2>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {process.map((p, i) => (
              <motion.div key={p.step} {...fadeUp(i * 0.1)} className="relative">
                <div className="text-3xl font-black text-stone-100 mb-3">{p.step}</div>
                <h3 className="heading-md text-stone-900 mb-2">{p.title}</h3>
                <p className="body-sm">{p.desc}</p>
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-3 text-stone-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">Testimonials</span>
            <h2 className="heading-lg text-stone-900">What clients say about working with me.</h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-6" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp(i * 0.1)} className="card">
                <svg className="w-6 h-6 text-orange-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="body-md mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-stone-900">{t.name}</div>
                  <div className="text-xs text-stone-400">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-lg">
        <div className="container-wide">
          <motion.div
            className="relative bg-stone-900 rounded-2xl px-8 py-16 lg:px-16 lg:py-20 overflow-hidden"
            {...fadeUp()}
          >
            <div className="glow-orange w-[400px] h-[400px] -top-32 -right-32 bg-orange-500" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="heading-xl text-white mb-4">
                Ready to integrate AI into your business?
              </h2>
              <p className="text-stone-400 text-lg mb-8">
                Let&apos;s discuss your project and explore how AI can transform your operations.
                No commitment — just a conversation about possibilities.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact">
                  <button className="btn-primary" style={{ background: '#f97316' }}>
                    Get in touch
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </Link>
                <Link href="/certifications">
                  <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    View credentials
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
