import React, { useEffect, useRef, useState } from "react";

/**
 * HowItWorks (Modern)
 * - Smooth scroll-driven, spring-smoothed progress
 * - Sequential step fills (01 -> 02 -> 03) with gentle overlap
 * - Gradient ring + glow + glass cards
 */

export default function HowItWorks() {
  const rootRef = useRef<HTMLDivElement>(null);

  // target (raw) progress & smoothed (spring) progress, both 0..1
  const [targetP, setTargetP] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const onScrollOrResize = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Start a bit earlier and finish before fully leaving
      const startOffset = vh * 0.8;  // lower -> starts earlier
      const endExtra = vh * 0.35;    // higher -> finishes sooner
      const total = rect.height + endExtra;
      const scrolled = Math.min(Math.max(startOffset - rect.top, 0), total);
      const t = total > 0 ? scrolled / total : 0;
      setTargetP(Math.max(0, Math.min(1, t)));
    };

    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000; // seconds
      last = now;
      // critically-damped spring toward targetP
      const lambda = 6; // increase for tighter/faster smoothing
      const alpha = 1 - Math.exp(-lambda * dt);
      setP((prev) => prev + (targetP - prev) * alpha);
      raf = requestAnimationFrame(tick);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [targetP]);

  // Segment mapping: take section progress p (0..1) and return per-step progress 0..1.
  const seg = (p: number, start: number, end: number) => {
    const x = Math.max(0, Math.min(1, (p - start) / (end - start)));
    return easeInOutCubic(x);
  };

  // Tuned so each step starts a bit before the previous fully finishes
  const p1 = seg(p, 0.00, 0.46);
  const p2 = seg(p, 0.28, 0.78);
  const p3 = seg(p, 0.56, 1.00);

  return (
    <section ref={rootRef} id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center text-4xl font-semibold">
        How it <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">works</span>
      </h2>
      <p className="mt-3 text-center text-gray-500">
        Three simple steps to transform how you connect.
      </p>

      <div className="mt-14 grid gap-12 md:grid-cols-3">
        <Step index="01" title="Create Your Profile" progress={p1}>
          Upload your photo, add details, and customize your professional presence.
        </Step>
        <Step index="02" title="Share Your QR" progress={p2}>
          Display it anywhere — cards, presentations, signatures, social.
        </Step>
        <Step index="03" title="Connect &amp; Follow Up" progress={p3}>
          People scan, open your profile instantly, and you stay connected.
        </Step>
      </div>
    </section>
  );
}

function Step({
  index,
  title,
  progress, // 0..1
  children,
}: {
  index: string;
  title: string;
  progress: number;
  children: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const deg = `${clamped * 360}deg`;

  // Brand gradient (matches your site's vibe)
  const GRAD =
    "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #60a5fa, #6366f1)";

  return (
    <div className="group">
      {/* Ring wrapper */}
      <div className="relative mx-auto flex h-[78px] w-[78px] items-center justify-center">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-300"
          style={{
            background: GRAD,
            mask: "radial-gradient(circle at center, transparent 54%, black 56%)",
            WebkitMask:
              "radial-gradient(circle at center, transparent 54%, black 56%)",
            opacity: clamped > 0 ? 0.45 : 0.2,
          }}
        />
        {/* Track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "#e5e7eb",
            mask: "radial-gradient(circle at center, transparent 54%, black 56%)",
            WebkitMask:
              "radial-gradient(circle at center, transparent 54%, black 56%)",
          }}
        />
        {/* Fill */}
        <div
          className="absolute inset-0 rounded-full will-change-transform"
          style={{
            background: `conic-gradient(#0000 0deg, #0000 ${deg}, #0000 360deg)`,
            WebkitMask:
              "radial-gradient(circle at center, black 54%, transparent 56%)",
            mask: "radial-gradient(circle at center, black 54%, transparent 56%)",
            // we paint the gradient underneath and reveal with the conic mask
          }}
        />
        {/* Gradient underlay (revealed by mask above) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: GRAD,
            mask: `conic-gradient(#000 ${deg}, #0000 0)`,
            WebkitMask: `conic-gradient(#000 ${deg}, #0000 0)`,
          }}
        />

        {/* Center badge */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-semibold text-gray-800 shadow-inner ring-1 ring-gray-200">
          {index}
        </div>
      </div>

      {/* Line (brand gradient) */}
      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full origin-left rounded-full"
          style={{
            transform: `scaleX(${clamped})`,
            background:
              "linear-gradient(90deg, #6366f1 0%, #8b5cf6 35%, #06b6d4 70%, #60a5fa 100%)",
            transition: "transform 140ms ease-out",
          }}
        />
      </div>

      {/* Card */}
      <div
        className={`mt-6 rounded-2xl border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 ${
          clamped > 0.98 ? "shadow-md ring-1 ring-indigo-200" : ""
        }`}
      >
        <h3 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text font-semibold text-transparent">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{children}</p>
      </div>
    </div>
  );
}

/* ---------- Easing ---------- */
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
