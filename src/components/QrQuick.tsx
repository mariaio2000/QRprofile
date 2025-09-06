import React, { useEffect, useMemo, useState } from "react";
import { toPngDataURL, toSvgString, downloadDataUrl, downloadSvg } from "../lib/qr";

type Props = {
  text: string;
  filename?: string;
  size?: number;
  margin?: number;
  ecc?: "L" | "M" | "Q" | "H";
  fg?: string;
  bg?: string;
  showActions?: boolean;
};

export default function QrQuick({
  text,
  filename = "qr",
  size = 1024,
  margin = 3,
  ecc = "Q",
  fg = "#111827",
  bg = "#FFFFFF",
  showActions = true,
}: Props) {
  const [png, setPng] = useState<string>("");
  const [svg, setSvg] = useState<string>("");

  const opts = useMemo(
    () => ({ size, margin, ecc, dark: fg, light: bg }),
    [size, margin, ecc, fg, bg]
  );

  useEffect(() => {
    let ok = true;
    (async () => {
      const [dataUrl, svgStr] = await Promise.all([
        toPngDataURL(text, opts),
        toSvgString(text, opts),
      ]);
      if (!ok) return;
      setPng(dataUrl);
      setSvg(svgStr);
    })().catch(console.error);
    return () => {
      ok = false;
    };
  }, [text, opts]);

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {png ? (
          <img
            src={png}
            alt="Scannable QR code"
            className="h-[256px] w-[256px] rounded-xl bg-white p-2 shadow"
          />
        ) : (
          <div className="h-[256px] w-[256px] animate-pulse rounded-xl bg-gray-200" />
        )}
      </div>

      {showActions && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Copy Link
          </button>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Tip: keep margin ≥ 3 and high contrast for reliable scanning.
      </p>
    </div>
  );
}
