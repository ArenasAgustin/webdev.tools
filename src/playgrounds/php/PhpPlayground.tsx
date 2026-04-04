import { GenericPlayground } from "../GenericPlayground";
import { phpEngine } from "../engines/php.engine";

/**
 * PHP Playground - Delegates to GenericPlayground with PHP engine
 */
export function PhpPlayground() {
  return <GenericPlayground engine={phpEngine} />;
}
