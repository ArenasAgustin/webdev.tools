import { defineWorkerClientTests } from "@/test/workerHarness";

defineWorkerClientTests({
  name: "css workerClient",
  loadClient: async () => {
    const { runCssWorker } = await import("./workerClient");
    return runCssWorker;
  },
  initialPayload: { action: "minify", input: ".card { color: red; }" },
  reusePayloads: [
    {
      action: "format",
      input: ".card{color:red}",
      options: { indentSize: 2 },
    },
    { action: "minify", input: ".card { color: red; }" },
  ],
  successValues: {
    initial: ".card{color:red}",
    reuseFirst: ".card {\n  color: red;\n}",
    reuseSecond: ".card{color:red}",
  },
});
