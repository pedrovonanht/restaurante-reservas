import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/error.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados enviados.",
        cause: error,
      });
    }

    throw error;
  }

  async function findUserByEmail(email) {
    try {
      return await user.findOneByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundError) {
        // Compara com um hash inválido para equalizar o tempo de resposta
        // entre "email inexistente" e "senha incorreta" (mitiga user enumeration).
        await password.compare(
          providedPassword,
          "$2b$12$tByT8ppap7rkF7E0Nti18urMRd1BuyDVMjHBTbksHjMrTl6vUdAJK",
        );
      }
      throw error;
    }
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se a senha está correta.",
      });
    }
  }
}

const authentication = { getAuthenticatedUser };
export default authentication;
