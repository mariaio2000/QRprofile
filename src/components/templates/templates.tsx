import React from "react";
import clsx from "clsx";

export type CardTemplateId = "minimal" | "split" | "photo" | "sidebar" | "glass" | "hero";
export type Palette = { from: string; to: string };
export type Font = "Brand" | "Serif" | "Rounded";
export type AvatarShape = "circle" | "squircle" | "rounded";
export type Background = "gradient" | "solid" | "noise";
export type Density = "compact" | "cozy" | "comfy";
export type VisibleFields = { phone: boolean; email: boolean; socials: boolean };

export type TemplateOptions = {
  palette: Palette;
  font: Font;
  avatar: AvatarShape;
  background: Background;
  density: Density;
  visible: VisibleFields;
};

export type ProfileLike = {
  fullName?: string;
  title?: string;
  phone?: string;
  email?: string;
  socials?: { label: string; url: string }[];
  avatarUrl?: string;
};

export type CardPreviewProps = { profile: ProfileLike; options: TemplateOptions };

const fontClass = (font: Font) =>
  font === "Serif" ? "font-serif" : font === "Rounded" ? "font-[ui-rounded,system-ui,Segoe UI Rounded]" : "font-sans";

const densityPad = (d: Density) => (d === "compact" ? "p-3" : d === "cozy" ? "p-4" : "p-6");
const avatarRadius = (shape: AvatarShape) =>
  shape === "circle" ? "rounded-full" : shape === "squircle" ? "rounded-[22%]" : "rounded-xl";

const Avatar: React.FC<{ url?: string; shape: AvatarShape; size?: number }> = ({ url, shape, size = 72 }) => {
  const src =
    url ||
    "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 80 80' fill='none'><rect width='80' height='80' rx='40' fill='%23EEF2FF'/><path d='M40 18a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z' fill='%23596AEC'/><path d='M17 61c3-11 12-18 23-18s20 7 23 18' stroke='%23596AEC' stroke-width='6' stroke-linecap='round'/></svg>`
      );
  return <img src={src} alt="" style={{ width: size, height: size }} className={clsx(avatarRadius(shape), "object-cover shadow-sm")} />;
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) =>
  !value ? null : (
    <div className="text-sm text-slate-700">
      <span className="mr-1 font-medium text-slate-900">{label}:</span>
      {value}
    </div>
  );

const CTA: React.FC<{ visible: VisibleFields }> = ({ visible }) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {visible.phone && <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-700">Call</span>}
    {visible.email && <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-700">Email</span>}
    {visible.socials && <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-700">Socials</span>}
  </div>
);

// Helper: background block honoring background+palette using inline styles (reliable)
const FancyBg: React.FC<{ background: Background; palette: Palette; className?: string; dir?: "x" | "y" }> = ({
  background,
  palette,
  className,
  dir = "x",
}) => {
  const gradient = `linear-gradient(${dir === "x" ? "90deg" : "180deg"}, ${palette.from} 0%, ${palette.to} 100%)`;
  if (background === "solid") return <div className={className} style={{ background: "#fff" }} />;
  if (background === "noise")
    return (
      <div className={clsx("relative", className)} style={{ background: gradient }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url('/noise.svg')", backgroundSize: "250px" }} />
      </div>
    );
  return <div className={className} style={{ background: gradient }} />;
};

// ---------------- Templates ----------------
export const MinimalTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("w-full rounded-2xl border bg-white shadow-sm", fontClass(options.font), densityPad(options.density))}>
    <div className="flex items-center gap-4">
      <Avatar url={profile.avatarUrl} shape={options.avatar} />
      <div>
        <div className="text-lg font-semibold">{profile.fullName || "Your name"}</div>
        <div className="text-sm text-slate-600">{profile.title || "Your title"}</div>
      </div>
    </div>
    <div className="mt-3 space-y-1">
      <InfoRow label="Phone" value={profile.phone} />
      <InfoRow label="Email" value={profile.email} />
    </div>
    <CTA visible={options.visible} />
  </div>
);

export const SplitTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("w-full overflow-hidden rounded-2xl border shadow-sm", fontClass(options.font))}>
    <FancyBg background="gradient" palette={options.palette} className="p-5 text-white">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatarUrl} shape={options.avatar} />
        <div>
          <div className="text-lg font-semibold">{profile.fullName || "Your name"}</div>
          <div className="text-sm opacity-90">{profile.title || "Your title"}</div>
        </div>
      </div>
    </FancyBg>
    <div className={clsx("bg-white", densityPad(options.density))}>
      <div className="space-y-1">
        <InfoRow label="Phone" value={profile.phone} />
        <InfoRow label="Email" value={profile.email} />
      </div>
      <CTA visible={options.visible} />
    </div>
  </div>
);

export const PhotoHeaderTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("w-full overflow-hidden rounded-2xl border shadow-sm", fontClass(options.font))}>
    <FancyBg background="gradient" palette={options.palette} className="flex items-center gap-4 p-5 text-white">
      <Avatar url={profile.avatarUrl} shape={options.avatar} />
      <div>
        <div className="text-lg font-semibold">{profile.fullName || "Your name"}</div>
        <div className="text-sm opacity-90">{profile.title || "Your title"}</div>
      </div>
    </FancyBg>
    <div className={clsx("bg-white", densityPad(options.density))}>
      <CTA visible={options.visible} />
    </div>
  </div>
);

export const SidebarTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("grid w-full grid-cols-[140px_1fr] overflow-hidden rounded-2xl border shadow-sm", fontClass(options.font))}>
    <FancyBg background="gradient" palette={options.palette} dir="y" className="flex flex-col items-center justify-center gap-3 text-white">
      <Avatar url={profile.avatarUrl} shape={options.avatar} />
      <div className="text-xs opacity-90">{profile.title || "Your title"}</div>
    </FancyBg>
    <div className={clsx("bg-white", densityPad(options.density))}>
      <div className="text-lg font-semibold">{profile.fullName || "Your name"}</div>
      <div className="mt-2 space-y-1">
        <InfoRow label="Phone" value={profile.phone} />
        <InfoRow label="Email" value={profile.email} />
      </div>
      <CTA visible={options.visible} />
    </div>
  </div>
);

export const GlassGlowTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("relative w-full rounded-2xl p-0", fontClass(options.font))}>
    <div className="absolute inset-0 -z-10 blur-2xl opacity-60" style={{ background: `linear-gradient(90deg, ${options.palette.from}, ${options.palette.to})` }} />
    <div className="m-[2px] rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,.25)] backdrop-blur">
      <div className="flex items-center gap-4">
        <Avatar url={profile.avatarUrl} shape={options.avatar} />
        <div>
          <div className="text-lg font-semibold text-slate-900">{profile.fullName || "Your name"}</div>
          <div className="text-sm text-slate-600">{profile.title || "Your title"}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <InfoRow label="Phone" value={profile.phone} />
        <InfoRow label="Email" value={profile.email} />
      </div>
      <CTA visible={options.visible} />
    </div>
  </div>
);

export const HeroStripeTemplate: React.FC<CardPreviewProps> = ({ profile, options }) => (
  <div className={clsx("w-full overflow-hidden rounded-2xl border shadow-sm", fontClass(options.font))}>
    <div className="h-20 w-full" style={{ background: `linear-gradient(90deg, ${options.palette.from}, ${options.palette.to})` }} />
    <div className={clsx("-mt-10 flex items-center gap-4 px-5", densityPad("compact"))}>
      <Avatar url={profile.avatarUrl} shape={options.avatar} size={84} />
      <div>
        <div className="text-lg font-semibold">{profile.fullName || "Your name"}</div>
        <div className="text-sm text-slate-600">{profile.title || "Your title"}</div>
      </div>
    </div>
    <div className={clsx("bg-white", densityPad(options.density))}>
      <CTA visible={options.visible} />
    </div>
  </div>
);

export const templates = [
  { id: "minimal", name: "Minimal", preview: MinimalTemplate },
  { id: "photo", name: "Photo Header", preview: PhotoHeaderTemplate },
  { id: "sidebar", name: "Sidebar", preview: SidebarTemplate },
  { id: "split", name: "Split", preview: SplitTemplate },
  { id: "glass", name: "Glass Glow", preview: GlassGlowTemplate },
  { id: "hero", name: "Hero Stripe", preview: HeroStripeTemplate },
] as const;
