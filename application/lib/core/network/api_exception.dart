import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic errors;

  ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  factory ApiException.fromDioError(DioException error) {
    String message = 'An unexpected error occurred';
    int? statusCode = error.response?.statusCode;
    dynamic errors;

    if (error.response?.data != null && error.response?.data is Map) {
      final data = error.response!.data as Map;
      if (data.containsKey('message') && data['message'] is String) {
        message = data['message'];
      }
      if (data.containsKey('errors')) {
        errors = data['errors'];
      }
    } else {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          message = 'Connection timed out. Please check your network and backend server.';
          break;
        case DioExceptionType.connectionError:
          message = 'Cannot connect to backend server. Make sure server is running and accessible.';
          break;
        case DioExceptionType.badResponse:
          message = 'Server returned error ($statusCode)';
          break;
        case DioExceptionType.cancel:
          message = 'Request was cancelled';
          break;
        default:
          message = error.message ?? 'Network error occurred';
      }
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      errors: errors,
    );
  }

  @override
  String toString() => message;
}
