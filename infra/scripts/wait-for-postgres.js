import { exec } from "node:child_process"; //módulo do node que permite rodar scripts no código

function verifyPostgressConection() {
  exec("docker exec postgress-dev pg_isready --host localhost", HandlerReturn); //script + callback //postgress-dev é o nome do container e deve ser mudado no arquivo yaml
  //-- host especifica que conexão verificada é TCP/IP não Socket Unix
  function HandlerReturn(error, stdout) {
    //stdout = standart output
    if (stdout.search("accepting connections") === -1) {
      //método .search para procurar string
      process.stdout.write("."); //escrevendo no console desse jeito não há quebra de linha
      verifyPostgressConection(); //ao invés de while ou for usamos recursividade
      return;
    }
    console.log("\n 🟢 Conexão aberta e pronta para receber conexões! \n");
  }
}
process.stdout.write("🔴 aguardando conexão com postgress...");
verifyPostgressConection();
