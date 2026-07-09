import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/error.js";

import { stringifySetCookie } from "cookie";
import session from "models/session"

function onError(error, request, response) {
  if (
    error instanceof InternalServerError ||
    error instanceof ValidationError ||
    error instanceof MethodNotAllowedError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
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

const controller = {
  errorHandlers: {
    onError,
    onNoMatch,
  },
  setCookiesHeader,
  clearCookiesHeader,
};

export default controller;
