import type { HttpRequest, HttpTransport } from './httpClient';

export interface RecordedCall extends HttpRequest {
  path: string;
}

/** Test helper: records calls and answers with a fixed response or error. */
export function createFakeHttpTransport(respond: (call: RecordedCall) => unknown = () => ({})) {
  const calls: RecordedCall[] = [];

  const transport: HttpTransport = async <T>(path: string, request: HttpRequest) => {
    const call = { path, ...request };
    calls.push(call);
    return respond(call) as T;
  };

  return { transport, calls };
}
