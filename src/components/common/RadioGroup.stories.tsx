import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Common/RadioGroup",
  component: RadioGroup,
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
    name: "options",
    value: "option1",
    onChange: fn(),
    color: "blue",
    options: [
      { value: "option1", label: "First" },
      { value: "option2", label: "Second" },
      { value: "option3", label: "Third" },
    ],
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Purple: Story = {
  args: {
    color: "purple",
    value: "option2",
  },
};

export const Orange: Story = {
  args: {
    color: "orange",
    options: [
      { value: "format", label: "Formatear" },
      { value: "minify", label: "Minificar" },
    ],
    value: "format",
  },
};

export const SingleOption: Story = {
  args: {
    options: [{ value: "only", label: "Only Choice" }],
    value: "only",
  },
};
