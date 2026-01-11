import { Button } from "@/components/common/Button";

    export function Toolbar() {
  return (
    <section className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/5">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Action Buttons */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <i className="fas fa-tools text-yellow-400"></i> Herramientas
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="primary" size="md">
              <i className="fas fa-indent mr-1"></i> Formatear
            </Button>
            <Button variant="purple" size="md">
              <i className="fas fa-compress mr-1"></i> Minificar
            </Button>
            <Button variant="orange" size="md">
              <i className="fas fa-broom mr-1"></i> Limpiar vacíos
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <i className="fas fa-filter text-cyan-400"></i> Filtro JSONPath
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
              placeholder="Ej: $.users[0].name"
            />
            <Button variant="cyan" size="md">
              <i className="fas fa-search"></i>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
