export type IndentStyle = number | "\t";

export const INDENT_OPTIONS: readonly { value: IndentStyle; label: string }[] = [
  { value: 2, label: "2 espacios" },
  { value: 4, label: "4 espacios" },
  { value: "\t", label: "Tab" },
];
