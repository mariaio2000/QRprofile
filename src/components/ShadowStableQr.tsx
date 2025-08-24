"use client";

import React, { memo, useEffect, useLayoutEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * FINAL FIX FOR "BLINKING" QR
 * - Renders inside a Shadow DOM so parent CSS/animations/opacity/transforms cannot affect it.
 * - Writes a static <img> with a data URL; no re-draw on parent re-renders.
 * - Uses layout containment + its own compositing layer to prevent flicker.
 *
 * Usage:
 *   npm i qrcode
 *   <ShadowStableQr value="https://example.com" size={256} />
 */
type Props = {
  value: string;
  size?: number;                 // px
  ecLevel?: "L" | "M" | "Q" | "H";
  className?: string;            // applied to host (not inside shadow)
};

const ShadowStableQr = memo(function ShadowStableQr({
  value,
  size = 192,
  ecLevel = "M",
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Create Shadow DOM once
  useLayoutEffect(() => {
    const host = hostRef.current!;
    if (!shadowRef.current) {
      shadowRef.current = host.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host { all: initial; }
        /* Hard-disable anything that could cause flicker inside */
        * { animation: none !important; transition: none !important; filter: none !important; }
        img {
          display: block;
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
          border-radius: 12px;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .placeholder {
          width: 100%; height: 100%;
          background: #f3f4f6; /* neutral-100 */
          border-radius: 12px;
        }
      `;
      const wrap = document.createElement("div");
      wrap.className = "placeholder";
      shadowRef.current.append(style, wrap);
    }
  }, []);

  // Generate data URL when value/size/ecLevel change
  useEffect(() => {
    let alive = true;
    (async () => {
      const url = await QRCode.toDataURL(value, {
        errorCorrectionLevel: ecLevel,
        width: size,
        margin: 0,
        scale: 8,
        color: { dark: "#000000", light: "#ffffff" },
      });
      if (!alive) return;

      // Swap placeholder → img only once, no layout thrash
      const shadow = shadowRef.current!;
      if (!imgRef.current) {
        const img = document.createElement("img");
        imgRef.current = img;
        shadow.replaceChildren(shadow.querySelector("style")!, img); // keep styles, replace rest
      }
      imgRef.current!.src = url;
      imgRef.current!.alt = "QR code";
    })();
    return () => {
      alive = false;
    };
  }, [value, size, ecLevel]);

  // Host reserves exact space to avoid layout shifts and isolates from ancestors
  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: size,
        height: size,
        contain: "strict",                 // full layout/paint size containment
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",        // own composite layer
        willChange: "transform",
        pointerEvents: "none",             // optional: make it inert
      }}
    />
  );
});

export default ShadowStableQr;

