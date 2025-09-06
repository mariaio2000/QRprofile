import { supabase } from './supabase';
import { CardConfig, TemplateId, TemplateSettings } from '../types/profile';

export async function saveCardConfig(profileId: string, config: CardConfig) {
  const { error } = await supabase
    .from('profiles')
    .update({
      template_id: config.templateId,
      template_settings: config.templateSettings,
    })
    .eq('id', profileId);
  if (error) throw error;
}

export async function fetchCardConfig(profileId: string): Promise<CardConfig | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('template_id, template_settings')
    .eq('id', profileId)
    .single();
  if (error || !data) return null;
  return {
    templateId: (data.template_id as TemplateId) ?? 'minimal',
    templateSettings: (data.template_settings as TemplateSettings) ?? {},
  };
}

export async function createLead(input: {
  profileId: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}) {
  const { error } = await supabase.from('leads').insert({
    profile_id: input.profileId,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    message: input.message ?? null,
    source: input.source ?? 'qr',
  });
  if (error) throw error;
}
