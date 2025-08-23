"use client";

import React, { memo, useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  size?: number;            // px
  ecLevel?: "L" | "M" | "Q" | "H";
  className?: string;
};

const StableQr = memo(function StableQr({
  value,
  size = 192,
  ecLevel = "M",
  className,
}: Props) {
  const [src, setSrc] = useState<string>("");

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
      if (alive) setSrc(url);
    })();
    return () => {
      alive = false;
    };
  }, [value, size, ecLevel]);

  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-xl bg-neutral-100 ${className ?? ""}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt="QR code"
      width={size}
      height={size}
      draggable={false}
      className={[
        "block select-none rounded-xl",
        "[backface-visibility:hidden]",
        "[transform:translateZ(0)]",
        "[image-rendering:pixelated]",
        className ?? "",
      ].join(" ")}
    />
  );
});

export default StableQr;
