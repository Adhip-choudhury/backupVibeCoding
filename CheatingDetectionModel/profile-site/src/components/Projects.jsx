import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const projects = [
  {
    title: 'ShopFlow',
    subtitle: 'E-Commerce Platform',
    description:
      'A full-featured e-commerce platform with real-time inventory management, payment integration, and an admin dashboard.',
    tags: ['React', 'Node.js', 'Stripe', 'MongoDB'],
    color: '#1e293b',
  },
  {
    title: 'TaskForge',
    subtitle: 'Project Management App',
    description:
      'Collaborative project management tool with Kanban boards, sprint planning, time tracking, and team analytics.',
    tags: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    color: '#334155',
  },
  {
    title: 'HealthSync',
    subtitle: 'Wellness Mobile App',
    description:
      'Cross-platform mobile app for health tracking with workout plans, meal logging, sleep analysis, and progress insights.',
    tags: ['React Native', 'Firebase', 'Redux', 'Expo'],
    color: '#475569',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
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

function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      whileHover={{ y: -6 }}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px -12px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#f1f5f9';
      }}
    >
      <div
        style={{
          height: 8,
          background: project.color,
        }}
      />
      <div style={{ padding: 32 }}>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#94a3b8',
            marginBottom: 6,
          }}
        >
          {project.subtitle}
        </p>
        <h3
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: 12,
          }}
        >
          {project.title}
        </h3>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            lineHeight: 1.7,
            marginBottom: 20,
          }}
        >
          {project.description}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '4px 12px',
                background: '#f8fafc',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 500,
                color: '#475569',
                border: '1px solid #f1f5f9',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section" style={{ background: '#fafbfc' }}>
      <div className="container">
        <FadeInSection>
          <p className="section-label">Portfolio</p>
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            A selection of projects I've built — from web apps to mobile
            experiences.
          </p>
          <div className="divider" />
        </FadeInSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 28,
            marginTop: 48,
          }}
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
