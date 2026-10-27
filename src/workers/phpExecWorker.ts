import { executePhp } from "@/services/php/phpRuntime";
import type { PhpExecRequest, PhpExecResponse } from "@/services/php/phpRuntime";

const ctx = self as unknown as {
  postMessage: (message: PhpExecResponse) => void;
  onmessage: (event: MessageEvent<PhpExecRequest>) => void;
};

ctx.onmessage = (event: MessageEvent<PhpExecRequest>) => {
  void executePhp(event.data.code, {
    onStarted: () => ctx.postMessage({ type: "started" }),
  }).then((result) => ctx.postMessage({ type: "done", result }));
};
