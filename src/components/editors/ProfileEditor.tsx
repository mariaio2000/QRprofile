import React, { useMemo, useState } from "react";

/** ==== Types (adjust to your existing app types if needed) ==== */
export type SocialLink = { label: string; url: string };
export type Profile = {
  // core
  username: string; // already chosen at sign-up; shown read-only in header if you want
  name: string;
  title?: string;
  bio?: string;
  email?: string; // kept for preview but NOT editable here in Contact (comes from auth)
  avatarUrl?: string;

  // contact (kept minimal as requested)
  phone?: string;
  location?: string;

  // links/media
  website?: string;
  socials?: SocialLink[];
  services?: string[];
  photos?: string[];

  // theme
  theme?: {
    headerFrom?: string;
    headerTo?: string;
  };
};

type StepKey = "basic" | "contact" | "servicesMedia" | "theme";

/** ==== Small UI helpers (contained for ease of paste) ==== */
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60`}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );
}

function Pill({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
        aria-label="remove"
      >
        ×
      </button>
    </span>
  );
}

/** ==== Step panes ==== */

function StepBasic({
  p,
  setP,
}: {
  p: Profile;
  setP: (updates: Partial<Profile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Profile photo (URL)"
          value={p.avatarUrl}
          onChange={(v) => setP({ avatarUrl: v })}
          placeholder="https://…"
        />
        <Input
          label="Full name"
          value={p.name}
          onChange={(v) => setP({ name: v })}
          placeholder="e.g. Olivia West"
        />
        <Input
          label="Title"
          value={p.title}
          onChange={(v) => setP({ title: v })}
          placeholder="e.g. Product Designer"
        />
        {/* Keep Bio only here (removed duplicate from the old step 3) */}
        <Textarea
          label="Short bio"
          value={p.bio}
          onChange={(v) => setP({ bio: v })}
          placeholder="One–two sentences about you."
          rows={3}
        />
      </div>
    </div>
  );
}

function StepContactLinks({
  p,
  setP,
}: {
  p: Profile;
  setP: (updates: Partial<Profile>) => void;
}) {
  const [label, setLabel] = useState<string>("LinkedIn");
  const [url, setUrl] = useState<string>("");

  const addSocial = () => {
    if (!url.trim()) return;
    const next = [...(p.socials || []), { label: label.trim() || "Link", url }];
    setP({ socials: next });
    setUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Phone"
          value={p.phone}
          onChange={(v) => setP({ phone: v })}
          placeholder="+49 170 123 4567"
        />
        <Input
          label="Location"
          value={p.location}
          onChange={(v) => setP({ location: v })}
          placeholder="Berlin, DE"
        />
        <Input
          label="Website (optional)"
          value={p.website}
          onChange={(v) => setP({ website: v })}
          placeholder="https://yourdomain.com"
        />
        {/* Email is intentionally omitted here (comes from registration) */}
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Socials</div>
        <div className="flex flex-wrap items-center gap-3">
          {(p.socials || []).map((s, i) => (
            <Pill
              key={`${s.label}-${i}`}
              onRemove={() =>
                setP({
                  socials: (p.socials || []).filter((_, idx) => idx !== i),
                })
              }
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-gray-400">•</span>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {s.url}
              </a>
            </Pill>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Label"
            value={label}
            onChange={setLabel}
            placeholder="LinkedIn / Instagram / GitHub"
          />
          <Input
            label="URL"
            value={url}
            onChange={setUrl}
            placeholder="https://…"
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={addSocial}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepServicesMedia({
  p,
  setP,
}: {
  p: Profile;
  setP: (updates: Partial<Profile>) => void;
}) {
  const [service, setService] = useState("");
  const [photo, setPhoto] = useState("");

  const addService = () => {
    if (!service.trim()) return;
    setP({ services: [...(p.services || []), service.trim()] });
    setService("");
  };

  const addPhoto = () => {
    if (!photo.trim()) return;
    setP({ photos: [...(p.photos || []), photo.trim()] });
    setPhoto("");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Services</div>
        <div className="flex flex-wrap items-center gap-3">
          {(p.services || []).map((s, i) => (
            <Pill
              key={`${s}-${i}`}
              onRemove={() =>
                setP({
                  services: (p.services || []).filter((_, idx) => idx !== i),
                })
              }
            >
              {s}
            </Pill>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Add a service"
            value={service}
            onChange={setService}
            placeholder="e.g. Brand Design"
          />
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={addService}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add Service
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Photos</div>
        <p className="mb-3 text-xs text-gray-500">
          Paste image URLs (keep it light—3–6 images is perfect).
        </p>
        <div className="flex flex-wrap gap-3">
          {(p.photos || []).map((src, i) => (
            <div key={src + i} className="relative">
              <img
                src={src}
                alt=""
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setP({
                    photos: (p.photos || []).filter((_, idx) => idx !== i),
                  })
                }
                className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-500 shadow hover:text-gray-800"
                aria-label="remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Image URL"
            value={photo}
            onChange={setPhoto}
            placeholder="https://…"
          />
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={addPhoto}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTheme({
  p,
  setP,
}: {
  p: Profile;
  setP: (updates: Partial<Profile>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Header gradient — From"
          value={p.theme?.headerFrom || "#4F46E5"}
          onChange={(v) =>
            setP({ theme: { ...(p.theme || {}), headerFrom: v } })
          }
          placeholder="#4F46E5"
        />
        <Input
          label="Header gradient — To"
          value={p.theme?.headerTo || "#6366F1"}
          onChange={(v) => setP({ theme: { ...(p.theme || {}), headerTo: v } })}
          placeholder="#6366F1"
        />
      </div>
      <p className="text-xs text-gray-500">
        Keep it simple. You can expand advanced theme controls later.
      </p>
    </div>
  );
}

/** ==== Live Preview Card (lightweight) ==== */
function LivePreviewCard({ p }: { p: Profile }) {
  const from = p.theme?.headerFrom || "#4F46E5";
  const to = p.theme?.headerTo || "#6366F1";

  const profileUrl = useMemo(() => {
    // Update this if your public origin differs:
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://qrprofile.com";
    return p.username ? `${origin}/u/${encodeURIComponent(p.username)}` : "";
  }, [p.username]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
      <div
        className="rounded-3xl px-6 pb-10 pt-8 text-white"
        style={{
          background: `linear-gradient(180deg, ${from}, ${to})`,
        }}
      >
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.avatarUrl || "https://placehold.co/240x240?text=Avatar"}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">{p.name || "—"}</h2>
          <p className="text-sm text-gray-500">{p.title || "Your Title"}</p>
        </div>

        <p className="mt-3 text-center text-sm text-gray-600">
          {p.bio || "Short bio goes here."}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Copy Link
            </a>
          )}
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            onClick={() => alert("Generate & download QR — hook to your QR flow")}
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}

/** ==== Main Editor (4 steps) ==== */
export default function ProfileEditor({
  initial,
  onPublish,
}: {
  initial: Profile;
  onPublish?: (p: Profile) => Promise<void> | void;
}) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [step, setStep] = useState<StepKey>("basic");

  const stepOrder: StepKey[] = ["basic", "contact", "servicesMedia", "theme"];
  const stepIndex = stepOrder.indexOf(step);
  const progress = ((stepIndex + 1) / stepOrder.length) * 100;

  const setP = (updates: Partial<Profile>) =>
    setProfile((prev) => ({ ...prev, ...updates }));

  const next = () =>
    setStep(stepOrder[Math.min(stepIndex + 1, stepOrder.length - 1)]);
  const prev = () => setStep(stepOrder[Math.max(stepIndex - 1, 0)]);

  const publish = async () => {
    try {
      if (onPublish) await onPublish(profile);
      else alert("Published! (TODO: wire to API)");
    } catch (e) {
      alert("Failed to publish");
      console.error(e);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      {/* Header / Progress */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500">
            Step {stepIndex + 1} of {stepOrder.length}
          </div>
          <div className="mt-1 h-2 w-64 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {/* username read-only badge if you want to show it */}
        {profile.username && (
          <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
            @{profile.username}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                stepIndex >= 0 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              1
            </span>
            <span className="text-sm font-medium">Basic Info</span>
            <span className="mx-2 text-gray-300">/</span>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                stepIndex >= 1 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              2
            </span>
            <span className="text-sm font-medium">Contact & Links</span>
            <span className="mx-2 text-gray-300">/</span>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                stepIndex >= 2 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              3
            </span>
            <span className="text-sm font-medium">Services & Media</span>
            <span className="mx-2 text-gray-300">/</span>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                stepIndex >= 3 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              4
            </span>
            <span className="text-sm font-medium">Theme & Preview</span>
          </div>

          {step === "basic" && <StepBasic p={profile} setP={setP} />}
          {step === "contact" && <StepContactLinks p={profile} setP={setP} />}
          {step === "servicesMedia" && (
            <StepServicesMedia p={profile} setP={setP} />
          )}
          {step === "theme" && <StepTheme p={profile} setP={setP} />}

          {/* Footer actions (NO Save Draft anywhere) */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
            >
              Back
            </button>

            {step !== "theme" ? (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={publish}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-gray-700">
            Live preview
            <span className="ml-2 text-xs font-normal text-gray-400">
              Updates in real time
            </span>
          </div>
          <LivePreviewCard p={profile} />
        </div>
      </div>
    </section>
  );
}
