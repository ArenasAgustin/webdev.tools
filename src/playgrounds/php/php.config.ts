import { getLocalizedString, type PlaygroundConfig } from "@/types/playground";

/**
 * File names, mime type and import filter shared by the PHP engine and its actions hook.
 */
export const phpFileSettings = {
  inputFileName: "code.php",
  outputFileName: "output.php",
  mimeType: "application/x-php",
  acceptExtensions: ".php",
} as const;

/** The built-in example, per UI language. */
const PHP_EXAMPLE = {
  es: `<?php
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
        return "Hola, soy {$this->nombre} y tengo {$this->edad} años";
    }
}

$usuario = new Usuario("Juan", 28);
echo $usuario->saludar() . "\\n";`,
  en: `<?php
// Example: Function to calculate a factorial
function factorial(int $n): int {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}

echo "Factorial of 5: " . factorial(5) . "\\n";

// Example: Working with arrays (arrow functions: PHP 7.4+)
$numbers = [1, 2, 3, 4, 5];
$squares = array_map(fn($n) => $n * $n, $numbers);
echo "Squares: " . implode(", ", $squares) . "\\n";

// Example: Class with typed properties (PHP 7.4)
class User {
    private string $name;
    private int $age;

    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age = $age;
    }

    public function greet(): string {
        return "Hi, I'm {$this->name} and I'm {$this->age} years old";
    }
}

$user = new User("John", 28);
echo $user->greet() . "\\n";`,
};

export const phpPlaygroundConfig: PlaygroundConfig = {
  id: "php",
  name: "PHP 7.4 tools",
  icon: "fab fa-php",
  description: {
    es: "Ejecutar y probar código PHP 7.4",
    en: "Run and test PHP 7.4 code",
  },
  language: "php",
  keywords: ["PHP formatter", "PHP beautifier", "PHP syntax validator", "online PHP tool"],
  // A getter, so every read (Load example, a first visit) follows the UI language.
  get example() {
    return getLocalizedString(PHP_EXAMPLE);
  },
};
