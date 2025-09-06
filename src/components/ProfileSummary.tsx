import React, { useEffect, useMemo, useState } from 'react';
import TemplatePicker from './card/TemplatePicker';
import BusinessCard from './card/BusinessCard';
import { fetchCardConfig, saveCardConfig } from '../lib/card';
import { PublicContact, TemplateId, TemplateSettings } from '../types/profile';
import { supabase } from '../lib/supabase';

export default function ProfileSummary() {
  console.log('ProfileSummary component is rendering');
  const [profileId, setProfileId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<PublicContact>({});
  const [config, setConfig] = useState<{ templateId: TemplateId; templateSettings: TemplateSettings }>({
    templateId: 'minimal',
    templateSettings: { showPhone: true, showEmail: true, showSocials: true, backgroundStyle: 'gradient', density: 'comfy', avatarShape: 'circle', palette: 'brand' }
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // get profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error || !data) { 
        console.error('Error fetching profile:', error);
        setLoading(false); 
        return; 
      }
      console.log('Profile data loaded:', data);

      setProfileId(data.id);
      setContact({
        name: data.name ?? '',
        title: data.title ?? '',
        company: data.company ?? '',
        avatarUrl: data.profile_image_id ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        website: data.website ?? undefined,
        location: data.location ?? undefined,
        bio: data.bio ?? undefined,
        socials: data.socials ? Object.entries(data.socials).map(([label, url]) => ({ label, url })) : [],
        services: data.services ?? [],
      });

      const existing = await fetchCardConfig(data.id);
      if (existing) setConfig(existing);
      setLoading(false);
    })();
  }, []);

  const canSave = !!profileId && !loading;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 text-2xl font-semibold text-slate-900">Card Templates</div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 text-2xl font-semibold text-slate-900">Card Templates</div>

      <div className="grid gap-8 md:grid-cols-2">
        <TemplatePicker value={config} onChange={setConfig} />

        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">Live preview (updates in real time)</div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <BusinessCard contact={contact} templateId={config.templateId} settings={config.templateSettings}/>
            <div className="mt-6 flex justify-end">
              <button
                disabled={!canSave}
                onClick={async ()=>{
                  if (!profileId) return;
                  await saveCardConfig(profileId, config);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
                Save
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">PNG/SVG exports are disabled. Share via your profile link or QR only.</p>
        </div>
      </div>
    </div>
  );
}
