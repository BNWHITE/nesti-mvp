import 'package:dio/dio.dart';

class ApiService {
  late final Dio _dio;
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:4000/api/v1',
  );

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
    ));

    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (error, handler) async {
          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            // Token refresh logic would go here
          }
          handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.delete(path, queryParameters: queryParameters);
  }
}
