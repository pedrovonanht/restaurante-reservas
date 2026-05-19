const nextJest = require("next/jest"); //importa usando Common JS (jeito antigo)

const createJestConfig = nextJest(); //usa uma função factory que retorna uma outra função
const JestConfig = createJestConfig({
  //passa para essa função um objeto que será passado para o jest com as configurações necessárias para absolut import
  moduleDirectories: ["node_modules", "<rootDir>"],
});

module.exports = JestConfig; //exporta esse objeto com as configurações para o JEST ler
