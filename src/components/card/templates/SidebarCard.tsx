import React from 'react';
import { PublicContact, TemplateSettings } from '../../../types/profile';
import { gradientByPalette, avatarShapeClass, SecondaryActions, genericAvatar } from './common';

export default function SidebarCard({
  contact, settings,
}: { contact: PublicContact; settings: TemplateSettings }) {
  const grad = gradientByPalette(settings.palette);
  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl grid md:grid-cols-[220px_1fr]">
      <div className={`p-6 text-white rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl bg-gradient-to-br ${grad} bg-animated`}>
        <img
          className={`h-20 w-20 object-cover ${avatarShapeClass(settings.avatarShape)} ring-4 ring-white/40`}
          src={contact.avatarUrl || genericAvatar}
          onError={(e)=>{(e.currentTarget as HTMLImageElement).src=genericAvatar}}
          alt={contact.name || 'avatar'}
        />
        <div className="mt-4">
          <div className="text-lg font-semibold">{contact.name}</div>
          <div className="opacity-90">{contact.title}{contact.company ? ` @ ${contact.company}` : ''}</div>
        </div>
      </div>
      <div className="p-6">
        {contact.bio && <p className="text-slate-700">{contact.bio}</p>}
        <div className="mt-4">
          <SecondaryActions contact={contact} settings={settings}/>
        </div>
      </div>
    </div>
  );
}
