import type { TipItem, QuickExample } from "@/components/common/TipsModal";
import { translate } from "@/i18n/translate";

const TIP_KEYS = "json.tips";

/**
 * JSONPath tips, translated at call time so they follow the active language.
 */
export function getJsonPathTips(): TipItem[] {
  return [
    {
      id: "basic-access",
      category: translate(`${TIP_KEYS}.categories.basicAccess`),
      categoryIcon: "bolt",
      categoryColor: "blue-400",
      items: [
        { code: "$.propiedad", description: translate(`${TIP_KEYS}.items.fromRoot`) },
        { code: "$.users", description: translate(`${TIP_KEYS}.items.usersArray`) },
        { code: "$.metadata.total", description: translate(`${TIP_KEYS}.items.nestedProperty`) },
      ],
    },
    {
      id: "arrays",
      category: translate(`${TIP_KEYS}.categories.arrays`),
      categoryIcon: "list",
      categoryColor: "purple-400",
      items: [
        { code: "$.users[0]", description: translate(`${TIP_KEYS}.items.firstElement`) },
        { code: "$.users[-1:]", description: translate(`${TIP_KEYS}.items.lastElement`) },
        { code: "$.users[0,2]", description: translate(`${TIP_KEYS}.items.multipleIndexes`) },
      ],
    },
    {
      id: "wildcard",
      category: translate(`${TIP_KEYS}.categories.wildcard`),
      categoryIcon: "asterisk",
      categoryColor: "green-400",
      items: [
        { code: "$.users[*]", description: translate(`${TIP_KEYS}.items.allUsers`) },
        { code: "$.users[*].name", description: translate(`${TIP_KEYS}.items.allNames`) },
        { code: "$..name", description: translate(`${TIP_KEYS}.items.namesAnyLevel`) },
      ],
    },
    {
      id: "conditionals",
      category: translate(`${TIP_KEYS}.categories.conditionals`),
      categoryIcon: "filter",
      categoryColor: "orange-400",
      items: [
        { code: "$.users[?(@.age > 25)]", description: translate(`${TIP_KEYS}.items.ageOver25`) },
        { code: "$.users[?(@.active)]", description: translate(`${TIP_KEYS}.items.activeUsers`) },
        {
          code: "$.products[?(@.price < 100)]",
          description: translate(`${TIP_KEYS}.items.cheapProducts`),
        },
      ],
    },
  ];
}

export function getJsonPathQuickExamples(): QuickExample[] {
  return [
    {
      code: "$.users",
      label: "$.users",
      description: translate(`${TIP_KEYS}.examples.fullArray`),
    },
    {
      code: "$.users[0]",
      label: "$.users[0]",
      description: translate(`${TIP_KEYS}.examples.firstUser`),
    },
    {
      code: "$.users[*].name",
      label: "$.users[*].name",
      description: translate(`${TIP_KEYS}.examples.allNames`),
    },
    {
      code: "$.users[?(@.active)]",
      label: "$.users[?(@.active)]",
      description: translate(`${TIP_KEYS}.examples.activeOnly`),
    },
    {
      code: "$.metadata",
      label: "$.metadata",
      description: translate(`${TIP_KEYS}.examples.metadata`),
    },
    {
      code: "$.products[*].price",
      label: "$.products[*].price",
      description: translate(`${TIP_KEYS}.examples.prices`),
    },
  ];
}
