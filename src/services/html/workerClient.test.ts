import { defineWorkerClientTests } from "@/test/workerHarness";

defineWorkerClientTests({
  name: "html workerClient",
  loadClient: async () => {
    const { runHtmlWorker } = await import("./workerClient");
    return runHtmlWorker;
  },
  initialPayload: {
    action: "minify",
    input: "<div> <span>ok</span> </div>",
  },
  reusePayloads: [
    {
      action: "format",
      input: "<div><span>ok</span></div>",
      options: { indentSize: 2 },
    },
    {
      action: "minify",
      input: "<div> <span>ok</span> </div>",
    },
  ],
  successValues: {
    initial: "<div><span>ok</span></div>",
    reuseFirst: "<div>\n  <span>ok</span>\n</div>",
    reuseSecond: "<div><span>ok</span></div>",
  },
});
