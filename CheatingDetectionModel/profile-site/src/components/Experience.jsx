import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const experiences = [
  {
    role: 'Computer Science Student',
    company: 'University',
    period: 'Present',
    description:
      'Pursuing a degree in Computer Science with a focus on software engineering and mobile app development. Building projects across web and mobile platforms.',
    highlights: [
      'Data Structures & Algorithms',
      'Full-Stack Web Development',
      'Mobile App Development',
      'Open Source Contributions',
    ],
  },
  {
    role: 'Freelance Developer',
    company: 'Self-Employed',
    period: 'Ongoing',
    description:
      'Developing web and mobile applications for clients. Managing end-to-end project delivery from requirements gathering to deployment.',
    highlights: [
      'React & React Native Apps',
      'RESTful API Integration',
      'UI/UX Implementation',
      'Client Communication',
    ],
  },
];

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

function TimelineItem({ experience, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      style={{
        position: 'relative',
        paddingLeft: 40,
        paddingBottom: index < experiences.length - 1 ? 48 : 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 6,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#1e293b',
          border: '3px solid #f1f5f9',
          zIndex: 1,
        }}
      />
      {index < experiences.length - 1 && (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 20,
            width: 2,
            bottom: 0,
            background: '#e2e8f0',
          }}
        />
      )}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          border: '1px solid #f1f5f9',
          transition: 'box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(0,0,0,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              {experience.role}
            </h3>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              {experience.company}
            </p>
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#94a3b8',
              background: '#f8fafc',
              padding: '4px 14px',
              borderRadius: 20,
              border: '1px solid #f1f5f9',
            }}
          >
            {experience.period}
          </span>
        </div>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          {experience.description}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {experience.highlights.map((h) => (
            <span
              key={h}
              style={{
                padding: '4px 12px',
                background: '#f8fafc',
                borderRadius: 6,
                fontSize: '0.8rem',
                color: '#475569',
                border: '1px solid #f1f5f9',
              }}
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="section" style={{ background: '#ffffff' }}>
      <div className="container">
        <FadeInSection>
          <p className="section-label">Background</p>
          <h2 className="section-title">Experience</h2>
          <p className="section-subtitle">
            My journey in tech so far — learning, building, and growing.
          </p>
          <div className="divider" />
        </FadeInSection>

        <div style={{ maxWidth: 700, marginTop: 48 }}>
          {experiences.map((exp, i) => (
            <TimelineItem key={i} experience={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
