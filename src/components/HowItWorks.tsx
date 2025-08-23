import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const STEPS = [
  {
    id: 1,
    title: "Create Your Profile",
    description: "Upload your photo, add details, customize your professional presence."
  },
  {
    id: 2,
    title: "Share Your QR",
    description: "Display it anywhere — cards, presentations, signatures, social."
  },
  {
    id: 3,
    title: "Connect & Follow Up",
    description: "People scan, open your profile instantly, and you stay connected."
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeStep, setActiveStep] = React.useState(1);

  // Track which step is in view
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const stepId = parseInt(entry.target.getAttribute('data-step') || '1');
            setActiveStep(stepId);
          }
        });
      },
      { threshold: 0.5 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const getStepState = (stepId: number) => {
    if (stepId < activeStep) return 'completed';
    if (stepId === activeStep) return 'current';
    return 'inactive';
  };

  return (
    <section ref={containerRef} className="relative py-16 sm:py-20 bg-background/80 backdrop-blur">
      <div className="container mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-extrabold text-center text-foreground mb-6"
        >
          How it <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-sky-400">works</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-muted-foreground"
        >
          Three simple steps to transform how you connect.
        </motion.p>

                {/* Timeline */}
        <div className="relative mt-16">
          {/* Desktop: Horizontal timeline */}
          <div className="hidden md:block relative mx-auto max-w-6xl">
            {/* Inactive rail */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-muted/30 rounded" />

            {/* Active fill (animate width to the current step center) */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded bg-gradient-to-r from-violet-500 to-sky-400"
              animate={{ width: ['16.66%', '50%', '83.33%'][activeStep - 1] || '0%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            />

            {/* MASK CAPS – hide the rail under badges so line never enters the circles */}
            {['16.66%','50%','83.33%'].map((left, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 rounded-full"
                style={{
                  left,
                  // slightly larger than the badge so the rail can't peek out
                  width: '54px',
                  height: '54px',
                  // match your section background so it visually "cuts" the line
                  background: 'var(--background, #fff)',
                  // soft blur edge so the cut blends on gradients
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
                }}
              />
            ))}

            {/* STEP BADGES (render these AFTER the caps so they sit above) */}
            <div className="relative z-20 grid grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={[
                      'h-12 w-12 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                      i === activeStep - 1
                        ? 'bg-gradient-to-r from-violet-500 to-sky-400 text-white shadow-lg scale-105'
                        : i < activeStep - 1
                        ? 'bg-gradient-to-r from-violet-500 to-sky-400/80 text-white'
                        : 'bg-background border border-muted text-muted-foreground'
                    ].join(' ')}
                    aria-current={i === activeStep - 1 ? 'step' : undefined}
                  >
                    {step.id.toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden relative mx-auto max-w-sm">
            {/* Inactive rail */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-muted/30 rounded -translate-x-1/2" />

            {/* Active fill */}
            <motion.div
              className="absolute left-1/2 top-0 w-[2px] rounded bg-gradient-to-b from-violet-500 to-sky-400 -translate-x-1/2"
              animate={{ height: ['16.66%', '50%', '83.33%'][activeStep - 1] || '0%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            />

            {/* MASK CAPS for mobile */}
            {['16.66%','50%','83.33%'].map((top, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  top,
                  width: '54px',
                  height: '54px',
                  background: 'var(--background, #fff)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
                }}
              />
            ))}

            {/* STEP BADGES for mobile */}
            <div className="relative z-20 grid grid-rows-3 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={[
                      'h-12 w-12 rounded-full flex items-center justify-center font-bold transition-all duration-300',
                      i === activeStep - 1
                        ? 'bg-gradient-to-r from-violet-500 to-sky-400 text-white shadow-lg scale-105'
                        : i < activeStep - 1
                        ? 'bg-gradient-to-r from-violet-500 to-sky-400/80 text-white'
                        : 'bg-background border border-muted text-muted-foreground'
                    ].join(' ')}
                    aria-current={i === activeStep - 1 ? 'step' : undefined}
                  >
                    {step.id.toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Content */}
          <div 
            role="list" 
            className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12"
          >
            {STEPS.map((step, index) => {
              const stepRef = useRef<HTMLElement>(null);
              
              // Store ref for intersection observer
              React.useEffect(() => {
                stepRefs.current[index] = stepRef.current;
              }, [index]);

              return (
                <motion.div
                  key={step.id}
                  ref={stepRef}
                  data-step={step.id}
                  role="listitem"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative text-center md:text-left"
                >
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA - Only show under Step 3 */}
          {activeStep === 3 && (
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-500 to-sky-400 text-white hover:shadow-lg hover:scale-105 transition-all duration-300">
                Start Building Your Profile
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
