import type { MessageDescriptor } from 'vue-intl';

export type { MessageDescriptor };

/**
 * Values interpolated into an ICU message.
 * Rich-text values (VNodes / tag functions) are also accepted by vue-intl.
 */
export type MessageValues = Record<string, unknown>;
