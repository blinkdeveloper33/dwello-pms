import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    
    // Add correlation ID to request for downstream use
    request.correlationId = correlationId;
    
    const now = Date.now();
    const timestamp = new Date().toISOString();

    console.log(JSON.stringify({
      timestamp,
      correlationId,
      level: 'info',
      method,
      url,
      message: `Incoming ${method} ${url}`,
      metadata: {
        orgId: body?.orgId || request.query?.orgId || request.params?.orgId,
      },
    }));

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            correlationId,
            level: 'info',
            method,
            url,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration: `${duration}ms`,
            message: `Completed ${method} ${url}`,
          }));
        },
        error: (error) => {
          const duration = Date.now() - now;
          console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            correlationId,
            level: 'error',
            method,
            url,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            message: error.message || 'Request failed',
            error: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }));
        },
      })
    );
  }
}

