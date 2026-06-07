import { GenericPlayground } from "../GenericPlayground";
import { sqlEngine } from "../engines/sql.engine";

/**
 * SQL Playground - Delegates to GenericPlayground with SQL engine.
 * renderOutputPanel is defined on sqlEngine.
 */
export function SqlPlayground() {
  return <GenericPlayground engine={sqlEngine} />;
}
