import React, { useMemo } from "react";
import { templates, CardTemplateId, TemplateOptions, ProfileLike } from "./templates";
import PalettePicker from "@/components/ui/PalettePicker";
import Segmented from "@/components/ui/Segmented";
import TemplateTile from "./TemplateTile";
import WizardFooter from "@/components/common/WizardFooter";

const PALETTES = [
  { from: "#3B82F6", to: "#6366F1" },
  { from: "#F97316", to: "#EF4444" },
  { from: "#10B981", to: "#06B6D4" },
  { from: "#A855F7", to: "#F97316" },
  { from: "#0F172A", to: "#334155" },
  { from: "#34D399", to: "#059669" },
];

export type StepProps = {
  profile: ProfileLike;
  value: { template: CardTemplateId; options: TemplateOptions };
  onChange: (v: StepProps["value"]) => void;
  onBack?: () => void;
  onSave?: () => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
};

const CardTemplatesStep: React.FC<StepProps> = ({ profile, value, onChange, onBack, onSave, onFinish }) => {
  const Preview = useMemo(
    () => templates.find((t) => t.id === value.template)?.preview ?? templates[0].preview,
    [value.template]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Card Templates</h2>
        <p className="text-slate-600">Pick a style, then lightly tune the look. Live preview updates on the right.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Left column */}
        <div>
          <div className="mb-3 text-sm font-medium text-slate-900">Choose a template</div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {templates.map((t) => {
              const Mini = t.preview;
              return (
                <TemplateTile
                  key={t.id}
                  label={t.name}
                  active={value.template === t.id}
                  onClick={() => onChange({ ...value, template: t.id })}
                >
                  <div className="w-[460px]">
                    <Mini profile={profile} options={{ ...value.options, density: "compact" }} />
                  </div>
                </TemplateTile>
              );
            })}
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-slate-700">Palette</div>
              <PalettePicker
                value={value.options.palette}
                presets={PALETTES}
                onChange={(palette) => onChange({ ...value, options: { ...value.options, palette } })}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <div className="mb-2 text-xs font-medium text-slate-700">Font</div>
                <Segmented
                  items={[
                    { label: "Brand", value: "Brand" },
                    { label: "Serif", value: "Serif" },
                    { label: "Rounded", value: "Rounded" },
                  ]}
                  value={value.options.font}
                  onChange={(font) => onChange({ ...value, options: { ...value.options, font: font as any } })}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-700">Avatar</div>
                <Segmented
                  items={[
                    { label: "Circle", value: "circle" },
                    { label: "Rounded", value: "rounded" },
                    { label: "Squircle", value: "squircle" },
                  ]}
                  value={value.options.avatar}
                  onChange={(avatar) => onChange({ ...value, options: { ...value.options, avatar: avatar as any } })}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-700">Background</div>
                <Segmented
                  items={[
                    { label: "Gradient", value: "gradient" },
                    { label: "Solid", value: "solid" },
                    { label: "Noise", value: "noise" },
                  ]}
                  value={value.options.background}
                  onChange={(background) => onChange({ ...value, options: { ...value.options, background: background as any } })}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-700">Density</div>
                <Segmented
                  items={[
                    { label: "Compact", value: "compact" },
                    { label: "Cozy", value: "cozy" },
                    { label: "Comfy", value: "comfy" },
                  ]}
                  value={value.options.density}
                  onChange={(density) => onChange({ ...value, options: { ...value.options, density: density as any } })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(["phone", "email", "socials"] as const).map((key) => (
                <label key={key} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm capitalize">{key}</span>
                  <input
                    type="checkbox"
                    checked={value.options.visible[key]}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        options: { ...value.options, visible: { ...value.options.visible, [key]: e.target.checked } },
                      })
                    }
                    className="h-4 w-4 accent-violet-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: live preview */}
        <div>
          <div className="mb-3 text-sm font-medium text-slate-900">
            Live preview <span className="text-slate-500">(updates in real time)</span>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <Preview profile={profile} options={value.options} />
          </div>
          <p className="mt-3 text-xs text-slate-500">PNG/SVG exports are disabled. Share via your profile link or QR only.</p>
        </div>
      </div>

      <WizardFooter onBack={onBack} onPrimary={onSave} onSecondary={onFinish} primaryLabel="Save" secondaryLabel="Finish & View QR" />
    </div>
  );
};

export default CardTemplatesStep;
