import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Common/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    title: "Card Title",
    icon: "info-circle",
    children: "This is a card content area",
    className: "bg-blue-500/10 border-blue-500/20",
    headerClassName: "text-blue-400",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    title: "Settings",
    icon: "cog",
    className: "bg-purple-500/10 border-purple-500/20",
    headerClassName: "text-purple-400",
    children: "Configure your preferences here",
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    className: "bg-gray-500/10 border-gray-500/20",
    children: "Content without a title",
  },
};

export const LargeContent: Story = {
  args: {
    title: "Documentation",
    icon: "book",
    className: "bg-cyan-500/10 border-cyan-500/20",
    headerClassName: "text-cyan-400",
    children: (
      <div className="space-y-2">
        <p>Storybook is a powerful tool for component development.</p>
        <p>It helps you build and test components in isolation.</p>
        <p>This card demonstrates multiple lines of content.</p>
      </div>
    ),
  },
};
