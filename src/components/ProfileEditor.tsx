import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import { useAutoSave } from "@/hooks/useAutoSave";

export type Social = { label: string; url: string };
export type Profile = {
  fullName: string;
  title: string;
  bio: string;
  avatarUrl?: string;

  phone?: string;
  location?: string;
  website?: string;
  socials: Social[];

  services: string[];
  photos: string[];

  themeFrom: string;
  themeTo: string;
};

type Props = {
  initialProfile?: Partial<Profile>;
  onAutoSave: (p: Profile) => Promise<void> | void; // called automatically (debounced)
  onBack?: () => void;
  onFinish: () => void; // just navigate to QR
};

const DEFAULT_AVATAR =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(`
  <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#6366F1" offset="0"/><stop stop-color="#4F46E5" offset="1"/>
    </linearGradient></defs>
    <rect width="128" height="128" rx="64" fill="url(#g)"/>
    <circle cx="64" cy="50" r="22" fill="#FFF" opacity="0.9"/>
    <rect x="24" y="78" width="80" height="30" rx="15" fill="#FFF" opacity="0.9"/>
  </svg>
`);

const EMPTY: Profile = {
  fullName: "",
  title: "",
  bio: "",
  avatarUrl: "",
  phone: "",
  location: "",
  website: "",
  socials: [],
  services: [],
  photos: [],
  themeFrom: "#4F46E5",
  themeTo: "#6366F1",
};

const STEPS = [
  { key: "basic", label: "Basic Info" },
  { key: "contact", label: "Contact & Links" },
  { key: "media", label: "Services & Media" },
  { key: "theme", label: "Theme & Preview" },
] as const;

export default function ProfileEditor({ initialProfile, onAutoSave, onBack, onFinish }: Props) {
  const [profile, setProfile] = useState<Profile>(() => ({
    ...EMPTY,
    ...initialProfile,
    socials: initialProfile?.socials ?? [],
    services: initialProfile?.services ?? [],
    photos: initialProfile?.photos ?? [],
  }));
  const [stepIndex, setStepIndex] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");

  useAutoSave(profile, async (p) => {
    try {
      setSaving("saving");
      await onAutoSave(p);   // delegate to App for DB update
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 900);
    } catch {
      setSaving("idle");
    }
  }, 600);

  // Optional localStorage autosave
  const LS_KEY = "qrp.editor";
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setProfile((p) => ({ ...p, ...saved }));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  }, [profile]);

  const canContinue = useMemo(() => {
    if (stepIndex === 0) return profile.fullName.trim().length > 1; // only name required
    return true;
  }, [profile.fullName, stepIndex]);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }
  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else if (onBack) onBack();
    else if (window.history.length > 1) window.history.back();
  }


  // Keyboard shortcuts: Alt+→ (next/publish), Alt+← (back)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "ArrowRight") {
        if (stepIndex === STEPS.length - 1) onFinish();
        else if (canContinue) next();
      } else if (e.key === "ArrowLeft") {
        back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, canContinue, profile]);

  const displayAvatar =
    avatarError || !profile.avatarUrl?.trim() ? DEFAULT_AVATAR : profile.avatarUrl!.trim();

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-500">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStepIndex(i)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
              i === stepIndex
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <span
              className={clsx(
                "grid h-5 w-5 place-items-center rounded-full text-xs",
                i === stepIndex ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              )}
            >
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {stepIndex === 0 && <StepBasic profile={profile} onChange={setProfile} />}
          {stepIndex === 1 && <StepContact profile={profile} onChange={setProfile} />}
          {stepIndex === 2 && <StepMedia profile={profile} onChange={setProfile} />}
          {stepIndex === 3 && <StepTheme profile={profile} onChange={setProfile} />}
        </div>

        {/* RIGHT: Preview */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 text-lg font-semibold text-gray-800">
            Live preview <span className="text-sm font-normal text-gray-500">Updates in real time</span>
          </div>
          <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
            <div
              className="flex h-40 items-center justify-center rounded-md"
              style={{
                background: `linear-gradient(90deg, ${profile.themeFrom}, ${profile.themeTo})`,
              }}
            >
              <img
                src={displayAvatar}
                onError={() => setAvatarError(true)}
                alt="Profile photo"
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
              />
            </div>
            <div className="px-4 py-5 text-center">
              <div className="text-xl font-semibold text-gray-900">{profile.fullName || "Your Name"}</div>
              <div className="text-sm text-gray-500">{profile.title || "Your Title"}</div>
              <p className="mt-3 text-sm text-gray-600">{profile.bio || "Short bio goes here."}</p>


            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer (invisible bar) */}
      <div className="pointer-events-none sticky bottom-0 z-20 mt-4 w-full">
        <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-t-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          <div className="text-xs text-gray-500">
            {saving === "saving" && "Saving…"}
            {saving === "saved" && "All changes saved"}
            {saving === "idle" && ""}
          </div>

          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onFinish}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Finish & View QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



/* ------------------ STEP 1: BASIC INFO ------------------ */
// Photo is optional and LAST.
function StepBasic({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: React.Dispatch<React.SetStateAction<Profile>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Full name (required) */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
        <input
          value={profile.fullName}
          onChange={(e) => onChange((p) => ({ ...p, fullName: e.target.value }))}
          placeholder="maria"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          value={profile.title}
          onChange={(e) => onChange((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. Product Designer"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Bio */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Short bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => onChange((p) => ({ ...p, bio: e.target.value }))}
          placeholder="One–two sentences about you."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Avatar URL (optional) */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Profile photo (URL) <span className="text-gray-400">(optional)</span>
        </label>
        <input
          value={profile.avatarUrl || ""}
          onChange={(e) => onChange((p) => ({ ...p, avatarUrl: e.target.value }))}
          placeholder="https://images.pexels.com/photo.jpg"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );
}

/* --------------- STEP 2: CONTACT & LINKS --------------- */
function StepContact({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: React.Dispatch<React.SetStateAction<Profile>>;
}) {
  const [label, setLabel] = useState("LinkedIn");
  const [url, setUrl] = useState("");

  function add() {
    if (!url.trim()) return;
    onChange((p) => ({ ...p, socials: [...p.socials, { label: label.trim() || "Link", url: url.trim() }] }));
    setUrl("");
  }
  function remove(i: number) {
    onChange((p) => ({ ...p, socials: p.socials.filter((_, idx) => idx !== i) }));
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
          <input
            value={profile.phone || ""}
            onChange={(e) => onChange((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+49 170 123 4567"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            value={profile.location || ""}
            onChange={(e) => onChange((p) => ({ ...p, location: e.target.value }))}
            placeholder="Berlin, DE"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Website <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={profile.website || ""}
            onChange={(e) => onChange((p) => ({ ...p, website: e.target.value }))}
            placeholder="https://yourdomain.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="mb-2 text-sm font-medium text-gray-700">Socials</div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Label"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="https://..."
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Link
        </button>
      </div>

      {profile.socials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.socials.map((s, i) => (
            <span
              key={`${s.label}-${i}`}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
            >
              <span className="font-medium">{s.label}:</span>
              <a href={s.url} target="_blank" rel="noreferrer" className="truncate text-indigo-600 hover:underline">
                {s.url}
              </a>
              <button onClick={() => remove(i)} className="text-gray-400 hover:text-gray-600">×</button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------- STEP 3: SERVICES & MEDIA --------------- */
function StepMedia({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: React.Dispatch<React.SetStateAction<Profile>>;
}) {
  const [service, setService] = useState("");
  const [photo, setPhoto] = useState("");

  function addService() {
    if (!service.trim()) return;
    onChange((p) => ({ ...p, services: [...p.services, service.trim()] }));
    setService("");
  }
  function removeService(i: number) {
    onChange((p) => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));
  }
  function addPhoto() {
    if (!photo.trim()) return;
    onChange((p) => ({ ...p, photos: [...p.photos, photo.trim()] }));
    setPhoto("");
  }
  function removePhoto(i: number) {
    onChange((p) => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }));
  }

  return (
    <>
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">Services</label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Brand Design"
            className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={addService}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Service
          </button>
        </div>
        {profile.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.services.map((s, i) => (
              <span key={`${s}-${i}`} className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">
                {s}{" "}
                <button className="ml-2 text-indigo-400 hover:text-indigo-600" onClick={() => removeService(i)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-2 text-sm font-medium text-gray-700">Photos (3–6 URLs is perfect)</div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          placeholder="https://…"
          className="min-w-[260px] flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={addPhoto}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Photo
        </button>
      </div>

      {profile.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {profile.photos.map((src, i) => (
            <div key={`${src}-${i}`} className="relative">
              <img src={src} alt="" className="h-20 w-full rounded-md object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* --------------- STEP 4: THEME & PREVIEW --------------- */
function StepTheme({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: React.Dispatch<React.SetStateAction<Profile>>;
}) {
  const PRESETS = [
    { name: "Indigo Sky", from: "#4F46E5", to: "#6366F1" },
    { name: "Sunset",     from: "#F97316", to: "#EF4444" },
    { name: "Mint",       from: "#10B981", to: "#06B6D4" },
    { name: "Royal",      from: "#7C3AED", to: "#2563EB" },
    { name: "Candy",      from: "#EC4899", to: "#F59E0B" },
    { name: "Night",      from: "#111827", to: "#374151" },
  ];

  function applyPreset(p: { from: string; to: string }) {
    onChange((prev) => ({ ...prev, themeFrom: p.from, themeTo: p.to }));
  }
  function randomize() {
    const r = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    applyPreset(r);
  }
  function revertBrand() {
    onChange((prev) => ({ ...prev, themeFrom: "#4F46E5", themeTo: "#6366F1" }));
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Choose a preset</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRESETS.map((g) => {
            const active =
              g.from.toLowerCase() === profile.themeFrom.toLowerCase() &&
              g.to.toLowerCase() === profile.themeTo.toLowerCase();
            return (
              <button
                key={g.name}
                type="button"
                aria-pressed={active}
                onClick={() => applyPreset(g)}
                className={clsx(
                  "group relative h-14 rounded-xl border p-0.5 text-left transition",
                  active ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div
                  className="h-full w-full rounded-lg"
                  style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
                />
                <span className="pointer-events-none absolute inset-x-2 bottom-1 select-none rounded bg-black/40 px-1.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {g.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom pickers */}
      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">Fine-tune colors</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <input
              type="color"
              aria-label="From color"
              value={profile.themeFrom}
              onChange={(e) => onChange((p) => ({ ...p, themeFrom: e.target.value }))}
              className="h-10 w-10 cursor-pointer rounded-md border border-gray-300"
            />
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-600">From</div>
              <div className="text-sm text-gray-800">{profile.themeFrom}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <input
              type="color"
              aria-label="To color"
              value={profile.themeTo}
              onChange={(e) => onChange((p) => ({ ...p, themeTo: e.target.value }))}
              className="h-10 w-10 cursor-pointer rounded-md border border-gray-300"
            />
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-600">To</div>
              <div className="text-sm text-gray-800">{profile.themeTo}</div>
            </div>
          </div>
        </div>
      </div>



      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={randomize}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Randomize
        </button>
        <button
          type="button"
          onClick={revertBrand}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Revert to Brand
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Tip: you can still tweak colors later. The preview on the right updates in real time.
      </p>
    </div>
  );
}
