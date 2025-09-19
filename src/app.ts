console.log("Olá, Node.js com TypeScript!");

function somar(a: number, b: number): number {
  return a + b;
}

const resultado = somar(5, 3);
console.log(`O resultado da soma é: ${resultado}`);