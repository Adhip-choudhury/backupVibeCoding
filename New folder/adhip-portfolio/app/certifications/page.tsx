'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.06 } },
}

const certifications: {
  category: string
  color: string
  items: { title: string; subtitle: string; image?: string; pdf?: string }[]
}[] = [
  {
    category: 'AI & Agents',
    color: '#ea580c',
    items: [
      { title: 'AI Coder', subtitle: 'Complete Claude Code & Coding Agents Course', image: '/certificates/cert_01.png' },
      { title: 'AI Builder', subtitle: 'Create Agents, Voice Agents & Automations in n8n', image: '/certificates/cert_02.png' },
      { title: 'AI Engineer Agentic Track', subtitle: 'The Complete Agent & MCP Course', pdf: '/certificates/Agentic_AI_Engineering_2025.pdf' },
    ],
  },
  {
    category: 'Development',
    color: '#f97316',
    items: [
      { title: 'Full Stack Developer', subtitle: 'Whitehat Certification', image: '/certificates/cert_03.png' },
    ],
  },
  {
    category: 'Cybersecurity',
    color: '#fb923c',
    items: [
      { title: 'Foundations of Cybersecurity', subtitle: 'Google Cybersecurity Certificate', image: '/certificates/cert_04.png' },
      { title: 'Play It Safe: Manage Security Risks', subtitle: 'Google Cybersecurity Certificate' },
      { title: 'Connect and Protect', subtitle: 'Networks and Network Security' },
      { title: 'Tools of the Trade', subtitle: 'Linux and SQL' },
      { title: 'Assets, Threats, and Vulnerabilities', subtitle: 'Google Cybersecurity Certificate', image: '/certificates/cert_05.png' },
    ],
  },
  {
    category: 'Ethical Hacking',
    color: '#f59e0b',
    items: [
      { title: 'Learn Ethical Hacking', subtitle: 'From Scratch 2024', pdf: '/certificates/Learn_Ethical_Hacking_2024.pdf' },
    ],
  },
]

const timeline = [
  { year: '2024', event: 'AI Engineer Agentic Track', detail: 'Completed the full Agent & MCP Course' },
  { year: '2024', event: 'AI Builder Certification', detail: 'n8n Agents, Voice Agents & Automations' },
  { year: '2024', event: 'AI Coder Certification', detail: 'Claude Code & Coding Agents Course' },
  { year: '2024', event: 'Google Cybersecurity Certificate', detail: '5-course specialization completed' },
  { year: '2024', event: 'Ethical Hacking Course', detail: 'Learn Ethical Hacking From Scratch' },
  { year: '2023', event: 'Full Stack Developer', detail: 'Whitehat Certification' },
]

export default function CertificationsPage() {
  return (
    <div className="bg-stone-50">
      {/* Header */}
      <section className="pt-24 pb-20 lg:pt-28 lg:pb-28">
        <div className="container-wide">
          <motion.div className="max-w-3xl" {...fadeUp()}>
            <span className="label mb-4 block">Credentials</span>
            <h1 className="heading-display text-stone-900 mb-6">
              Certified across AI,<br />
              <span className="gradient-text">development & security.</span>
            </h1>
            <p className="body-lg">
              I believe in continuous learning. Every certification represents hours of study, hands-on practice,
              and real-world application. Here&apos;s the full picture of my credentials.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">Learning journey</span>
            <h2 className="heading-lg text-stone-900">A timeline of continuous growth.</h2>
          </motion.div>

          <div className="max-w-2xl">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                className="flex gap-6 pb-8 last:pb-0 relative"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                  {i < timeline.length - 1 && (
                    <div className="w-px h-full bg-stone-200 mt-2" />
                  )}
                </div>
                <div className="pb-2">
                  <span className="mono text-orange-600">{item.year}</span>
                  <h3 className="text-sm font-semibold text-stone-900 mt-1">{item.event}</h3>
                  <p className="body-sm mt-0.5">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="section-lg">
        <div className="container-wide">
          <motion.div className="max-w-2xl mb-12" {...fadeUp()}>
            <span className="label mb-4 block">Certificates</span>
            <h2 className="heading-lg text-stone-900">Verified credentials with proof.</h2>
          </motion.div>

          <div className="space-y-12">
            {certifications.map((group) => (
              <motion.div key={group.category} {...fadeUp()}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">{group.category}</h2>
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="mono text-stone-400">{group.items.length}</span>
                </div>

                <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                  {group.items.map((cert, i) => (
                    <motion.div key={cert.title} variants={fadeUp(i * 0.06)} className="card group overflow-hidden">
                      {cert.image && <CertImage src={cert.image} title={cert.title} />}
                      {cert.pdf && (
                        <a href={cert.pdf} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="h-36 bg-stone-50 flex items-center justify-center border-b border-stone-100 group-hover:bg-stone-100 transition-colors">
                            <div className="text-center">
                              <div className="w-10 h-12 rounded-lg bg-stone-900 flex items-center justify-center mx-auto mb-2">
                                <span className="text-white text-xs font-bold">PDF</span>
                              </div>
                              <span className="text-xs text-stone-400">View certificate</span>
                            </div>
                          </div>
                        </a>
                      )}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                            style={{ background: `${group.color}12`, color: group.color }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-stone-900">{cert.title}</h3>
                            <p className="text-xs text-stone-400 mt-0.5">{cert.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section bg-stone-900 text-white">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10+', label: 'Certifications' },
              { value: '4', label: 'Domains Covered' },
              { value: '2023', label: 'Since' },
              { value: '∞', label: 'Learning' },
            ].map((stat) => (
              <motion.div key={stat.label} {...fadeUp()} className="text-center">
                <div className="text-3xl lg:text-4xl font-black mb-1" style={{ color: '#fb923c' }}>{stat.value}</div>
                <div className="text-xs text-stone-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CertImage({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [showModal])

  if (error) return null

  return (
    <>
      <div
        className="relative h-36 bg-stone-50 cursor-pointer overflow-hidden border-b border-stone-100 group-hover:bg-stone-100 transition-colors"
        onClick={() => setShowModal(true)}
        role="button"
        tabIndex={0}
        aria-label={`View ${title}`}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowModal(true) }}
      >
        <Image
          src={src}
          alt={title}
          fill
          className={`object-contain p-3 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative max-w-3xl w-full max-h-[85vh] rounded-xl overflow-hidden bg-white p-3 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[60vh]">
                <Image src={src} alt={title} fill className="object-contain" sizes="90vw" />
              </div>
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-stone-600 text-sm hover:bg-white transition-colors shadow-md"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
