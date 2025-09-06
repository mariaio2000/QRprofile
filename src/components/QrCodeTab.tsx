import React, { useEffect, useMemo, useState } from "react";
import { toPngDataURL, downloadDataUrl } from "../lib/qr";
import ProfileImageDisplay from "./common/ProfileImageDisplay";

/** Keep in sync with your profile shape */
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

type TemplateKey = "classic" | "boldDark" | "minimalPro";
const TEMPLATE_LABEL: Record<TemplateKey, string> = {
  classic: "Classic Card",
  boldDark: "Bold Dark",
  minimalPro: "Minimal Pro",
};

export default function QrCodeTab({
  profile,
  publicOrigin,
}: {
  profile: Profile;
  publicOrigin?: string;
}) {
  const origin =
    publicOrigin || (typeof window !== "undefined" ? window.location.origin : "https://qrprofile.com");

  // URL encoded in the QR
  const profileUrl = useMemo(() => {
    const slug = (profile.username || "").trim();
    return slug ? `${origin}/u/${encodeURIComponent(slug)}` : origin;
  }, [origin, profile.username]);

  // One QR PNG for all templates
  const [qrUrl, setQrUrl] = useState<string>("");
  useEffect(() => {
    toPngDataURL(profileUrl, {
      size: 560,
      margin: 3,
      ecc: "Q",
      dark: "#1F2937",
      light: "#FFFFFF",
    }).then(setQrUrl);
  }, [profileUrl]);

  // ----- Switcher: 3 templates -----
  const templates: TemplateKey[] = ["classic", "minimalPro", "boldDark"];
  const [activeIdx, setActiveIdx] = useState(0);
  const next = () => setActiveIdx((i) => (i + 1) % templates.length);
  const prev = () => setActiveIdx((i) => (i - 1 + templates.length) % templates.length);
  const active = templates[activeIdx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function layerClass(i: number) {
    if (i === activeIdx) {
      // Active card: center position, full scale and opacity
      return "z-30 translate-x-0 scale-100 opacity-100";
    } else {
      // Inactive cards: position based on their relationship to active card
      const distance = (i - activeIdx + templates.length) % templates.length;
      if (distance === 1) {
        // Next card (to the right)
        return "z-20 translate-x-8 scale-[.95] opacity-90 pointer-events-none";
      } else {
        // Previous card (to the left)
        return "z-20 -translate-x-8 scale-[.95] opacity-90 pointer-events-none";
      }
    }
  }

  // Actions
  const copyLink = () => navigator.clipboard.writeText(profileUrl);

  return (
    <main className="mx-auto mt-6 max-w-3xl px-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">QR Code</h1>
        <div className="flex items-center gap-3">
          <button onClick={copyLink} className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Copy Link
          </button>
        </div>
      </header>

      {/* Overlapped deck */}
      <section aria-label="Card templates" className="relative mx-auto mt-4 max-w-2xl px-12">
        <div className="relative min-h-[520px]">
          {templates.map((t, i) => (
            <div key={t} className={`absolute inset-0 transition-all duration-300 ${layerClass(i)}`}>
              {t === "classic" && <ClassicCard profile={profile} qrUrl={qrUrl} />}
              {t === "boldDark" && <BoldDarkCard profile={profile} qrUrl={qrUrl} />}
              {t === "minimalPro" && <MinimalProCard profile={profile} qrUrl={qrUrl} />}
            </div>
          ))}

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all duration-200 text-gray-700 text-2xl font-bold"
            aria-label="Previous template"
            title="Previous (←)"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute -right-8 top-1/2 -translate-y-1/2 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all duration-200 text-gray-700 text-2xl font-bold"
            aria-label="Next template"
            title="Next (→)"
          >
            ›
          </button>

          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2">
              {templates.map((t, i) => (
                <Dot
                  key={t}
                  active={i === activeIdx}
                  onClick={() => setActiveIdx(i)}
                  label={TEMPLATE_LABEL[t]}
                />
              ))}
            </div>
            <div className="mt-1 text-center text-xs text-gray-600">{TEMPLATE_LABEL[active]}</div>
          </div>
        </div>
      </section>

    </main>
  );
}

function Dot({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        "h-2.5 w-2.5 rounded-full ring-2 ring-white " + (active ? "bg-indigo-600" : "bg-gray-300 hover:bg-gray-400")
      }
      title={label}
    />
  );
}

/* ----------------- Template cards ----------------- */

function ClassicCard({ profile, qrUrl }: { profile: Profile; qrUrl: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-black/5 w-full max-w-sm mx-auto h-[520px] flex flex-col">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-500 to-indigo-400 p-4">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-4 ring-white">
          <ProfileImageDisplay imageId={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="px-4 pb-4 pt-3 flex-1 flex flex-col">
        <h2 className="text-center text-lg font-semibold text-gray-900">{profile.name}</h2>
        {profile.email && <p className="mt-1 text-center text-sm text-gray-500">{profile.email}</p>}
        <div className="mx-auto mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 flex-1 flex items-center justify-center">
          {qrUrl ? (
            <img src={qrUrl} alt="QR" className="mx-auto h-[180px] w-[180px] rounded-xl bg-white p-2 shadow" />
          ) : (
            <div className="h-[180px] w-[180px] animate-pulse rounded-xl bg-gray-200" />
          )}
        </div>
      </div>
    </div>
  );
}

function BoldDarkCard({ profile, qrUrl }: { profile: Profile; qrUrl: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-black/5 w-full max-w-sm mx-auto h-[520px] flex flex-col">
      <div className="rounded-3xl bg-black p-4 flex-1 flex flex-col">
        <div className="mb-3 rounded-2xl bg-black px-3 py-2 text-center text-xs font-semibold tracking-[0.2em] text-white">
          SHARE
        </div>
        <div className="relative mx-auto -mb-4 h-14 w-14">
          <ProfileImageDisplay imageId={profile.avatarUrl} alt="" className="h-14 w-14 rounded-full border-4 border-white object-cover shadow" />
          <span className="absolute -left-2 -top-1 rounded-md bg-yellow-300 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
            PRO
          </span>
        </div>
        <div className="rounded-[24px] bg-black p-4 text-center ring-1 ring-white/10 flex-1 flex flex-col justify-center">
          <div className="mx-auto rounded-[22px] bg-white p-2 shadow-inner">
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="mx-auto h-[180px] w-[180px] rounded-[18px]" />
            ) : (
              <div className="h-[180px] w-[180px] animate-pulse rounded-[18px] bg-gray-200" />
            )}
          </div>
          <div className="mt-3 text-xs font-semibold tracking-widest text-white/90">
            {profile.name?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

/** --- New 3rd template: Minimal Pro --- 
 * Clean white card; brand badge top-left; job info left-aligned;
 * small avatar top-right; QR with tiny overlay logo centered.
 */
function MinimalProCard({ profile, qrUrl }: { profile: Profile; qrUrl: string }) {
  const avatar = profile.avatarUrl;

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-black/5 w-full max-w-sm mx-auto h-[520px] flex flex-col">
      {/* top row */}
      <div className="mb-3 flex items-start justify-between">
        <BrandBadge />
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold tracking-widest text-gray-700">
            WORK
          </span>
          <ProfileImageDisplay imageId={avatar} alt="" className="h-10 w-10 rounded-full border border-gray-200 object-cover shadow" />
        </div>
      </div>

      {/* text block */}
      <div className="grid gap-2">
        <LabelPair label="NAME" value={profile.name} large />
        <div className="grid grid-cols-2 gap-3">
          <LabelPair label="JOB TITLE" value={profile.title} />
          <LabelPair label="COMPANY" value={profile.company} />
        </div>
      </div>

      {/* QR with centered mini logo */}
      <div className="relative mx-auto mt-4 w-fit rounded-2xl border border-gray-200 bg-gray-50 p-3 flex-1 flex items-center justify-center">
        {qrUrl ? (
          <>
            <img src={qrUrl} alt="QR" className="h-[180px] w-[180px] rounded-xl bg-white p-2 shadow" />
            {/* mini overlay logo/avatar */}
            <ProfileImageDisplay
              imageId={avatar}
              alt=""
              className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            />
          </>
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse rounded-xl bg-gray-200" />
        )}
      </div>
    </div>
  );
}

/* --- small helpers --- */

function LabelPair({ label, value, large }: { label: string; value?: React.ReactNode; large?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-widest text-gray-500">{label}</div>
      <div className={large ? "text-2xl font-semibold text-gray-900" : "text-base font-medium text-gray-900"}>
        {value}
      </div>
    </div>
  );
}

function BrandBadge() {
  return (
    <div className="inline-grid grid-cols-2 gap-1">
      <span className="h-3 w-3 rounded-full" style={{ background: "#ff6b6b" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#ffd93d" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#6bcB77" }} />
      <span className="h-3 w-3 rounded-full" style={{ background: "#4D96FF" }} />
    </div>
  );
}
