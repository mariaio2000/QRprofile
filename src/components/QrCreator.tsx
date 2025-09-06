import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

// ---------- Types ----------
export type Profile = {
  username: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  avatarUrl?: string;
  socials?: { label: string; url: string }[];
};

type ECC = "L" | "M" | "Q" | "H";

type Props = {
  profile: Profile;
  publicOrigin?: string; // optional override for the base URL
};

// ---------- Helpers ----------
const esc = (s?: string) => (s ? s.replace(/[,;\n]/g, "\\$&") : "");
function buildVCard(p: Profile) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `FN:${esc(p.name)}`,
    p.title ? `TITLE:${esc(p.title)}` : "",
    p.company ? `ORG:${esc(p.company)}` : "",
    p.email ? `EMAIL;type=INTERNET:${esc(p.email)}` : "",
    p.phone ? `TEL;type=CELL,VOICE:${esc(p.phone)}` : "",
    p.website ? `URL:${esc(p.website)}` : "",
    p.address ? `ADR;type=WORK:;;${esc(p.address)};;;;` : "",
    `ITEM1.URL:https://example.com`, // replaced below with real profile URL
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function toBlobDownload(data: string | Blob, filename: string, mime?: string) {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: mime || "text/plain;charset=utf-8" })
      : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function hexToRgb(h: string) {
  const n = h.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function luminance([r, g, b]: number[]) {
  const srgb = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastRatio(hex1: string, hex2: string) {
  const L1 = luminance(hexToRgb(hex1));
  const L2 = luminance(hexToRgb(hex2));
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

export default function QrCreator({ profile, publicOrigin }: Props) {
  const origin =
    publicOrigin || (typeof window !== "undefined" ? window.location.origin : "https://qrprofile.com");

  const [mode, setMode] = useState<"url" | "vcard">("url");
  const [ecc, setEcc] = useState<ECC>("Q");
  const [fg, setFg] = useState("#1E293B"); // slate-800
  const [bg, setBg] = useState("#FFFFFF");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(3);
  const [logo, setLogo] = useState<string | undefined>(profile.avatarUrl);
  const [svgData, setSvgData] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = useMemo(() => {
    const slug = (profile.username || "").trim();
    return slug ? `${origin}/u/${encodeURIComponent(slug)}` : "";
  }, [origin, profile.username]);

  const vcf = useMemo(() => {
    let v = buildVCard(profile);
    if (profileUrl) v = v.replace("https://example.com", profileUrl);
    return v;
  }, [profile, profileUrl]);

  const qrPayload = useMemo(() => {
    if (mode === "url") return profileUrl || "https://qrprofile.com";
    return `BEGIN:VCARD\r\n${vcf.split("\r\n").slice(1).join("\r\n")}`;
  }, [mode, profileUrl, vcf]);

  const contrast = useMemo(() => Number(contrastRatio(fg, bg).toFixed(2)), [fg, bg]);
  const contrastOK = contrast >= 4.5;

  useEffect(() => {
    if (!canvasRef.current || !qrPayload) return;

    // Canvas QR
    QRCode.toCanvas(canvasRef.current, qrPayload, {
      errorCorrectionLevel: ecc,
      width: size,
      margin,
      color: { dark: fg, light: bg },
    }).then(() => {
      if (!logo) return;
      const ctx = canvasRef.current!.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logo;
      img.onload = () => {
        const s = canvasRef.current!.width;
        const box = Math.round(s * 0.2);
        const x = (s - box) / 2;
        const y = (s - box) / 2;
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth = Math.max(2, Math.round(s * 0.008));
        const r = Math.round(box * 0.18);
        roundRect(ctx, x, y, box, box, r);
        ctx.fill();
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(img, x, y, box, box);
        ctx.restore();
      };
    });

    // SVG string
    QRCode.toString(qrPayload, {
      type: "svg",
      errorCorrectionLevel: ecc,
      margin,
      color: { dark: fg, light: bg },
      width: size,
    }).then((svg) => setSvgData(svg));
  }, [qrPayload, ecc, fg, bg, size, margin, logo]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Downloads
  const downloadVCF = () => {
    toBlobDownload(vcf, `${profile.username || "contact"}.vcf`, "text/vcard");
  };

  function buildFileName() {
    const base = profile.username || profile.name || "qr";
    return `${base}-${mode}`;
  }
  function dataURLtoBlob(dataUrl: string) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  return (
    <div className="space-y-6">
      {/* Mode */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">QR content</span>
        <div className="flex overflow-hidden rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-2 text-sm ${mode === "url" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            aria-pressed={mode === "url"}
          >
            Dynamic URL
          </button>
          <button
            type="button"
            onClick={() => setMode("vcard")}
            className={`px-3 py-2 text-sm ${mode === "vcard" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            aria-pressed={mode === "vcard"}
          >
            Direct vCard
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {mode === "url"
            ? "Scans open your profile page (always up to date)."
            : "Scans open a .vcf contact for instant save."}
        </span>
      </div>

      {/* URL preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
        <div className="text-gray-500">Profile URL</div>
        <div className="mt-1 font-mono text-gray-900">{profileUrl || "— set a username —"}</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <div className="text-gray-700 mb-1">Foreground</div>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-full rounded-lg" />
        </label>
        <label className="text-sm">
          <div className="text-gray-700 mb-1">Background</div>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-full rounded-lg" />
        </label>
        <label className="text-sm">
          <div className="text-gray-700 mb-1">ECC</div>
          <select
            value={ecc}
            onChange={(e) => setEcc(e.target.value as ECC)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="L">L (7%)</option>
            <option value="M">M (15%)</option>
            <option value="Q">Q (25%)</option>
            <option value="H">H (30%)</option>
          </select>
        </label>
        <label className="text-sm">
          <div className="text-gray-700 mb-1">Size</div>
          <input
            type="number"
            value={size}
            min={160}
            max={1024}
            step={16}
            onChange={(e) => setSize(parseInt(e.target.value || "320", 10))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <div className="text-gray-700 mb-1">Margin</div>
          <input
            type="number"
            value={margin}
            min={0}
            max={10}
            onChange={(e) => setMargin(parseInt(e.target.value || "3", 10))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm col-span-2 sm:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-gray-700">Center logo (URL)</span>
            <span className="text-xs text-gray-500">Use ECC “H”/“Q” for best results</span>
          </div>
          <input
            type="url"
            placeholder="https://…/logo.png"
            value={logo || ""}
            onChange={(e) => setLogo(e.target.value || undefined)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      {/* Scannability hint */}
      <div className="text-xs">
        <span className={contrastOK ? "text-green-700" : "text-amber-700"}>
          {contrastOK ? "✅ Good contrast" : "⚠️ Low contrast"} ({contrast}:1)
        </span>{" "}
        — keep quiet zone ≥ 3 and avoid large logos covering finder squares.
      </div>

      {/* Preview + Downloads */}
      <div className="flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-4">
        <canvas ref={canvasRef} width={size} height={size} aria-label="QR preview" className="h-48 w-48" />
        <div className="flex flex-col gap-2">
          {mode === "vcard" && (
            <button onClick={downloadVCF} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Download .VCF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
