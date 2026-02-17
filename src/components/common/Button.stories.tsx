import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Common/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "danger", "success", "purple", "cyan", "orange"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
  args: {
    children: "Action",
    onClick: fn(),
    variant: "primary",
    size: "sm",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Delete",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Saved",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Run",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};
