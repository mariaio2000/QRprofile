import React from 'react';
import { PublicContact, TemplateSettings } from '../../../types/profile';
import { avatarShapeClass, densityPad, SecondaryActions, genericAvatar, chipClass } from './common';

export default function AccentBadgeCard({
  contact, settings,
}: { contact: PublicContact; settings: TemplateSettings }) {
  return (
    <div className={`w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl ${densityPad(settings)}`}>
      <div className="flex items-center gap-4">
        <img className={`h-16 w-16 object-cover ${avatarShapeClass(settings.avatarShape)} bg-slate-100`}
             src={contact.avatarUrl || genericAvatar} 
             onError={(e)=>{(e.currentTarget as HTMLImageElement).src=genericAvatar}}
             alt={contact.name || 'avatar'} />
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold text-slate-900">{contact.name}</div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${chipClass(settings.palette)}`}>
              {contact.title || 'Professional'}
            </span>
          </div>
          {contact.company && <div className="text-slate-600">{contact.company}</div>}
        </div>
      </div>
      {contact.bio && <p className="mt-4 text-slate-700">{contact.bio}</p>}
      <div className="mt-4">
        <SecondaryActions contact={contact} settings={settings}/>
      </div>
    </div>
  );
}
