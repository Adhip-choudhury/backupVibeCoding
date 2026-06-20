import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/constants'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Credentials', href: '/certifications' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-stone-100 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AC</span>
                </div>
                <span className="text-sm font-semibold text-stone-900">Adhip Choudhury</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                AI Integration Specialist helping companies build intelligent, adaptive systems.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">Navigation</h4>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">Services</h4>
              <ul className="space-y-3">
                {['Web Development', 'App Development', 'AI Solutions', 'Consulting'].map((item) => (
                  <li key={item}>
                    <Link href="/services" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-4">Connect</h4>
              <ul className="space-y-3">
                {Object.entries(SOCIAL_LINKS).map(([platform, url]) => (
                  <li key={platform}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-stone-500 hover:text-stone-900 transition-colors capitalize"
                    >
                      {platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400">
              &copy; {year} Adhip Choudhury. All rights reserved.
            </p>
            <p className="text-xs text-stone-400">
              Built with Next.js & Framer Motion
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
