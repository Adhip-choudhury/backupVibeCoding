'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/constants'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mailtoLink, setMailtoLink] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.mailto) {
        setMailtoLink(result.mailto)
        window.location.href = result.mailto
      }
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setMailtoLink(null); formRef.current?.reset() }, 4000)
    } catch {
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(
        `From: ${data.name} (${data.email})\n\n${data.message}`
      )}`
      window.location.href = mailto
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); formRef.current?.reset() }, 4000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-stone-50">
      {/* Header */}
      <section className="pt-24 pb-20 lg:pt-28 lg:pb-28">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div {...fadeUp()}>
              <span className="label mb-4 block">Contact</span>
              <h1 className="heading-display text-stone-900 mb-6">
                Let&apos;s build<br />
                <span className="gradient-text">something great.</span>
              </h1>
              <p className="body-lg">
                Have a project in mind? Want to explore how AI can transform your business?
                I&apos;d love to hear from you. Every great project starts with a conversation.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="lg:pt-8">
              <div className="space-y-6">
                <InfoCard label="Email" value={CONTACT_EMAIL} />
                <InfoCard label="Location" value="Remote — Available Worldwide" />
                <InfoCard label="Response Time" value="Usually within 24 hours" />
                <InfoCard label="Availability" value="Open to new projects" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section bg-stone-100">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <motion.div {...fadeUp()}>
              <div className="text-center mb-10">
                <h2 className="heading-lg text-stone-900 mb-3">Send a message</h2>
                <p className="body-md">Fill out the form below and I&apos;ll get back to you as soon as possible.</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field id="name" label="Name" placeholder="Your name" required />
                  <Field id="email" label="Email" type="email" placeholder="you@example.com" required />
                </div>
                <Field id="subject" label="Subject" placeholder="Project collaboration" required />
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-stone-500 mb-1.5">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-stone-200 text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                    placeholder="Tell me about your project, timeline, and goals..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : submitted ? (
                    '✓ Message sent!'
                  ) : (
                    <>
                      Send message
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>

                {mailtoLink && (
                  <p className="text-center text-xs text-stone-400">
                    If your email client didn&apos;t open,{' '}
                    <a href={mailtoLink} className="text-orange-600 underline">click here</a>
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="section">
        <div className="container-wide">
          <motion.div className="text-center" {...fadeUp()}>
            <h2 className="heading-md text-stone-900 mb-3">Connect on social</h2>
            <p className="body-md mb-8">Follow my work and stay updated on new projects.</p>
            <div className="flex justify-center gap-4">
              {Object.entries(SOCIAL_LINKS).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg bg-white border border-stone-200 text-sm font-medium text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-all capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white border border-stone-100">
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-orange-500" />
      </div>
      <div>
        <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-stone-900">{value}</div>
      </div>
    </div>
  )
}

function Field({ id, label, type = 'text', placeholder, required }: { id: string; label: string; type?: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full px-4 py-3 rounded-lg bg-white border border-stone-200 text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  )
}
