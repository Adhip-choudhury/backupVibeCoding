'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/certifications', label: 'Credentials' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Floating pill navbar */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4" role="navigation" aria-label="Main navigation">
        <motion.div
          className={`relative flex items-center transition-all duration-500 ${
            scrolled ? 'shadow-lg shadow-stone-200/50' : 'shadow-md shadow-stone-200/30'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 16,
          }}
        >
          <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2">
            <Link href="/" className="flex items-center gap-2.5 pr-2 sm:pr-3 mr-2 sm:mr-3 border-r border-stone-200/60" aria-label="Home">
              <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">AC</span>
              </div>
              <span className="text-sm font-semibold text-stone-900 hidden sm:block whitespace-nowrap">
                Adhip
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`relative px-3 py-1.5 text-[0.8125rem] font-medium transition-colors rounded-lg ${
                      isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
                    }`}>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="hidden md:block ml-1 pl-2 border-l border-stone-200/60">
              <Link href="/contact">
                <button className="px-3.5 py-1.5 text-[0.8125rem] font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-sm">
                  Let&apos;s talk
                </button>
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <motion.span
                  className="block h-[1.5px] bg-stone-600 rounded-full origin-center"
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                />
                <motion.span
                  className="block h-[1.5px] bg-stone-600 rounded-full"
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                />
                <motion.span
                  className="block h-[1.5px] bg-stone-600 rounded-full origin-center"
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                />
              </div>
            </button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl overflow-hidden shadow-xl shadow-stone-200/50"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50'
                    }`}>
                      {item.label}
                    </div>
                  </Link>
                )
              })}
              <div className="pt-2">
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-3 text-sm font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors">
                    Let&apos;s talk
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
