/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/jest.setup.js"],
    extensionsToTreatAsEsm: [".ts"],
    modulePathIgnorePatterns: [
        "<rootDir>/src/infrastructure/layers/shared-libs-layer/nodejs/",
    ],
    moduleNameMapper: {
        "^(\\.\\.?/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};
