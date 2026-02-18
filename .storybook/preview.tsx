import type { Preview, Decorator } from "@storybook/react-vite";
import { ToastProvider } from "../src/context/ToastContext";
import { ToastContainer } from "../src/components/common/ToastContainer";

/**
 * Global Decorator: Toast Provider
 * Provides toast context and container to all stories
 */
const withToastProvider: Decorator = (Story) => (
  <ToastProvider>
    <Story />
    <ToastContainer />
  </ToastProvider>
);

/**
 * Global Decorator: Consistent Layout & Padding
 * Adds consistent spacing and background for better story presentation
 */
const withLayout: Decorator = (Story) => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <Story />
    </div>
  </div>
);

const preview: Preview = {
  decorators: [withToastProvider, withLayout],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
