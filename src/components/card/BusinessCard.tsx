import React from 'react';
import { PublicContact, TemplateId, TemplateSettings } from '../../types/profile';
import MinimalCard from './templates/MinimalCard';
import PhotoHeaderCard from './templates/PhotoHeaderCard';
import SidebarCard from './templates/SidebarCard';
import AccentBadgeCard from './templates/AccentBadgeCard';
import SplitCard from './templates/SplitCard';
import GlassGlowCard from './templates/GlassGlowCard';

export default function BusinessCard({
  contact, templateId, settings,
}: {
  contact: PublicContact;
  templateId: TemplateId;
  settings: TemplateSettings;
}) {
  switch (templateId) {
    case 'photo-header': return <PhotoHeaderCard contact={contact} settings={settings}/>;
    case 'sidebar': return <SidebarCard contact={contact} settings={settings}/>;
    case 'accent-badge': return <AccentBadgeCard contact={contact} settings={settings}/>;
    case 'split': return <SplitCard contact={contact} settings={settings}/>;
    case 'glass-glow': return <GlassGlowCard contact={contact} settings={settings}/>;
    default: return <MinimalCard contact={contact} settings={settings}/>;
  }
}
