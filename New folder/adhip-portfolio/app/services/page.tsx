'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

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

const services = [
  {
    title: 'Web Development',
    desc: 'From landing pages to complex enterprise platforms, I build web applications that are fast, accessible, and scalable.',
    details: [
      'Full-stack development with Next.js and React',
      'AI-powered search, recommendations, and chatbots',
      'Real-time dashboards and data visualization',
      'API design, integration, and microservices',
      'Performance optimization and SEO',
    ],
    icon: '⊞',
  },
  {
    title: 'App Development',
    desc: 'Cross-platform mobile applications with native performance, beautiful UI, and intelligent features powered by AI.',
    details: [
      'React Native and Flutter development',
      'AI-native features: voice, vision, prediction',
      'Offline-first architecture',
      'Push notifications and real-time sync',
      'App Store optimization and deployment',
    ],
    icon: '▦',
  },
  {
    title: 'AI Integration',
    desc: 'End-to-end AI solutions — from model selection and training to deployment and monitoring in production environments.',
    details: [
      'Custom ML model development and training',
      'LLM integration, fine-tuning, and RAG systems',
      'AI agent design with MCP protocol',
      'Computer vision and NLP pipelines',
      'Model monitoring, retraining, and optimization',
    ],
    icon: '⎔',
  },
  {
    title: 'AI Consulting',
    desc: 'Strategic guidance on AI adoption — from feasibility studies to technology selection and implementation roadmaps.',
    details: [
      'AI readiness assessment and gap analysis',
      'Technology stack selection and architecture',
      'ROI modeling and business case development',
      'Team training and knowledge transfer',
      'Ongoing advisory and technical review',
    ],
    icon: '◎',
  },
]

const industries = [
  { name: 'Healthcare', desc: 'Diagnostics, patient outcomes, drug discovery' },
  { name: 'Finance', desc: 'Fraud detection, risk assessment, algorithmic trading' },
  { name: 'Manufacturing', desc: 'Predictive maintenance, quality control, supply chain' },
  { name: 'Retail', desc: 'Recommendation engines, inventory optimization, personalization' },
  { name: 'Logistics', desc: 'Route optimization, demand forecasting, fleet management' },
  { name: 'Energy', desc: 'Grid optimization, predictive maintenance, consumption analysis' },
  { name: 'Education', desc: 'Adaptive learning, automated grading, student analytics' },
  { name: 'Real Estate', desc: 'Property valuation, market analysis, virtual tours' },
]

const faqs = [
  {
    q: 'How long does a typical AI integration project take?',
    a: 'It depends on complexity. A simple AI feature (like a chatbot) can be deployed in 2-4 weeks. Full-scale AI systems (audit platforms, diagnostic models) typically take 2-6 months. I provide detailed timelines during the discovery phase.',
  },
  {
    q: 'Do I need existing data infrastructure for AI?',
    a: 'Not necessarily. I can help you set up data pipelines, clean existing data, and build the infrastructure needed for AI. Many projects start with data assessment and preparation as the first phase.',
  },
  {
    q: 'Can you work with my existing tech stack?',
    a: 'Yes. I integrate AI into whatever systems you already have — whether that\'s legacy databases, cloud platforms, or custom applications. I adapt to your stack rather than forcing you to change.',
  },
  {
    q: 'What happens after deployment?',
    a: 'I provide ongoing support including model monitoring, performance optimization, retraining with new data, and feature expansion. Most clients transition to a maintenance and optimization retainer.',
  },
  {
    q: 'How do you ensure AI model accuracy?',
    a: 'Through rigorous testing: cross-validation, A/B testing, real-world pilot programs, and continuous monitoring. I never deploy a model without validating it against your actual data and use cases.',
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-stone-50">
      {/* Header */}
      <section className="pt-24 pb-20 lg:pt-28 lg:pb-28">
        <div className="container-wide">
          <motion.div className="max-w-3xl" {...fadeUp()}>
            <span className="label mb-4 block">Services</span>
            <h1 className="heading-display text-stone-900 mb-6">
              End-to-end solutions,<br />
              <span className="gradient-text">AI at the core.</span>
            </h1>
            <p className="body-lg">
              Every service I offer is designed with artificial intelligence as a fundamental component — not an afterthought.
              From initial concept to production deployment, I deliver solutions that are intelligent, scalable, and built to last.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-wide">
          <motion.div className="grid md:grid-cols-2 gap-6" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {services.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp(i * 0.08)} className="card group">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center text-white text-xl flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <h2 className="heading-md text-stone-900">{s.title}</h2>
                    <p className="body-sm mt-1">{s.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 body-sm">
                      <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industries */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">Industries</span>
            <h2 className="heading-lg text-stone-900">AI solutions across every sector.</h2>
            <p className="body-md mt-4">
              AI isn&apos;t industry-specific — it&apos;s a capability that transforms any business.
              Here are the sectors where I&apos;ve delivered the most impact.
            </p>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {industries.map((ind, i) => (
              <motion.div key={ind.name} variants={fadeUp(i * 0.05)} className="card-flat group">
                <h3 className="text-sm font-semibold text-stone-900 mb-1 group-hover:text-orange-600 transition-colors">{ind.name}</h3>
                <p className="body-sm">{ind.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="section-lg">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div {...fadeUp()}>
              <span className="label mb-4 block">Process</span>
              <h2 className="heading-lg text-stone-900 mb-6">
                How I take your idea from concept to production.
              </h2>
              <p className="body-md">
                Every project follows a structured process that ensures quality, transparency, and alignment with your business goals.
                You&apos;ll know exactly what&apos;s happening at every stage.
              </p>
            </motion.div>

            <div className="space-y-0">
              {[
                { step: '01', title: 'Discovery & Assessment', desc: 'Understanding your business, data, and goals. Identifying the highest-impact AI opportunities.' },
                { step: '02', title: 'Solution Architecture', desc: 'Designing the technical architecture — model selection, data pipelines, integration strategy.' },
                { step: '03', title: 'Development & Training', desc: 'Building the solution with clean code, training models on your data, and iterative testing.' },
                { step: '04', title: 'Testing & Validation', desc: 'Rigorous testing against real-world scenarios, performance benchmarking, and stakeholder review.' },
                { step: '05', title: 'Deployment & Monitoring', desc: 'Production deployment with monitoring, alerting, and a plan for continuous improvement.' },
              ].map((p, i) => (
                <motion.div
                  key={p.step}
                  {...fadeUp(i * 0.1)}
                  className="flex gap-6 py-6 border-b border-stone-200 last:border-0"
                >
                  <span className="text-2xl font-black text-stone-100 flex-shrink-0">{p.step}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-1">{p.title}</h3>
                    <p className="body-sm">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div {...fadeUp()}>
              <span className="label mb-4 block">FAQ</span>
              <h2 className="heading-lg text-stone-900 mb-6">Common questions about working together.</h2>
              <p className="body-md">
                If you don&apos;t find your answer here, feel free to reach out directly.
                I&apos;m happy to discuss your specific situation.
              </p>
              <div className="mt-8">
                <Link href="/contact">
                  <button className="btn-primary">Ask a question</button>
                </Link>
              </div>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg">
        <div className="container-wide">
          <motion.div className="bg-stone-900 rounded-2xl px-8 py-16 lg:px-16 lg:py-20 text-center relative overflow-hidden" {...fadeUp()}>
            <div className="glow-orange w-[300px] h-[300px] -top-24 -right-24 bg-orange-500" />
            <div className="relative z-10">
              <h2 className="heading-xl text-white mb-4">Let&apos;s build something intelligent.</h2>
              <p className="text-stone-400 text-lg max-w-xl mx-auto mb-8">
                Whether you need a full AI system or just want to explore what&apos;s possible — let&apos;s talk.
              </p>
              <Link href="/contact">
                <button className="btn-primary" style={{ background: '#f97316' }}>
                  Start a conversation
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function FAQItem({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-xl border border-stone-100 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-semibold text-stone-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 body-sm">{answer}</p>
      </motion.div>
    </motion.div>
  )
}
