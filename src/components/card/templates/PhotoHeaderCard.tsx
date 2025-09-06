import React from 'react';
import { PublicContact, TemplateSettings } from '../../../types/profile';
import { AnimatedHeader, avatarShapeClass, densityPad, SecondaryActions, genericAvatar } from './common';

export default function PhotoHeaderCard({
  contact, settings,
}: { contact: PublicContact; settings: TemplateSettings }) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <AnimatedHeader settings={settings} className="h-32" />
      <div className={`${densityPad(settings)} -mt-10`}>
        <img
          className={`h-20 w-20 object-cover ring-4 ring-white ${avatarShapeClass(settings.avatarShape)} bg-slate-100`}
          src={contact.avatarUrl || genericAvatar}
          onError={(e)=>{(e.currentTarget as HTMLImageElement).src=genericAvatar}}
          alt={contact.name || 'avatar'}
        />
        <div className="mt-2">
          <div className="text-xl font-semibold text-slate-900">{contact.name}</div>
          <div className="text-slate-600">{contact.title}{contact.company ? ` @ ${contact.company}` : ''}</div>
        </div>
        {contact.bio && <p className="mt-3 text-slate-700">{contact.bio}</p>}
        <div className="mt-4">
          <SecondaryActions contact={contact} settings={settings}/>
        </div>
      </div>
    </div>
  );
}
