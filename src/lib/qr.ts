import QRCode from "qrcode";

export type QROptions = {
  size?: number;
  margin?: number;
  ecc?: "L" | "M" | "Q" | "H";
  dark?: string;
  light?: string;
};

const defaults: Required<QROptions> = {
  size: 1024,
  margin: 3,
  ecc: "Q",
  dark: "#1F2937",
  light: "#FFFFFF",
};

export async function toPngDataURL(text: string, opts: QROptions = {}) {
  const o = { ...defaults, ...opts };
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: o.ecc,
    width: o.size,
    margin: o.margin,
    color: { dark: o.dark, light: o.light },
  });
}

export async function toSvgString(text: string, opts: QROptions = {}) {
  const o = { ...defaults, ...opts };
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: o.ecc,
    width: o.size,
    margin: o.margin,
    color: { dark: o.dark, light: o.light },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
