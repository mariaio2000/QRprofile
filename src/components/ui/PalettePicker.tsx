import React from "react";
import clsx from "clsx";
import type { Palette } from "@/components/templates/templates";

type Props = {
  value: Palette;
  presets: Palette[];
  onChange: (p: Palette) => void;
};

const PalettePicker: React.FC<Props> = ({ value, presets, onChange }) => {
  return (
    <div className="grid grid-cols-6 gap-2">
      {presets.map((p, i) => {
        const isActive = p.from === value.from && p.to === value.to;
        return (
          <button
            key={`${p.from}-${p.to}-${i}`}
            onClick={() => onChange(p)}
            className={clsx(
              "h-9 rounded-lg border transition",
              isActive ? "ring-2 ring-violet-400" : "hover:border-slate-300"
            )}
            style={{
              background: `linear-gradient(90deg, ${p.from}, ${p.to})`,
            }}
            aria-label={`Palette ${p.from} to ${p.to}`}
          />
        );
      })}
    </div>
  );
};

export default PalettePicker;
