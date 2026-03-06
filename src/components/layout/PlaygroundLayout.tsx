import type { ReactNode } from "react";

interface PlaygroundLayoutProps {
  editors: ReactNode;
  toolbar: ReactNode;
  panel?: ReactNode;
}

export function PlaygroundLayout({ editors, toolbar, panel }: PlaygroundLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      {editors}
      {panel}
      {toolbar}
    </div>
  );
}
