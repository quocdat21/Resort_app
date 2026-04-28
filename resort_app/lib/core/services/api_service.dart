import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Đổi thành IP máy bạn nếu chạy trên thiết bị thật
  // Android emulator: 10.0.2.2
  // iOS simulator / thiết bị thật cùng wifi: dùng IP máy (vd: 192.168.1.x)
  static const String baseUrl = 'http://192.168.0.23:3000/api';
  static const String serverUrl = 'http://192.168.0.23:3000';

  // ==================== HOME ====================

  /// GET /api/home - aggregated data for home screen
  static Future<Map<String, dynamic>> fetchHomeData() async {
    final response = await http.get(
      Uri.parse('$baseUrl/home'),
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }
  // ==================== AUTH ====================

  /// POST /api/auth/login
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  /// POST /api/auth/register
  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'full_name': fullName,
        'email': email,
        'password': password,
        if (phoneNumber != null && phoneNumber.isNotEmpty)
          'phone_number': phoneNumber,
      }),
    );
    return jsonDecode(response.body);
  }

  /// POST /api/auth/verify-otp
  static Future<Map<String, dynamic>> verifyOTP({
    required String email,
    required String otp,
    String type = 'register',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'otp': otp, 'type': type}),
    );
    return jsonDecode(response.body);
  }

  /// POST /api/auth/resend-otp
  static Future<Map<String, dynamic>> resendOTP({
    required String email,
    String type = 'register',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/resend-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'type': type}),
    );
    return jsonDecode(response.body);
  }

  /// POST /api/auth/forgot-password
  static Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    return jsonDecode(response.body);
  }

  /// POST /api/auth/reset-password
  static Future<Map<String, dynamic>> resetPassword({
    required String resetToken,
    required String newPassword,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/reset-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'reset_token': resetToken,
        'new_password': newPassword,
      }),
    );
    return jsonDecode(response.body);
  }

  // ==================== PROFILE ====================

  /// GET /api/auth/me
  static Future<Map<String, dynamic>> fetchMe() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    return jsonDecode(response.body);
  }

  /// PUT /api/auth/me
  static Future<Map<String, dynamic>> updateProfile({
    required Map<String, String> data,
    String? avatarPath,
  }) async {
    final token = await getToken();
    final uri = Uri.parse('$baseUrl/auth/me');

    if (avatarPath != null) {
      final request = http.MultipartRequest('PUT', uri);
      request.headers['Authorization'] = 'Bearer $token';

      // Thêm các fields khác
      request.fields.addAll(data);

      // Thêm file
      request.files
          .add(await http.MultipartFile.fromPath('avatar', avatarPath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return jsonDecode(response.body);
    } else {
      final response = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );
      return jsonDecode(response.body);
    }
  }

  // ==================== TOKEN / USER STORAGE ====================

  /// Lưu token + thông tin user sau khi login thành công
  static Future<void> saveSession({
    required String token,
    required Map<String, dynamic> user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('user_data', jsonEncode(user));
  }

  /// Lấy token đã lưu
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  /// Lấy thông tin user đã lưu
  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  /// Xoá session (logout)
  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }
}
