import { createWorkerClient, type WorkerClient } from "@/services/worker/clientFactory";
import type { WorkerRequest, WorkerResponse, WorkerPayloadBase } from "@/services/worker/types";

interface CreatePlaygroundWorkerAdapterOptions<
  TPayload extends WorkerPayloadBase,
  TRequest extends WorkerRequest<TPayload>,
> {
  workerUrl: URL;
  idPrefix: string;
  unavailableMessage?: string;
  buildRequest?: (id: string, payload: TPayload) => TRequest;
}

export interface PlaygroundWorkerAdapter<
  TPayload extends WorkerPayloadBase,
  TResponse extends WorkerResponse,
> {
  run: WorkerClient<TPayload, TResponse>;
  preload: () => void;
  terminate: () => void;
}

export function createPlaygroundWorkerAdapter<
  TPayload extends WorkerPayloadBase,
  TRequest extends WorkerRequest<TPayload>,
  TResponse extends WorkerResponse,
>(
  options: CreatePlaygroundWorkerAdapterOptions<TPayload, TRequest>,
): PlaygroundWorkerAdapter<TPayload, TResponse> {
  const run = createWorkerClient<TPayload, TRequest, TResponse>({
    workerUrl: options.workerUrl,
    idPrefix: options.idPrefix,
    unavailableMessage: options.unavailableMessage,
    buildRequest:
      options.buildRequest ??
      ((id: string, payload: TPayload) => ({ id, ...payload }) as unknown as TRequest),
  });

  return {
    run,
    preload: () => run.preload(),
    terminate: () => run.terminate(),
  };
}
