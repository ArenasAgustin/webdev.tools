import { Header } from "@/components/layout/Header";
import { JsonPlayground } from "@/playgrounds/json/JsonPlayground";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-sm">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl min-h-screen grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-4">
        <Header />
        <JsonPlayground />
      </div>
    </div>
  );
}

export default App;
