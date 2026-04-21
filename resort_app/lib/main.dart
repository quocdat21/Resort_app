import 'package:flutter/material.dart';
// Lưu ý: Thay đổi đường dẫn import bên dưới cho đúng với tên project của bạn
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/features/auth/pages/login_page.dart';
import 'package:resort_app/features/auth/pages/verify_page.dart';

void main() {
  // Đảm bảo các dịch vụ của Flutter đã được khởi tạo
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Thao Nguyen Resort',

      // Tắt cái biểu tượng "Debug" ở góc phải màn hình cho đẹp
      debugShowCheckedModeBanner: false,

      // Cấu hình Theme (Giao diện tổng thể)
      theme: ThemeData(
        useMaterial3: true,

        // 1. Thiết lập Font chữ mặc định cho toàn bộ ứng dụng
        fontFamily: 'BeVietnamPro',

        // 2. Thiết lập bảng màu dựa trên mã màu Primary bạn đã chọn
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: AppColors.surface,
          //background: AppColors.background,
        ),

        // 3. Cấu hình mặc định cho các thành phần khác (tùy chọn)
        scaffoldBackgroundColor: AppColors.background,
      ),

      // 4. Trang sẽ hiển thị đầu tiên khi mở App
      home: const LoginScreen(),
    );
  }
}
