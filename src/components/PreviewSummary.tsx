import React from "react";

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
  // add any extra fields you have (services, bio, etc.)
  bio?: string;
};

export default function PreviewSummary({ profile }: { profile: Profile }) {
  const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
    value ? (
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="max-w-[70%] text-sm font-medium text-gray-900">{value}</span>
      </div>
    ) : null;

  return (
    <main className="mx-auto mt-6 max-w-3xl px-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Profile Summary</h1>
        <a href="/edit" className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Edit Profile
        </a>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full border-2 border-white object-cover shadow ring-1 ring-gray-200"
          />
          <div>
            <div className="text-lg font-semibold text-gray-900">{profile.name}</div>
            <div className="text-sm text-gray-500">{profile.title}</div>
          </div>
        </div>

        <div className="mt-6">
          <Row label="Username" value={profile.username} />
          <Row label="Company" value={profile.company} />
          <Row label="Email" value={profile.email} />
          <Row label="Phone" value={profile.phone} />
          <Row label="Website" value={profile.website} />
          <Row label="Address" value={profile.address} />
          <Row
            label="Socials"
            value={
              profile.socials?.length
                ? (
                    <ul className="flex flex-wrap gap-2">
                      {profile.socials.map((s) => (
                        <li key={s.url}>
                          <a className="text-indigo-600 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )
                : undefined
            }
          />
          <Row label="Bio" value={profile.bio} />
        </div>
      </section>
    </main>
  );
}
