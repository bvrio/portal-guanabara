import { type Component, type InjectionKey, provide } from 'vue';

/**
 * Optional routing adapter for <Link>.
 *
 * The Presentation Lake stays routing-agnostic: by default <Link> renders a
 * plain <a href>. An App may provide its router link component (e.g. Nuxt's
 * <NuxtLink>, which accepts `href`) so internal links navigate client-side.
 */
export const LINK_COMPONENT_KEY: InjectionKey<Component> = Symbol('presentation-lake:link-component');

export function provideLinkComponent(component: Component) {
  provide(LINK_COMPONENT_KEY, component);
}
