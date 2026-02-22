import { defineWorkerClientTests } from "@/test/workerHarness";

defineWorkerClientTests({
  name: "js workerClient",
  loadClient: async () => {
    const { runJsWorker } = await import("./workerClient");
    return runJsWorker;
  },
  initialPayload: { action: "minify", input: "const x = 1;" },
  reusePayloads: [
    {
      action: "format",
      input: "const x=1;",
      options: { indentSize: 2 },
    },
    { action: "minify", input: "const x = 1;" },
  ],
  successValues: {
    initial: "const x=1;",
    reuseFirst: "const x = 1;",
    reuseSecond: "const x=1;",
  },
});
