import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const meta = {
  title: "Common/ToggleButtonGroup",
  component: ToggleButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    value: "format",
    onChange: fn(),
    options: [
      { value: "format", label: "Format" },
      { value: "minify", label: "Minify" },
      { value: "clean", label: "Clean" },
    ],
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoOptions: Story = {
  args: {
    value: "on",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ],
  },
};

export const Indent: Story = {
  args: {
    value: 2,
    options: [
      { value: 2, label: "2 spaces" },
      { value: 4, label: "4 spaces" },
    ],
  },
};

export const ManyOptions: Story = {
  args: {
    value: "all",
    options: [
      { value: "all", label: "All" },
      { value: "today", label: "Today" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ],
  },
};
