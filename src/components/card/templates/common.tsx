import React from 'react';
import clsx from 'clsx';
import { TemplateSettings, PublicContact } from '../../../types/profile';

export const genericAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop stop-color="#6366F1"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="64" cy="48" r="18" fill="white" opacity=".9"/>
  <rect x="32" y="78" width="64" height="28" rx="14" fill="white" opacity=".9"/>
</svg>`);

export function avatarShapeClass(shape?: TemplateSettings['avatarShape']) {
  switch (shape) {
    case 'square': return 'rounded-none';
    case 'rounded': return 'rounded-xl';
    default: return 'rounded-full';
  }
}

export function densityPad(density?: TemplateSettings['density']) {
  return density === 'compact' ? 'p-4' : 'p-6';
}

export function gradientByPalette(p?: TemplateSettings['palette']) {
  switch (p) {
    case 'blue':  return 'from-sky-500 to-indigo-500';
    case 'violet':return 'from-violet-500 to-fuchsia-500';
    case 'teal':  return 'from-teal-500 to-emerald-500';
    case 'slate': return 'from-slate-600 to-slate-800';
    default:      return 'from-indigo-500 to-blue-500'; // brand
  }
}

export function surfaceByPalette(p?: TemplateSettings['palette']) {
  switch (p) {
    case 'slate': return 'bg-white';
    default:      return 'bg-white';
  }
}

export function chipClass(p?: TemplateSettings['palette']) {
  switch (p) {
    case 'teal':  return 'bg-emerald-50 text-emerald-700';
    case 'violet':return 'bg-fuchsia-50 text-fuchsia-700';
    case 'blue':  return 'bg-sky-50 text-sky-700';
    case 'slate': return 'bg-slate-100 text-slate-700';
    default:      return 'bg-indigo-50 text-indigo-700';
  }
}

export function PaletteBG({ settings }: { settings: TemplateSettings }) {
  if (settings.backgroundStyle === 'solid') {
    return 'bg-indigo-600';
  }
  if (settings.backgroundStyle === 'pattern') {
    return 'bg-gradient-to-br from-indigo-500 to-blue-500 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[length:12px_12px]';
  }
  // gradient default
  return `bg-gradient-to-br ${gradientByPalette(settings.palette)}`;
}

// New: gradient header block with animation
export function AnimatedHeader({ settings, className = 'h-28 rounded-t-2xl' }:{
  settings: TemplateSettings; className?: string;
}) {
  const grad = gradientByPalette(settings.palette);
  return <div className={`bg-gradient-to-br ${grad} bg-animated ${className}`} />;
}

export function SecondaryActions({
  contact,
  settings,
}: {
  contact: PublicContact;
  settings: TemplateSettings;
}) {
  return (
    <div className="flex gap-3 text-sm text-slate-600">
      {settings.showPhone && contact.phone && (
        <a className="hover:text-slate-900" href={`tel:${contact.phone}`}>Call</a>
      )}
      {settings.showEmail && contact.email && (
        <a className="hover:text-slate-900" href={`mailto:${contact.email}`}>Email</a>
      )}
      {settings.showSocials && contact.socials?.length ? (
        <a className="hover:text-slate-900" href={contact.socials[0].url} target="_blank" rel="noreferrer">
          Social
        </a>
      ) : null}
    </div>
  );
}
