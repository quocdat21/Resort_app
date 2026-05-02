import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Đổi thành IP máy bạn nếu chạy trên thiết bị thật
  // Android emulator: 10.0.2.2
  // iOS simulator / thiết bị thật cùng wifi: dùng IP máy (vd: 192.168.1.x)
  // static const String baseUrl = 'http://192.168.0.23:3000/api';
  // static const String serverUrl = 'http://192.168.0.23:3000';
  static const String baseUrl =
      'https://bootleg-uncooked-broiling.ngrok-free.dev/api';
  static const String serverUrl =
      'https://bootleg-uncooked-broiling.ngrok-free.dev';

  /// Replaces localhost URLs from the API with the actual device-accessible server URL
  static String fixImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) {
      return url.replaceAll('http://localhost:3000', serverUrl);
    }
    // Handle relative paths if any
    return '$serverUrl${url.startsWith('/') ? '' : '/'}$url';
  }

  // ==================== HOME ====================

  /// GET /api/home - aggregated data for home screen
  static Future<Map<String, dynamic>> fetchHomeData() async {
    final response = await http.get(
      Uri.parse('$baseUrl/home'),
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  // ==================== ROOMS ====================

  /// GET /api/rooms/search - search rooms with advanced filters
  static Future<Map<String, dynamic>> searchRooms({
    int? adults,
    int? children,
    int? minPrice,
    int? maxPrice,
    String? categoryId,
    String? zoneId,
    String? searchTerm,
    String? checkIn,
    String? checkOut,
    int page = 1,
    int limit = 20,
    String sortBy = 'base_price',
    String sortOrder = 'ASC',
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
      'sortBy': sortBy,
      'sortOrder': sortOrder,
    };
    if (adults != null) queryParams['adults'] = adults.toString();
    if (children != null) queryParams['children'] = children.toString();
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (categoryId != null) queryParams['categoryId'] = categoryId;
    if (zoneId != null) queryParams['zoneId'] = zoneId;
    if (searchTerm != null) queryParams['searchTerm'] = searchTerm;
    if (checkIn != null) queryParams['checkIn'] = checkIn;
    if (checkOut != null) queryParams['checkOut'] = checkOut;

    final uri = Uri.parse('$baseUrl/rooms/search')
        .replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  /// GET /api/rooms/:id/detail - full room detail with images, amenities, reviews
  static Future<Map<String, dynamic>> getRoomDetail(int roomId,
      {String? checkIn, String? checkOut}) async {
    final queryParams = <String, String>{};
    if (checkIn != null) queryParams['checkIn'] = checkIn;
    if (checkOut != null) queryParams['checkOut'] = checkOut;

    final uri = Uri.parse('$baseUrl/rooms/$roomId/detail')
        .replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  /// GET /api/rooms - basic room listing (admin-style)
  static Future<Map<String, dynamic>> fetchRooms({
    int page = 1,
    int limit = 20,
    String? categoryId,
    String? zoneId,
    String? searchTerm,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (categoryId != null) queryParams['categoryId'] = categoryId;
    if (zoneId != null) queryParams['zoneId'] = zoneId;
    if (searchTerm != null) queryParams['searchTerm'] = searchTerm;

    final uri =
        Uri.parse('$baseUrl/rooms').replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  /// GET /api/services - get services (can exclude 'Hall' etc.)
  static Future<Map<String, dynamic>> fetchServices({
    int page = 1,
    int limit = 50,
    String? type,
    String? excludeType,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (type != null) queryParams['type'] = type;
    if (excludeType != null) queryParams['excludeType'] = excludeType;

    final uri =
        Uri.parse('$baseUrl/services').replace(queryParameters: queryParams);
    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  /// GET /api/rooms/filter-meta - get zones, categories, max price
  static Future<Map<String, dynamic>> getFilterMeta() async {
    final response = await http.get(
      Uri.parse('$baseUrl/rooms/filter-meta'),
      headers: {'Content-Type': 'application/json'},
    );
    return jsonDecode(response.body);
  }

  /// POST /api/vouchers/validate - validate promo code
  static Future<Map<String, dynamic>> validateVoucher({
    required String code,
    required double orderValue,
    int? userId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/vouchers/validate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'code': code,
        'orderValue': orderValue,
        if (userId != null) 'userId': userId,
      }),
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

  // ==================== GENERIC METHODS ====================

  static Future<Map<String, dynamic>> post(
      String endpoint, Map<String, dynamic> body) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body, toEncodable: (item) {
        if (item is DateTime) return item.toIso8601String();
        return item;
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> get(String endpoint) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    return jsonDecode(response.body);
  }
}
