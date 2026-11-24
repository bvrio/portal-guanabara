<script lang="ts">
/**
 * Vue counterpart of react-intl's <FormattedMessage>.
 *
 * vue-intl ships formatting functions (useIntl().formatMessage) but no
 * component, so the Presentation Lake owns this tiny adapter. It keeps the
 * `<FormattedMessage v-bind="defaultMessages.title" />` usage close to the
 * original React convention.
 */
import { defineComponent, type PropType } from 'vue';
import { useIntl } from 'vue-intl';

import type { MessageDescriptor, MessageValues } from './types';

export interface FormattedMessageProps {
  id?: MessageDescriptor['id'];
  defaultMessage?: MessageDescriptor['defaultMessage'];
  description?: MessageDescriptor['description'];
  values?: MessageValues;
}

export default defineComponent({
  name: 'FormattedMessage',
  props: {
    id: {
      type: String as PropType<FormattedMessageProps['id']>,
      default: undefined,
    },
    defaultMessage: {
      type: [String, Array] as PropType<FormattedMessageProps['defaultMessage']>,
      default: undefined,
    },
    description: {
      type: [String, Object] as PropType<FormattedMessageProps['description']>,
      default: undefined,
    },
    values: {
      type: Object as PropType<MessageValues>,
      default: undefined,
    },
  },
  setup(props) {
    const intl = useIntl();

    return () =>
      intl.formatMessage(
        {
          id: props.id,
          defaultMessage: props.defaultMessage,
          description: props.description,
        },
        // vue-intl accepts primitives, VNodes and rich-text tag functions.
        props.values as Parameters<typeof intl.formatMessage>[1],
      );
  },
});
</script>
