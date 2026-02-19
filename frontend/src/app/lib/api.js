// Se existir uma variável de ambiente definida, usa ela.
// Caso contrário (ambiente local), usa o localhost ou o seu IP de teste.
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
