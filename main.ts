export function greet(name: string): string {
  console.log(`Hello, ${name}!`);
}

if (import.meta.main) greet("world");
