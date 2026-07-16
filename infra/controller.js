import {
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/error.js";

import { stringifySetCookie } from "cookie";
import session from "models/session";
import user from "models/user"
import authorization from "models/authorization";

function onError(error, request, response) {
  if (
    error instanceof InternalServerError ||
    error instanceof ValidationError ||
    error instanceof MethodNotAllowedError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({ cause: error });
  console.error(publicErrorObject);
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatch(request, response) {
  const error = new MethodNotAllowedError();
  return response.status(error.statusCode).json(error);
}

function setCookiesHeader(response, token) {
  response.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: "session_id",
      value: token,
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
      path: "/",
      httpOnly: true,
    }),
  );
}

function clearCookiesHeader(response) {
  response.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: "session_id",
      value: "invalid",
      maxAge: -1,
      path: "/",
      httpOnly: true,
    }),
  );
}

async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    const sessionObject = await session.findOneValidByToken(
      request.cookies.session_id,
    );
    const userObject = await user.findOneById(sessionObject.user_id);

    request.context = {
      ...request.context,
      user: userObject,
      session: sessionObject,
    };
    return next();
  }

  request.context = {
    ...request.context,
    user: null,
  };
  return next();
}

function canUserRequest(feature) {
  return function (request, response, next) {
    const requestingUser = request.context?.user;

    if (!requestingUser) {
      throw new UnauthorizedError({
        message: "Sessão inválida.",
        action: "Verifique se o usuário está logado.",
      });
    }

    if (feature && !authorization.getUserFeatures(requestingUser).includes(feature)) {
      throw new ForbiddenError({
        message: "Usuário não pode executar esta operação.",
        action: `Verifique se este usuário possui a feature "${feature}".`,
      });
    }

    return next();
  };
}


const controller = {
  errorHandlers: {
    onError,
    onNoMatch,
  },
  setCookiesHeader,
  clearCookiesHeader,
  injectAnonymousOrUser,
  canUserRequest
};



export default controller;
