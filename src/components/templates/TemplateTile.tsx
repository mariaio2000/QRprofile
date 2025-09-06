import React from "react";
import { CardPreviewProps } from "./templates";
import clsx from "clsx";

type Props = {
  active?: boolean;
  label: string;
  children: React.ReactNode; // a rendered mini card
  onClick?: () => void;
};

const TemplateTile: React.FC<Props> = ({ active, label, children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative aspect-[5/3] overflow-hidden rounded-xl border bg-white p-2 text-left transition",
        active ? "border-violet-500 ring-2 ring-violet-200" : "hover:border-slate-300"
      )}
    >
      <div className="absolute right-2 top-2 rounded bg-white/85 px-2 py-0.5 text-xs text-slate-700 shadow">
        {label}
      </div>
      <div className="origin-top-left scale-[0.62] transform">
        {children}
      </div>
    </button>
  );
};

export default TemplateTile;
