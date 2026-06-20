import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const skills = [
  { name: 'React', level: 90 },
  { name: 'HTML', level: 95 },
  { name: 'CSS', level: 90 },
  { name: 'JavaScript', level: 85 },
  { name: 'React Native', level: 75 },
  { name: 'App Development', level: 80 },
  { name: 'TypeScript', level: 70 },
  { name: 'Node.js', level: 65 },
  { name: 'Git & GitHub', level: 80 },
  { name: 'UI/UX Design', level: 70 },
];

const iconMap = {
  React: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" /><path d="M12 2a10 10 0 0 0-3.5 8.5A10 10 0 0 0 12 22a10 10 0 0 0 3.5-8.5A10 10 0 0 0 12 2z" /><path d="M12 2a10 10 0 0 1 3.5 8.5A10 10 0 0 1 12 22" /><path d="M2 12h20" /><path d="M5 5a10 10 0 0 1 14 0" /><path d="M5 19a10 10 0 0 1 14 0" />
    </svg>
  ),
  HTML: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 3 5.5 21 12 23 18.5 21 20 3" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8.5" y1="11" x2="15.5" y2="11" /><line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  CSS: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 3 5.5 21 12 23 18.5 21 20 3" /><line x1="6.5" y1="7" x2="17.5" y2="7" /><line x1="7" y1="11" x2="17" y2="11" /><line x1="8.5" y1="15" x2="15.5" y2="15" />
    </svg>
  ),
  JavaScript: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M10 14a2 2 0 1 0 4 0v-5" /><path d="M14 14a2 2 0 1 0 4 0" /><path d="M6 14a2 2 0 1 0 4 0v-5" />
    </svg>
  ),
  'React Native': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  'App Development': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  TypeScript: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2" /><line x1="12" y1="6" x2="12" y2="18" /><polyline points="9 10 9 9 15 9 15 10" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  'Node.js': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  'Git & GitHub': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" /><path d="M12 12v3" />
    </svg>
  ),
  'UI/UX Design': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" /><line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    </svg>
  ),
};

function FadeInSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function SkillBar({ name, level, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          {iconMap[name] || null}
          {name}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{level}%</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1, delay: index * 0.06, ease: 'easeOut' }}
          style={{ height: '100%', background: '#1e293b', borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section" style={{ background: '#ffffff' }}>
      <div className="container">
        <FadeInSection>
          <p className="section-label">Expertise</p>
          <h2 className="section-title">Skills & Tech Stack</h2>
          <p className="section-subtitle">
            Technologies I work with daily to build modern, scalable solutions.
          </p>
          <div className="divider" />
        </FadeInSection>

        <div style={{ maxWidth: 650, marginTop: 48 }}>
          {skills.map((skill, i) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
