import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

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

const highlights = [
  { number: '5+', label: 'Years Experience' },
  { number: '30+', label: 'Projects Delivered' },
  { number: '20+', label: 'Happy Clients' },
];

export default function About() {
  return (
    <section id="about" className="section" style={{ background: '#fafbfc' }}>
      <div className="container">
        <FadeInSection>
          <p className="section-label">About Me</p>
          <h2 className="section-title">
            Crafting code that
            <br />
            makes an impact.
          </h2>
          <div className="divider" />
        </FadeInSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            marginTop: 48,
          }}
        >
          <FadeInSection delay={0.15}>
            <p
              style={{
                fontSize: '1.05rem',
                color: '#475569',
                lineHeight: 1.8,
              }}
            >
              I'm a full-stack developer and tech architect with a passion for
              building products that are both beautiful and brutally functional.
              I specialize in modern JavaScript ecosystems, cloud-native
              infrastructure, and crafting seamless user experiences.
              <br />
              <br />
              My approach combines deep technical expertise with a keen eye for
              design, ensuring every project I touch is performant, accessible,
              and maintainable at scale.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              {highlights.map((h) => (
                <div
                  key={h.label}
                  style={{
                    padding: 24,
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #f1f5f9',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    {h.number}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {h.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
