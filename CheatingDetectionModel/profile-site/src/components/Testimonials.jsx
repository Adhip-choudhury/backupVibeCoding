import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    quote:
      'Adhip delivered beyond expectations. The attention to detail and clean code made the project a breeze to maintain.',
    author: 'Sarah Chen',
    role: 'Product Manager, TechStart',
  },
  {
    quote:
      'Working with Adhip was a fantastic experience. Great communication, solid technical skills, and always on time.',
    author: 'Marcus Rivera',
    role: 'Founder, DevCraft',
  },
  {
    quote:
      'The app Adhip built for us transformed our workflow. Intuitive design and rock-solid performance.',
    author: 'Emily Nakamura',
    role: 'CTO, FlowLabs',
  },
  {
    quote:
      'Exceptional problem solver. Adhip has a rare ability to translate complex requirements into elegant solutions.',
    author: 'James Okafor',
    role: 'Lead Engineer, CloudBase',
  },
];

const colors = ['#1e293b', '#334155', '#475569', '#64748b'];

function FadeInSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function Testimonials() {
  const [[current, direction], setPage] = useState([0, 1]);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const next = useCallback(() => {
    setPage(([c]) => [(c + 1) % testimonials.length, 1]);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (paused) return;
    const tick = 40;
    const duration = 5000;
    const step = 100 / (duration / tick);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const nextVal = p + step;
        if (nextVal >= 100) {
          next();
          return 0;
        }
        return nextVal;
      });
    }, tick);
    return () => clearInterval(intervalRef.current);
  }, [paused, next]);

  const paginate = (dir) => {
    setPage(([c]) => [(c + dir + testimonials.length) % testimonials.length, dir]);
    setProgress(0);
  };

  const color = colors[current];

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      rotateY: dir > 0 ? 15 : -15,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      rotateY: dir > 0 ? -15 : 15,
      scale: 0.9,
    }),
  };

  return (
    <section className="section" style={{ background: '#ffffff', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
        }}
      />
      <div className="container">
        <FadeInSection>
          <p className="section-label">Kind Words</p>
          <h2 className="section-title">Testimonials</h2>
          <p className="section-subtitle">
            What people say about working with me.
          </p>
          <div className="divider" />
        </FadeInSection>

        <div
          style={{
            maxWidth: 700,
            margin: '60px auto 0',
            position: 'relative',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Progress bar */}
          <div
            style={{
              height: 3,
              background: '#f1f5f9',
              borderRadius: 2,
              marginBottom: 40,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: color,
                borderRadius: 2,
                width: `${progress}%`,
                transition: 'width 0.04s linear, background 0.5s ease',
              }}
            />
          </div>

          {/* Carousel */}
          <div
            style={{
              perspective: 1000,
              minHeight: 280,
              position: 'relative',
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '44px 44px 40px',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                }}
              >
                {/* Quote icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 24,
                    color,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                  </svg>
                </div>

                <p
                  style={{
                    fontSize: '1.1rem',
                    color: '#475569',
                    lineHeight: 1.8,
                    fontStyle: 'italic',
                    marginBottom: 28,
                  }}
                >
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                      transition: 'background 0.5s ease',
                    }}
                  >
                    {testimonials[current].author.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      {testimonials[current].author}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>
                      {testimonials[current].role}
                    </p>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    overflow: 'hidden',
                    borderRadius: '0 20px 0 0',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -40,
                      right: -40,
                      width: 80,
                      height: 80,
                      background: color,
                      opacity: 0.04,
                      borderRadius: '50%',
                      transition: 'background 0.5s ease',
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              marginTop: 32,
            }}
          >
            <button
              onClick={() => paginate(-1)}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                transition: 'all 0.2s',
                fontSize: '1.1rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage([i, i > current ? 1 : -1]);
                    setProgress(0);
                  }}
                  style={{
                    width: i === current ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    background: i === current ? color : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                transition: 'all 0.2s',
                fontSize: '1.1rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
