export type IndentStyle = number | "\t";

/** Indent choices; labels are i18n keys (with their interpolation params) translated by the UI. */
export const INDENT_OPTIONS: readonly {
  value: IndentStyle;
  labelKey: string;
  labelParams?: Record<string, number>;
}[] = [
  { value: 2, labelKey: "config.indentSpaces", labelParams: { count: 2 } },
  { value: 4, labelKey: "config.indentSpaces", labelParams: { count: 4 } },
  { value: "\t", labelKey: "config.indentTab" },
];
