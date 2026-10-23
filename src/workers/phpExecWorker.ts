import { executePhp } from "@/services/php/phpExecutor";
import type { PhpExecRequest, PhpExecResponse } from "@/services/php/phpExecutor";

const ctx = self as unknown as {
  postMessage: (message: PhpExecResponse) => void;
  onmessage: (event: MessageEvent<PhpExecRequest>) => void;
};

ctx.onmessage = (event: MessageEvent<PhpExecRequest>) => {
  void executePhp(event.data.code, {
    onStarted: () => ctx.postMessage({ type: "started" }),
  }).then((result) => ctx.postMessage({ type: "done", result }));
};
