class BaseError extends Error {
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause, statusCode } = {}) {
    super("Um erro interno não esperado aconteceu.", { cause });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o Suporte.";
    this.statusCode = statusCode || 500;
  }
}

export class ServiceError extends BaseError {
  constructor({ cause, message } = {}) {
    super(message || "Serviço indisponível no momento.", { cause });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível.";
    this.statusCode = 503;
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super("Método não permitido para este endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Verifique se o método HTTP enviado é válido para esse endpoint";
    this.statusCode = 405;
  }
}

export class ValidationError extends BaseError {
  constructor({ cause, message, action, status_code } = {}) {
    super(message || "Um erro de validação ocorreu.", { cause });
    this.name = "ValidationError";
    this.action = action || "Ajuste os dados enviados e tente novamente.";
    this.statusCode = status_code || 400;
  }
}

export class NotFoundError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Não foi possivel encontrar este recurso no sistema.", { cause });
    this.name = "NotFoundError";
    this.action = action || "Verifique se os parametros enviados na consulta estão certos.";
    this.statusCode = 404;
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Usuário não autenticado.", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Faça novamente o login para continuar.";
    this.statusCode = 401;
  }
}

export class ForbiddenError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Usuário não pode executar esta operação.", { cause });
    this.name = "ForbiddenError";
    this.action = action || "Verifique se você possui permissão para executar esta ação.";
    this.statusCode = 403;
  }
}

export class BusinessRuleError extends BaseError {
  constructor({ cause, message, action, statusCode } = {}) {
    super(message || "Esta operação não pôde ser concluída.", { cause });
    this.name = "BusinessRuleError";
    this.action = action || "Revise os dados e tente novamente.";
    this.statusCode = statusCode || 422;
  }
}