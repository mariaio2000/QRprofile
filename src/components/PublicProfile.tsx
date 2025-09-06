import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProfileData, CardConfig, PublicContact, TemplateId, TemplateSettings } from '../types/profile';
import { supabase } from '../lib/supabase';
import BusinessCard from './card/BusinessCard';
import { createLead } from '../lib/card';

interface PhotoWidget {
  id: string;
  title: string;
  photos: string[];
  layout: 'grid' | 'carousel';
}

interface PublicProfileProps {
  username: string;
  onBackToHome?: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ username, onBackToHome }) => {
  const [profileId, setProfileId] = useState('');
  const [contact, setContact] = useState<PublicContact>({});
  const [config, setConfig] = useState<CardConfig>({ templateId: 'minimal', templateSettings: {} });
  const [connectOpen, setConnectOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Profile not found');
        return;
      }

      setProfileId(data.id);
      setContact({
        name: data.name ?? '',
        title: data.title ?? '',
        company: data.company ?? '',
        avatarUrl: data.avatar_url ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        website: data.website ?? undefined,
        location: data.location ?? undefined,
        bio: data.bio ?? undefined,
        socials: data.socials ? Object.entries(data.socials).map(([label, url]) => ({ label, url })) : [],
        services: data.services ?? [],
      });
      setConfig({
        templateId: (data.template_id as TemplateId) || 'minimal',
        templateSettings: (data.template_settings as TemplateSettings) || {},
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !contact.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The profile "@{username}" doesn't exist or has been removed.
          </p>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <BusinessCard contact={contact} templateId={config.templateId} settings={config.templateSettings}/>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setConnectOpen(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            Connect
          </button>
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">
            Copy link
          </button>
        </div>
      </div>

      {/* Connect modal */}
      {connectOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <div className="mb-3 text-lg font-semibold">Send a message</div>
            {submitted ? (
              <div className="text-slate-700">Thanks! Your message was sent.</div>
            ) : (
              <form className="space-y-3" onSubmit={async (e)=> {
                e.preventDefault();
                await createLead({ profileId, ...form, source: 'qr' });
                setSubmitted(true);
              }}>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Your name"
                       value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Email"
                       value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Phone"
                       value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})}/>
                <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Message"
                       rows={4} value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})}/>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setConnectOpen(false)}
                          className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">Close</button>
                  <button type="submit"
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Send</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;