import type { JsonError } from "@/types/common";

export interface WorkerPayloadBase {
  input: string;
}

export type WorkerRequest<TPayload extends WorkerPayloadBase> = { id: string } & TPayload;

export interface WorkerResponse<TError = JsonError> {
  id: string;
  ok: boolean;
  value?: string;
  error?: TError;
}
