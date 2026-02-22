import { defineWorkerClientTests } from "@/test/workerHarness";

defineWorkerClientTests({
  name: "workerClient",
  loadClient: async () => {
    const { runJsonWorker } = await import("./workerClient");
    return runJsonWorker;
  },
  initialPayload: { action: "minify", input: '{ "a": 1 }' },
  reusePayloads: [
    { action: "format", input: "{}", options: { indent: 2 } },
    { action: "clean", input: "{}", options: { removeNull: true } },
  ],
  successValues: {
    initial: '{"a":1}',
    reuseFirst: "{}",
    reuseSecond: "{}",
  },
});
