import { useState, useEffect, useCallback, useRef } from 'react';

export type Step = {
  id: number;
  title: string;
  summary: string;
  details?: string;
  ctaLabel?: string;
};

export const STEPS: Step[] = [
  { 
    id: 1, 
    title: "Create Your Profile", 
    summary: "Upload your photo, add details, customize your professional presence.", 
    details: "Fast onboarding with live preview." 
  },
  { 
    id: 2, 
    title: "Share Your QR", 
    summary: "Display it anywhere — cards, presentations, signatures, social.", 
    details: "Device-aware links for a frictionless open." 
  },
  { 
    id: 3, 
    title: "Connect & Follow Up", 
    summary: "Scans open your profile instantly. Capture leads and stay connected.", 
    details: "Built-in forms, CRM handoffs, and alerts." 
  }
];

interface UseStepProgressProps {
  steps: number;
}

export const useStepProgress = ({ steps }: UseStepProgressProps) => {
  const [current, setCurrent] = useState(1);
  const containerRef = useRef<HTMLElement>(null);

  // URL sync
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= steps) {
        setCurrent(step);
      }
    }
  }, [steps]);

  // Update URL when step changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', current.toString());
    window.history.replaceState({}, '', url.toString());
  }, [current]);

  // Scroll detection
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const stepId = parseInt(entry.target.getAttribute('data-step') || '1');
            setCurrent(stepId);
          }
        });
      },
      { threshold: 0.5 }
    );

    const stepElements = containerRef.current.querySelectorAll('[data-step]');
    stepElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrent(prev => Math.min(prev + 1, steps));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrent(prev => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps]);

  const next = useCallback(() => {
    setCurrent(prev => Math.min(prev + 1, steps));
  }, [steps]);

  const prev = useCallback(() => {
    setCurrent(prev => Math.max(prev - 1, 1));
  }, [steps]);

  return {
    current,
    setCurrent,
    next,
    prev,
    containerRef,
    isFirst: current === 1,
    isLast: current === steps,
  };
};
