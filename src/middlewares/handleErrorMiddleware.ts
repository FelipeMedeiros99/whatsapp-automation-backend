import { Response, Request, NextFunction } from "express";

export function handleErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction){
  console.log(err);
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Erro interno do servidor";

  res.status(statusCode).json({
    message: message,
    error: err.error
  })
}