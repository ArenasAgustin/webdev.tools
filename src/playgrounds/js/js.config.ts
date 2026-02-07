import type { PlaygroundConfig } from "@/types/playground";

export const jsPlaygroundConfig: PlaygroundConfig = {
  id: "js",
  name: "JavaScript tools",
  icon: "fab fa-js",
  description: "Ejecutar y probar código JavaScript",
  language: "javascript",
  example: `// Ejemplo: Función para calcular factorial
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
    return \`Hola, soy \${this.nombre} y tengo \${this.edad} anos\`;
  }
};

console.log(usuario.saludar());`,
};
