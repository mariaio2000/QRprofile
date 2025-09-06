import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import ProfileImageDisplay from "./common/ProfileImageDisplay";

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

type TemplateKey = "classic" | "boldDark";

export default function DualCardSwitcher({
  profile,
  publicOrigin,
}: {
  profile: Profile;
  publicOrigin?: string;
}) {
  const origin =
    publicOrigin || (typeof window !== "undefined" ? window.location.origin : "https://qrprofile.com");

  // public profile URL for the QR payload
  const profileUrl = useMemo(() => {
    const slug = (profile.username || "").trim();
    return slug ? `${origin}/u/${encodeURIComponent(slug)}` : "";
  }, [origin, profile.username]);

  // Generate a single PNG QR (good for both cards)
  const [qrUrl, setQrUrl] = useState<string>("");
  useEffect(() => {
    const text = profileUrl || "https://qrprofile.com";
    QRCode.toDataURL(text, {
      errorCorrectionLevel: "Q",
      width: 560,
      margin: 3,
      color: { dark: "#1F2937", light: "#FFFFFF" },
    }).then(setQrUrl);
  }, [profileUrl]);

  // Which card is on top (blue is default)
  const [active, setActive] = useState<TemplateKey>("classic");
  const next = () => setActive((a) => (a === "classic" ? "boldDark" : "classic"));
  const prev = next; // only two templates → same toggle

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section aria-label="Card templates" className="mx-auto mt-8 max-w-xl">
      {/* Fixed-height stack so cards overlap */}
      <div className="relative min-h-[660px]">
        {/* Classic (blue) */}
        <div
          className={
            "absolute inset-0 transition-all duration-300 " +
            (active === "classic"
              ? "z-20 translate-x-0 scale-100 opacity-100"
              : "z-10 translate-x-6 scale-[.965] opacity-95 pointer-events-none")
          }
        >
          <ClassicCard profile={profile} qrUrl={qrUrl} />
        </div>

        {/* Bold Dark (black) */}
        <div
          className={
            "absolute inset-0 transition-all duration-300 " +
            (active === "boldDark"
              ? "z-20 translate-x-0 scale-100 opacity-100"
              : "z-10 -translate-x-6 scale-[.965] opacity-95 pointer-events-none")
          }
        >
          <BoldDarkCard profile={profile} qrUrl={qrUrl} />
        </div>

        {/* Controls: big chevrons + dots */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-300 hover:bg-gray-50"
          aria-label="Previous template"
          title="Previous (←)"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-300 hover:bg-gray-50"
          aria-label="Next template"
          title="Next (→)"
        >
          ›
        </button>

        <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <Dot active={active === "classic"} onClick={() => setActive("classic")} label="Classic Card" />
          <Dot active={active === "boldDark"} onClick={() => setActive("boldDark")} label="Bold Dark" />
        </div>
      </div>
    </section>
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

/* ----------------- Card templates ----------------- */

function ClassicCard({ profile, qrUrl }: { profile: Profile; qrUrl: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-500 to-indigo-400 p-6">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
          <ProfileImageDisplay
            imageId={profile.avatarUrl?.startsWith('image://') ? profile.avatarUrl.substring(8) : undefined}
            fallbackUrl={`https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(profile.name || "User")}`}
            alt="Profile photo"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="px-4 pb-6 pt-4">
        <h2 className="text-center text-xl font-semibold text-gray-900">{profile.name}</h2>
        {profile.email && <p className="mt-1 text-center text-sm text-gray-500">{profile.email}</p>}
        <div className="mx-auto mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          {qrUrl ? (
            <img src={qrUrl} alt="QR" className="mx-auto h-[220px] w-[220px] rounded-xl bg-white p-2 shadow" />
          ) : (
            <div className="h-[220px] w-[220px] animate-pulse rounded-xl bg-gray-200" />
          )}
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}

function BoldDarkCard({ profile, qrUrl }: { profile: Profile; qrUrl: string }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
      <div className="rounded-3xl bg-black p-5">
        <div className="mb-4 rounded-2xl bg-black px-3 py-2 text-center text-xs font-semibold tracking-[0.2em] text-white">
          SHARE
        </div>
        <div className="relative mx-auto -mb-6 h-16 w-16">
          <ProfileImageDisplay
            imageId={profile.avatarUrl?.startsWith('image://') ? profile.avatarUrl.substring(8) : undefined}
            fallbackUrl={`https://api.dicebear.com/7.x/initials/jpg?seed=${encodeURIComponent(profile.name || "User")}`}
            alt="Profile photo"
            className="h-16 w-16 rounded-full border-4 border-white object-cover shadow"
          />
          <span className="absolute -left-2 -top-1 rounded-md bg-yellow-300 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
            PRO
          </span>
        </div>
        <div className="rounded-[24px] bg-black p-5 text-center ring-1 ring-white/10">
          <div className="mx-auto rounded-[22px] bg-white p-2 shadow-inner">
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="mx-auto h-[230px] w-[230px] rounded-[18px]" />
            ) : (
              <div className="h-[230px] w-[230px] animate-pulse rounded-[18px] bg-gray-200" />
            )}
          </div>
          <div className="mt-4 text-xs font-semibold tracking-widest text-white/90">
            {profile.name?.toUpperCase()}
          </div>
        </div>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 text-sm font-semibold text-black hover:brightness-95">
          SHARE LINK <span aria-hidden>↗</span>
        </button>
      </div>
    </div>
  );
}
