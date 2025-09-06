import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

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

export default function ShareTemplatePicker({
  profile,
  publicOrigin,
}: {
  profile: Profile;
  publicOrigin?: string;
}) {
  const origin =
    publicOrigin || (typeof window !== "undefined" ? window.location.origin : "https://qrprofile.com");

  const profileUrl = useMemo(() => {
    const slug = (profile.username || "").trim();
    return slug ? `${origin}/u/${encodeURIComponent(slug)}` : "";
  }, [origin, profile.username]);

  const [template, setTemplate] = useState<TemplateKey>("classic");
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

  function copyLink() {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
  }

  return (
    <section className="mx-auto mt-10 max-w-xl space-y-6">
      {/* selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800">QR Display Template</h3>
        <p className="mt-1 text-xs text-gray-500">Pick how your QR is framed when you share.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Thumb selected={template === "classic"} onClick={() => setTemplate("classic")} title="Classic Card">
            <div className="rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-400 p-3">
              <div className="mx-auto h-5 w-5 rounded-full border-2 border-white bg-white/80" />
              <div className="mt-3 h-10 rounded-xl bg-white/95" />
              <div className="mt-2 h-2 w-10 rounded bg-white/60" />
            </div>
          </Thumb>
          <Thumb selected={template === "boldDark"} onClick={() => setTemplate("boldDark")} title="Bold Dark">
            <div className="rounded-2xl bg-black p-2">
              <div className="mx-auto h-5 w-5 rounded-full border-2 border-yellow-300 bg-gray-800" />
              <div className="mt-2 h-10 rounded-xl bg-gray-800" />
            </div>
          </Thumb>
        </div>
      </div>

      {template === "classic" ? (
        <Classic profile={profile} qrUrl={qrUrl} onCopy={copyLink} />
      ) : (
        <BoldDark profile={profile} qrUrl={qrUrl} onCopy={copyLink} />
      )}
    </section>
  );
}

function Thumb({
  children,
  selected,
  onClick,
  title,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "group flex flex-col rounded-2xl border bg-white p-2 shadow-sm transition " +
        (selected ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200 hover:shadow-md")
      }
      title={title}
    >
      <div className="overflow-hidden rounded-xl">{children}</div>
      <span className="mt-2 text-xs font-medium text-gray-700">{title}</span>
    </button>
  );
}

/* ---------- Templates ---------- */

function Classic({
  profile,
  qrUrl,
  onCopy,
}: {
  profile: Profile;
  qrUrl: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-500 to-indigo-400 p-6">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
          <img src={profile.avatarUrl} className="h-full w-full object-cover" alt="" />
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
          <button onClick={onCopy} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}

function BoldDark({
  profile,
  qrUrl,
  onCopy,
}: {
  profile: Profile;
  qrUrl: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
      <div className="rounded-3xl bg-black p-5">
        <div className="mb-4 rounded-2xl bg-black px-3 py-2 text-center text-xs font-semibold tracking-[0.2em] text-white">
          SHARE
        </div>

        <div className="relative mx-auto -mb-6 h-16 w-16">
          <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full border-4 border-white object-cover shadow" />
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

        <button onClick={onCopy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 text-sm font-semibold text-black hover:brightness-95">
          SHARE LINK <span aria-hidden>↗</span>
        </button>
      </div>

    </div>
  );
}
