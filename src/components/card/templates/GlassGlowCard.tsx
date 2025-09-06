import React from 'react';
import { PublicContact, TemplateSettings } from '../../../types/profile';
import { avatarShapeClass, densityPad, gradientByPalette, genericAvatar } from './common';

export default function GlassGlowCard({
  contact, settings,
}: { contact: PublicContact; settings: TemplateSettings }) {
  const grad = gradientByPalette(settings.palette);
  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-3xl">
      {/* Animated gradient backdrop */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${grad} bg-animated`} />
      {/* Glow veil */}
      <div className="absolute inset-0 -z-0 bg-white/10" />

      {/* Glass panel */}
      <div className={`m-[1px] rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl ${densityPad(settings)}`}>
        <div className="flex items-center gap-4">
          <div className={`relative ${settings.density==='compact'?'h-14 w-14':'h-16 w-16'}`}>
            <img
              className={`h-full w-full object-cover ${avatarShapeClass(settings.avatarShape)} ring-4 ring-white/50`}
              src={contact.avatarUrl || genericAvatar}
              onError={(e)=>{(e.currentTarget as HTMLImageElement).src=genericAvatar}}
              alt={contact.name || 'avatar'}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full glow-ring" />
          </div>
          <div className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            <div className="text-xl font-semibold">{contact.name}</div>
            <div className="opacity-90">{contact.title}{contact.company ? ` @ ${contact.company}` : ''}</div>
          </div>
        </div>

        {contact.bio && (
          <p className="mt-4 text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            {contact.bio}
          </p>
        )}

        {/* Actions (kept minimal, readable on glass) */}
        <div className="mt-5 flex flex-wrap gap-3">
          {settings.showPhone && contact.phone && (
            <a href={`tel:${contact.phone}`} className="rounded-full bg-white/30 px-3 py-1 text-white backdrop-blur-md hover:bg-white/40">
              Call
            </a>
          )}
          {settings.showEmail && contact.email && (
            <a href={`mailto:${contact.email}`} className="rounded-full bg-white/30 px-3 py-1 text-white backdrop-blur-md hover:bg-white/40">
              Email
            </a>
          )}
          {settings.showSocials && !!contact.socials?.length && (
            <a target="_blank" rel="noreferrer" href={contact.socials[0].url}
               className="rounded-full bg-white/30 px-3 py-1 text-white backdrop-blur-md hover:bg-white/40">
              Social
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
