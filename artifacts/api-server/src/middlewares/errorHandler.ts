import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  errors?: string[];
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err.message);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    message,
    errors: err.errors,
  });
}

export function createError(message: string, statusCode: number, errors?: string[]): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}
