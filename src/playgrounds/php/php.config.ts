import type { PlaygroundConfig } from "@/types/playground";

export const phpPlaygroundConfig: PlaygroundConfig = {
  id: "php",
  name: "PHP 7.4 tools",
  icon: "fab fa-php",
  description: "Ejecutar y probar código PHP 7.4",
  language: "php",
  keywords: ["PHP formatter", "PHP beautifier", "PHP syntax validator", "online PHP tool"],
  example: `<?php
// Ejemplo: Función para calcular factorial
function factorial(int $n): int {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}

echo "Factorial de 5: " . factorial(5) . "\\n";

// Ejemplo: Manipular arrays (arrow functions: PHP 7.4+)
$numeros = [1, 2, 3, 4, 5];
$cuadrados = array_map(fn($n) => $n * $n, $numeros);
echo "Cuadrados: " . implode(", ", $cuadrados) . "\\n";

// Ejemplo: Clase con propiedades tipadas (PHP 7.4)
class Usuario {
    private string $nombre;
    private int $edad;

    public function __construct(string $nombre, int $edad) {
        $this->nombre = $nombre;
        $this->edad = $edad;
    }

    public function saludar(): string {
        return "Hola, soy {$this->nombre} y tengo {$this->edad} anos";
    }
}

$usuario = new Usuario("Juan", 28);
echo $usuario->saludar() . "\\n";`,
};
