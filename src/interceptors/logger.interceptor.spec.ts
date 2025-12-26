import { Test, TestingModule } from '@nestjs/testing';
import { LoggerInterceptor } from './logger.interceptor';
import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Request, Response } from 'express';
import Mocked = jest.Mocked;

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerInterceptor],
    }).compile();

    interceptor = module.get<LoggerInterceptor>(LoggerInterceptor);

    loggerLogSpy = jest.spyOn(interceptor['logger'], 'log');

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn(),
    };

    mockResponse = {
      statusCode: 200,
      get: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as Mocked<ExecutionContext>;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    } as unknown as Mocked<CallHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with HTTP logger', () => {
      expect(interceptor['logger']).toBeInstanceOf(Logger);
      expect(interceptor['logger']['context']).toBe('HTTP');
    });
  });

  describe('intercept', () => {
    it('should log successful request with all details', (done) => {
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/test'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('200'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('1234'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Mozilla/5.0'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('127.0.0.1'),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('ms'),
          );
          done();
        },
      });
    });

    it('should handle missing user-agent header', (done) => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringMatching(
              /GET \/api\/test 200 1234 - {2}127\.0\.0\.1 - \d+ms/,
            ),
          );
          done();
        },
      });
    });

    it('should handle missing content-length header', (done) => {
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue(undefined);

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('GET /api/test 200 undefined'),
          );
          done();
        },
      });
    });

    it('should log POST requests', (done) => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/api/users';
      (mockRequest.get as jest.Mock).mockReturnValue('PostmanRuntime/7.26.8');
      (mockResponse.get as jest.Mock).mockReturnValue('567');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('POST /api/users'),
          );
          done();
        },
      });
    });

    it('should log PUT requests', (done) => {
      mockRequest.method = 'PUT';
      mockRequest.originalUrl = '/api/users/123';
      (mockRequest.get as jest.Mock).mockReturnValue('curl/7.68.0');
      (mockResponse.get as jest.Mock).mockReturnValue('890');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('PUT /api/users/123'),
          );
          done();
        },
      });
    });

    it('should log DELETE requests', (done) => {
      mockRequest.method = 'DELETE';
      mockRequest.originalUrl = '/api/users/456';
      (mockRequest.get as jest.Mock).mockReturnValue('axios/0.21.1');
      (mockResponse.get as jest.Mock).mockReturnValue('0');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('DELETE /api/users/456'),
          );
          done();
        },
      });
    });

    it('should log 404 status codes', (done) => {
      mockResponse.statusCode = 404;
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('123');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('404'),
          );
          done();
        },
      });
    });

    it('should log 500 status codes', (done) => {
      mockResponse.statusCode = 500;
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('456');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('500'),
          );
          done();
        },
      });
    });

    it('should log 201 status codes', (done) => {
      mockResponse.statusCode = 201;
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('789');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('201'),
          );
          done();
        },
      });
    });

    it('should calculate and log response time', (done) => {
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const startTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValueOnce(startTime);

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      setTimeout(() => {
        jest.spyOn(Date, 'now').mockReturnValueOnce(startTime + 150);
      }, 0);

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringMatching(/\d+ms$/),
          );
          done();
        },
      });
    });

    it('should handle different IP addresses', (done) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (mockRequest as any).ip = '192.168.1.100';
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('192.168.1.100'),
          );
          done();
        },
      });
    });

    it('should handle IPv6 addresses', (done) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (mockRequest as any).ip = '::1';
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('::1'),
          );
          done();
        },
      });
    });

    it('should handle query parameters in URL', (done) => {
      mockRequest.originalUrl = '/api/users?page=1&limit=10';
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/users?page=1&limit=10'),
          );
          done();
        },
      });
    });

    it('should log even when handler throws error', (done) => {
      const error = new Error('Test error');
      mockCallHandler.handle.mockReturnValue(throwError(() => error));
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        error: (err) => {
          expect(err).toBe(error);
          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should call next.handle()', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCallHandler.handle).toHaveBeenCalledTimes(1);
    });

    it('should extract request and response from context', () => {
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(switchToHttpSpy).toHaveBeenCalled();
      const httpContext = mockExecutionContext.switchToHttp();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpContext.getRequest).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpContext.getResponse).toBeDefined();
    });

    it('should handle long URLs', (done) => {
      mockRequest.originalUrl =
        '/api/search?q=test&category=electronics&minPrice=100&maxPrice=1000&sort=relevance&page=5';
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining(mockRequest.originalUrl as string),
          );
          done();
        },
      });
    });

    it('should handle PATCH requests', (done) => {
      mockRequest.method = 'PATCH';
      mockRequest.originalUrl = '/api/users/789';
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('456');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('PATCH /api/users/789'),
          );
          done();
        },
      });
    });

    it('should format log message correctly', (done) => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/api/test';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (mockRequest as any).ip = '127.0.0.1';
      mockResponse.statusCode = 200;
      (mockRequest.get as jest.Mock).mockReturnValue('TestAgent/1.0');
      (mockResponse.get as jest.Mock).mockReturnValue('999');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const logCall = loggerLogSpy.mock.calls[0][0];
          expect(logCall).toMatch(
            /^GET \/api\/test 200 999 - TestAgent\/1\.0 127\.0\.0\.1 - \d+ms$/,
          );
          done();
        },
      });
    });

    it('should measure time elapsed accurately', (done) => {
      const startTime = 1000;
      const endTime = 1250;
      let callCount = 0;

      jest.spyOn(Date, 'now').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? startTime : endTime;
      });

      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('250ms'),
          );
          done();
        },
      });
    });

    it('should handle zero response time', (done) => {
      const fixedTime = 5000;
      jest.spyOn(Date, 'now').mockReturnValue(fixedTime);

      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        complete: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('0ms'),
          );
          done();
        },
      });
    });
  });

  describe('RxJS integration', () => {
    it('should return an Observable', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(result.subscribe).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should use tap operator to log without affecting stream', (done) => {
      const testData = { message: 'success' };
      mockCallHandler.handle.mockReturnValue(of(testData));
      (mockRequest.get as jest.Mock).mockReturnValue('Mozilla/5.0');
      (mockResponse.get as jest.Mock).mockReturnValue('1234');

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(testData);
          expect(loggerLogSpy).toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
