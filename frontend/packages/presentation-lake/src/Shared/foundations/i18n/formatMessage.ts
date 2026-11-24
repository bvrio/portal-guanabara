import type { MessageDescriptor, MessageValues } from './types';

/** The part of vue-intl's IntlShape this helper needs, whatever its rich-text type. */
interface MessageFormatter {
  formatMessage(descriptor: never, values?: never): unknown;
}

/**
 * `intl.formatMessage` for plain-string results (labels, attributes, values
 * passed into other messages). `defineMessages` types descriptors without
 * their ICU arguments, so this helper accepts values for any descriptor.
 */
export function formatMessage(intl: MessageFormatter, descriptor: MessageDescriptor, values?: MessageValues): string {
  const format = intl.formatMessage as (descriptor: MessageDescriptor, values?: MessageValues) => unknown;
  return String(format.call(intl, descriptor, values));
}
