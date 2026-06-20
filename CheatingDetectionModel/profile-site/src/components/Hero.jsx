import { motion } from 'framer-motion';

const letterVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.04, duration: 0.5, ease: 'easeOut' },
  }),
};

function AnimatedHeading({ text }) {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div className="container" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: '#94a3b8',
              marginBottom: 20,
            }}
          >
            Tech Professional
          </motion.p>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#1e293b',
              marginBottom: 24,
              letterSpacing: '-1.5px',
            }}
          >
            <AnimatedHeading text="Adhip Choudhury" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              fontSize: '1.2rem',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 540,
              marginBottom: 40,
            }}
          >
            Building robust digital solutions with clean architecture and
            modern technologies. Turning complex problems into elegant,
            scalable systems.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <a
              href="#services"
              style={{
                padding: '14px 36px',
                background: '#1e293b',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#334155';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1e293b';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View Services
            </a>
            <a
              href="#contact"
              style={{
                padding: '14px 36px',
                background: 'transparent',
                color: '#1e293b',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#94a3b8';
                e.target.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = 'transparent';
              }}
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          right: '-80px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(12rem, 30vw, 26rem)',
          fontWeight: 900,
          color: '#f1f5f9',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
          letterSpacing: '-6px',
        }}
      >
        AC
      </motion.div>
    </section>
  );
}
