import { GenericPlayground } from "../GenericPlayground";
import { jsEngine } from "../engines/js.engine";

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Delegates to GenericPlayground with JS engine
 */
export function JsPlayground() {
  return <GenericPlayground engine={jsEngine} />;
}
