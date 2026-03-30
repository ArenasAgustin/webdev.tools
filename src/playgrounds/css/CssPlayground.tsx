import { GenericPlayground } from "../GenericPlayground";
import { cssEngine } from "../engines/css.engine";

/**
 * CSS Playground - Delegates to GenericPlayground with CSS engine
 */
export function CssPlayground() {
  return <GenericPlayground engine={cssEngine} />;
}
