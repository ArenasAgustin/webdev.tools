import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Modal } from "./Modal";

const meta = {
  title: "Common/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    iconColor: {
      control: "select",
      options: [
        "blue-400",
        "purple-400",
        "orange-400",
        "green-400",
        "cyan-400",
        "red-400",
        "yellow-400",
      ],
    },
  },
  args: {
    isOpen: true,
    title: "Sample Modal",
    icon: "info-circle",
    iconColor: "blue-400",
    onClose: fn(),
    children: (
      <div className="space-y-2">
        <p className="text-gray-300">This is modal content.</p>
        <p className="text-gray-300">You can include any React elements here.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    title: "Confirmation",
    icon: "question-circle",
    iconColor: "yellow-400",
    footer: (
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
          Cancel
        </button>
        <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
          Confirm
        </button>
      </div>
    ),
  },
};

export const Purple: Story = {
  args: {
    title: "Settings",
    icon: "cog",
    iconColor: "purple-400",
    children: <p className="text-gray-300">Configure your preferences in this modal.</p>,
  },
};

export const Error: Story = {
  args: {
    title: "Error",
    icon: "exclamation-circle",
    iconColor: "red-400",
    children: (
      <div className="space-y-2">
        <p className="text-gray-300">An error occurred while processing your request.</p>
        <p className="text-gray-300">Please try again later.</p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
