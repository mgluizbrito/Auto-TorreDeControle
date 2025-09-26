const config = {
  preset: 'ts-jest/presets/default-esm', // Use o preset ESM do ts-jest
  testEnvironment: 'node',
  testMatch: ["<rootDir>/tests/**/*.test.ts"], // Garante que o Jest procure pelos testes
  moduleNameMapper: {
    // Pode ser necessário para lidar com alguns módulos
  },
  // O transform é necessário para que o ts-jest funcione no modo ESM
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
};

export default config;