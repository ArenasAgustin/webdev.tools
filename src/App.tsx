import { Header } from "@/components/layout/Header";
import { JsonPlayground } from "@/playgrounds/json/JsonPlayground";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Header />
        <JsonPlayground />
      </div>
    </div>
  );
}

export default App;
