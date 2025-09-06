import React from "react";
import clsx from "clsx";

type Item<T extends string> = { label: string; value: T };
type Props<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
};

export default function Segmented<T extends string>({ items, value, onChange, className }: Props<T>) {
  return (
    <div className={clsx("inline-flex rounded-lg border bg-white p-1", className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md",
              active ? "bg-violet-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
