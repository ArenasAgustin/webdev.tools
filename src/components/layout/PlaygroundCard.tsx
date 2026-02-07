import type { PlaygroundConfig } from "@/types/playground";

interface PlaygroundCardProps {
  playground: PlaygroundConfig;
}

export function PlaygroundCard({ playground }: PlaygroundCardProps) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-cyan-500/20 blur-2xl"></div>
        <div className="absolute -right-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-500/20 blur-2xl"></div>
      </div>
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
            <i className={`${playground.icon} text-xl`}></i>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">
              Playground
            </p>
            <h3 className="text-xl font-semibold text-white">
              {playground.name}
            </h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          {playground.description}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
            {playground.language}
          </span>
        </div>
      </div>
    </div>
  );
}
