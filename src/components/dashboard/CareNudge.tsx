import { Sun, Droplets, ArrowUpRight } from "lucide-react";

export default function CareNudge() {
  return (
    <div className="overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]">
            <Sun size={12} aria-hidden="true" />
            Little care nudge
          </span>
          <h2 className="mt-4 text-display text-[19px] font-semibold">
            A sip, not a soak.
          </h2>
          <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-primary-foreground/75">
            Before watering, touch the top inch of soil. Dry? Your monstera is
            ready.
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground">
          <Droplets size={19} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-primary-foreground/15 pt-3 text-[10px] text-primary-foreground/65">
        <span>CARE NOTE · MONSTERA</span>
        <span className="inline-flex items-center gap-1">
          Read more <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
