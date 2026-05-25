import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> | Promise<Observable<SuccessResponse<T>>> {
    return next.handle().pipe(
      map((responseData) => {
        const isObject =
          responseData !== null &&
          typeof responseData === 'object' &&
          !Array.isArray(responseData);
        const data = isObject ? (responseData as Record<string, unknown>) : {};

        return {
          success: true as const,
          data: (data['data'] ?? responseData) as T,
          meta: (data['metadata'] ?? data['meta']) as Record<string, unknown>,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
