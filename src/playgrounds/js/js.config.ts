import { getLocalizedString, type PlaygroundConfig } from "@/types/playground";

/**
 * File names, mime type and import filter shared by the JS engine and its actions hook.
 * TypeScript files are not accepted: the runner executes plain JavaScript only.
 */
export const jsFileSettings = {
  inputFileName: "script.js",
  outputFileName: "output.js",
  mimeType: "text/javascript",
  acceptExtensions: ".js,.mjs",
} as const;

/**
 * The built-in example, per UI language. Its last block only holds what Clean
 * empty removes: unused declarations of empty values and an empty function.
 */
const JS_EXAMPLE = {
  es: `// Ejemplo: Función para calcular factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial de 5:", factorial(5));

// Ejemplo: Manipular arrays
const numeros = [1, 2, 3, 4, 5];
const cuadrados = numeros.map(n => n * n);
console.log("Cuadrados:", cuadrados);

// Ejemplo: Objeto y métodos
const usuario = {
  nombre: "Juan",
  edad: 28,
  saludar() {
    return \`Hola, soy \${this.nombre} y tengo \${this.edad} años\`;
  }
};

console.log(usuario.saludar());

// Ejemplo: "Limpiar vacíos" quita estas declaraciones vacías que nadie usa
const textoVacio = "";
const listaVacia = [];
const objetoVacio = {};
function funcionVacia() {}`,
  en: `// Example: Function to calculate a factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// Example: Working with arrays
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
console.log("Squares:", squares);

// Example: Object and methods
const user = {
  name: "John",
  age: 28,
  greet() {
    return \`Hi, I'm \${this.name} and I'm \${this.age} years old\`;
  }
};

console.log(user.greet());

// Example: "Clean empty" removes these unused empty declarations
const emptyText = "";
const emptyList = [];
const emptyObject = {};
function emptyFunction() {}`,
};

export const jsPlaygroundConfig: PlaygroundConfig = {
  id: "js",
  name: "JavaScript tools",
  icon: "fab fa-js",
  description: {
    es: "Ejecutar y probar código JavaScript",
    en: "Run and test JavaScript code",
  },
  language: "javascript",
  keywords: ["JavaScript formatter", "JS beautifier", "JavaScript minifier", "online JS tool"],
  // A getter, so every read (Load example, a first visit) follows the UI language.
  get example() {
    return getLocalizedString(JS_EXAMPLE);
  },
};
