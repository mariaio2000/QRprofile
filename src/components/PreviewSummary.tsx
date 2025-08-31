import React from "react";
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
  avatarUrl?: string; // This can be either a URL or an image ID
  socials?: { label: string; url: string }[];
  bio?: string;
  services?: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    featured: boolean;
  }>;
  photoWidgets?: Array<{
    id: string;
    title: string;
    photos: string[];
    layout: 'grid' | 'carousel';
  }>;
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
          <ProfileImageDisplay
            imageId={profile.avatarUrl}
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

        {/* Services Section */}
        {profile.services && profile.services.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div className="space-y-4">
              {profile.services.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">{service.price}</span>
                      {service.featured && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Widgets Section */}
        {profile.photoWidgets && profile.photoWidgets.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Galleries</h3>
            <div className="space-y-6">
              {profile.photoWidgets.map((widget) => (
                <div key={widget.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{widget.title}</h4>
                  <div className={`grid gap-2 ${widget.layout === 'grid' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    {widget.photos.map((photoId, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <ProfileImageDisplay
                          imageId={photoId}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Layout: {widget.layout}</p>
                </div>
              ))}
            </div>
          </div>
        )}


      </section>
    </main>
  );
}
