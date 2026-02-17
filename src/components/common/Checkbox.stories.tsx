import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Common/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["blue", "purple", "orange", "green", "cyan"],
    },
  },
  args: {
    label: "Accept terms",
    checked: false,
    onChange: fn(),
    color: "blue",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Purple: Story = {
  args: {
    color: "purple",
    label: "Enable notifications",
  },
};

export const Orange: Story = {
  args: {
    color: "orange",
    label: "Auto-save",
    checked: true,
  },
};

export const Green: Story = {
  args: {
    color: "green",
    label: "Verified",
    checked: true,
  },
};
