import React from 'react';
import { TemplateId, TemplateSettings } from '../../types/profile';

const templates: { id: TemplateId; name: string; thumbClass: string }[] = [
  { id: 'minimal',       name: 'Minimal',       thumbClass: 'bg-white border' },
  { id: 'photo-header',  name: 'Photo Header',  thumbClass: 'bg-gradient-to-br from-indigo-500 to-blue-500 bg-animated' },
  { id: 'sidebar',       name: 'Sidebar',       thumbClass: 'bg-slate-100' },
  { id: 'accent-badge',  name: 'Accent Badge',  thumbClass: 'bg-white border' },
  { id: 'split',         name: 'Split',         thumbClass: 'bg-slate-100' },
  { id: 'glass-glow',    name: 'Glass Glow',    thumbClass: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-animated' },
];

export default function TemplatePicker({
  value, onChange,
}: {
  value: { templateId: TemplateId; templateSettings: TemplateSettings };
  onChange: (v: { templateId: TemplateId; templateSettings: TemplateSettings }) => void;
}) {
  const { templateId, templateSettings } = value;
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-sm font-medium text-slate-700">Choose a template</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {templates.map(t => (
            <button key={t.id}
              onClick={() => onChange({ templateId: t.id, templateSettings })}
              className={`h-28 rounded-2xl flex items-end justify-center p-2 ${t.thumbClass} ${templateId === t.id ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-slate-300'}`}>
              <span className="text-xs font-medium text-slate-800 bg-white/80 rounded-md px-1.5 py-0.5">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-700">Fine-tune (kept minimal)</div>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            value={templateSettings.palette ?? 'brand'}
            onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, palette: e.target.value as any }})}
          >
            <option value="brand">Brand</option>
            <option value="blue">Blue</option>
            <option value="violet">Violet</option>
            <option value="teal">Teal</option>
            <option value="slate">Slate</option>
          </select>

          <select
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            value={templateSettings.avatarShape ?? 'circle'}
            onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, avatarShape: e.target.value as any }})}
          >
            <option value="circle">Avatar: Circle</option>
            <option value="rounded">Avatar: Rounded</option>
            <option value="square">Avatar: Square</option>
          </select>

          <select
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            value={templateSettings.density ?? 'comfy'}
            onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, density: e.target.value as any }})}
          >
            <option value="comfy">Comfy</option>
            <option value="compact">Compact</option>
          </select>

          <select
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            value={templateSettings.backgroundStyle ?? 'gradient'}
            onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, backgroundStyle: e.target.value as any }})}
          >
            <option value="gradient">Background: Gradient</option>
            <option value="solid">Background: Solid</option>
            <option value="pattern">Background: Pattern</option>
          </select>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={templateSettings.showPhone ?? true}
              onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, showPhone: e.target.checked }})}/>
            Phone
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={templateSettings.showEmail ?? true}
              onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, showEmail: e.target.checked }})}/>
            Email
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={templateSettings.showSocials ?? true}
              onChange={(e)=> onChange({ templateId, templateSettings: { ...templateSettings, showSocials: e.target.checked }})}/>
            Socials
          </label>
        </div>
      </div>
    </div>
  );
}
