import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "infra/error.js";

function onError(error, request, response) {
  if (
    error instanceof InternalServerError ||
    error instanceof ValidationError ||
    error instanceof MethodNotAllowedError
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

const controller = {
  errorHandlers: {
    onError,
    onNoMatch,
  },
};

export default controller;
