'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
          <span className="text-xs font-bold text-white">AC</span>
        </div>
        <motion.div
          className="w-12 h-px bg-stone-200 overflow-hidden rounded-full"
        >
          <motion.div
            className="h-full bg-stone-900 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en">
      <head>
        <title>Adhip Choudhury — AI Integration Specialist</title>
        <meta name="description" content="AI Integration Specialist — Expert in AI audit systems, smart operations, healthcare AI, and full-stack development" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen />}
        </AnimatePresence>

        <div className="relative min-h-screen flex flex-col">
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </body>
    </html>
  )
}
