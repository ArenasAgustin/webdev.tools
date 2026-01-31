import type { TipItem, QuickExample } from "@/components/common/TipsModal";

export const jsonPathTips: TipItem[] = [
  {
    id: "basic-access",
    category: "Acceso Básico",
    categoryIcon: "bolt",
    categoryColor: "blue-400",
    items: [
      { code: "$.propiedad", description: "Acceso desde la raíz" },
      { code: "$.users", description: "Obtener el array de usuarios" },
      { code: "$.metadata.total", description: "Propiedad anidada" },
    ],
  },
  {
    id: "arrays",
    category: "Arrays",
    categoryIcon: "list",
    categoryColor: "purple-400",
    items: [
      { code: "$.users[0]", description: "Primer elemento" },
      { code: "$.users[-1:]", description: "Último elemento" },
      { code: "$.users[0,2]", description: "Múltiples índices" },
    ],
  },
  {
    id: "wildcard",
    category: "Wildcard (*)",
    categoryIcon: "asterisk",
    categoryColor: "green-400",
    items: [
      { code: "$.users[*]", description: "Todos los usuarios" },
      { code: "$.users[*].name", description: "Todos los nombres" },
      { code: "$..name", description: "Nombres en cualquier nivel" },
    ],
  },
  {
    id: "conditionals",
    category: "Filtros Condicionales",
    categoryIcon: "filter",
    categoryColor: "orange-400",
    items: [
      { code: "$.users[?(@.age > 25)]", description: "Edad mayor a 25" },
      { code: "$.users[?(@.active)]", description: "Usuarios activos" },
      {
        code: "$.products[?(@.price < 100)]",
        description: "Productos baratos",
      },
    ],
  },
];

export const jsonPathQuickExamples: QuickExample[] = [
  { code: "$.users", label: "$.users", description: "Array completo" },
  {
    code: "$.users[0]",
    label: "$.users[0]",
    description: "Primer usuario",
  },
  {
    code: "$.users[*].name",
    label: "$.users[*].name",
    description: "Todos nombres",
  },
  {
    code: "$.users[?(@.active)]",
    label: "$.users[?(@.active)]",
    description: "Solo activos",
  },
  { code: "$.metadata", label: "$.metadata", description: "Metadatos" },
  {
    code: "$.products[*].price",
    label: "$.products[*].price",
    description: "Precios",
  },
];
