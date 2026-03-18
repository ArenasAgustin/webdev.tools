import { defineWorkerClientTests } from "@/test/workerHarness";

defineWorkerClientTests({
  name: "workerClient",
  loadClient: async () => {
    const { jsonWorkerAdapter } = await import("./workerClient");
    return jsonWorkerAdapter.run;
  },
  initialPayload: { action: "minify", input: '{ "a": 1 }' },
  reusePayloads: [
    { action: "format", input: "{}", options: { indentSize: 2 } },
    { action: "clean", input: "{}", options: { removeNull: true } },
  ],
  successValues: {
    initial: '{"a":1}',
    reuseFirst: "{}",
    reuseSecond: "{}",
  },
});
