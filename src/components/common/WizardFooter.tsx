import React from "react";

type Props = {
  canGoBack?: boolean;
  backLabel?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onBack?: () => void;
  onPrimary?: () => void;   // usually Save / Continue
  onSecondary?: () => void; // "Finish & View QR"
  disabledPrimary?: boolean;
  disabledSecondary?: boolean;
  className?: string;
};

const WizardFooter: React.FC<Props> = ({
  canGoBack = true,
  backLabel = "Back",
  primaryLabel = "Save",
  secondaryLabel = "Finish & View QR",
  onBack,
  onPrimary,
  onSecondary,
  disabledPrimary,
  disabledSecondary,
  className,
}) => {
  return (
    <div
      className={
        "sticky bottom-0 z-40 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      }
    >
      <div className={"mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 " + (className ?? "")}>
        <div>
          {canGoBack && (
            <button 
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              onClick={onBack}
            >
              {backLabel}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            onClick={onPrimary} 
            disabled={disabledPrimary}
          >
            {primaryLabel}
          </button>
          <button 
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={onSecondary} 
            disabled={disabledSecondary}
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardFooter;
