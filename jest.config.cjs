const dotenv = require("dotenv"); //
dotenv.config({
  path: ".env.development",
});
const nextJest = require("next/jest"); //importa usando Common JS (jeito antigo)

const createJestConfig = nextJest(); //usa uma função factory que retorna uma outra função

const customConfig = {
  //gera as configs
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
};

module.exports = async () => {
  const config = await createJestConfig(customConfig)();

  config.transformIgnorePatterns = ["/node_modules/(?!node-pg-migrate|glob)/"]; //lida com pacotes ESM problemáticos para o JEST
  return config;
};
