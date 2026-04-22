import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/loading.dart';
import 'package:resort_app/core/widgets/app_label.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/auth/pages/forgot_password_page.dart';
import 'package:resort_app/features/auth/pages/register_page.dart';
import 'package:resort_app/features/home/pages/home_page.dart';

// --- MÀN HÌNH ĐĂNG NHẬP ---
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  bool _isObscure = true;
  bool _showPasswordIcon = false;
  bool _isGlobalLoading = false;

  // Validation errors
  String? _emailError;
  String? _passwordError;

  final RegExp _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  final RegExp _phoneRegex = RegExp(r'^(0|\+84)[0-9]{9}$');

  bool _validate() {
    bool isValid = true;
    setState(() {
      final email = _emailController.text.trim();
      if (email.isEmpty) {
        _emailError = 'Vui lòng nhập email hoặc số điện thoại.';
        isValid = false;
      } else if (!_emailRegex.hasMatch(email) && !_phoneRegex.hasMatch(email)) {
        _emailError = 'Email hoặc số điện thoại không đúng định dạng.';
        isValid = false;
      } else {
        _emailError = null;
      }

      final password = _passwordController.text;
      if (password.isEmpty) {
        _passwordError = 'Vui lòng nhập mật khẩu.';
        isValid = false;
      } else if (password.length < 8) {
        _passwordError = 'Mật khẩu phải có ít nhất 8 ký tự.';
        isValid = false;
      } else {
        _passwordError = null;
      }
    });
    return isValid;
  }

  Future<void> _handleLogin() async {
    if (!_validate()) return;

    setState(() => _isGlobalLoading = true);

    try {
      final result = await ApiService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (!mounted) return;
      setState(() => _isGlobalLoading = false);

      if (result['success'] == true) {
        final userData = result['data']['user'];
        final token = result['data']['token'];

        // Lưu session
        await ApiService.saveSession(token: token, user: userData);

        if (!mounted) return;
        // Chuyển đến Home
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (context) => HomeScreen(
              userName: userData['full_name'] ?? 'Traveler',
            ),
          ),
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Đăng nhập thất bại.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      print("LOGIN ERROR: $e");
      if (!mounted) return;
      setState(() => _isGlobalLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không thể kết nối đến server. Vui lòng thử lại.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(() {
      setState(() {
        _showPasswordIcon = _passwordController.text.isNotEmpty;
      });
    });
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  // Logic 3 giây khi ấn nút Google
  Future<void> _handleGoogleLogin() async {
    setState(() => _isGlobalLoading = true);
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      setState(() => _isGlobalLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          _buildBackgroundDecor(),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: _buildLoginCard(context),
            ),
          ),
          _buildFooter(),
          if (_isGlobalLoading) const Loading(),
        ],
      ),
    );
  }

  // --- CÁC HÀM XÂY DỰNG GIAO DIỆN ---

  Widget _buildLoginCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 30),
      constraints: const BoxConstraints(maxWidth: 1000),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(50),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 40,
            offset: const Offset(0, 20),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(50),
        child: Row(
          children: [
            if (MediaQuery.of(context).size.width > 850)
              Expanded(child: _buildLeftImageSection()),
            Expanded(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 48, vertical: 40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLogo(),
                    const SizedBox(height: 48),
                    const Text("Welcome Back", style: AppTextStyles.h2),
                    const Text(
                      "Enter your credentials to access your sanctuary.",
                      style: AppTextStyles.bodyMedium,
                    ),
                    const SizedBox(height: 32),
                    const AppLabel(text: "PHONE NUMBER OR EMAIL"),
                    TextField(
                      controller: _emailController,
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.onSurface),
                      decoration: _inputStyle("e.g., Example@email.com",
                          suffixIcon: const Icon(Icons.person, size: 20),
                          errorText: _emailError),
                      onChanged: (_) {
                        if (_emailError != null) {
                          setState(() => _emailError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 24),
                    _buildPasswordLabel(),
                    TextField(
                      controller: _passwordController,
                      obscureText: _isObscure,
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.onSurface),
                      decoration: _inputStyle(
                        "Enter password",
                        suffixIcon: _showPasswordIcon
                            ? IconButton(
                                icon: Icon(
                                    _isObscure
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                    size: 20),
                                onPressed: () =>
                                    setState(() => _isObscure = !_isObscure),
                              )
                            : null,
                        errorText: _passwordError,
                      ),
                      onChanged: (_) {
                        if (_passwordError != null) {
                          setState(() => _passwordError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 32),
                    _buildLoginButton(),
                    const SizedBox(height: 24),
                    _buildDivider(),
                    const SizedBox(height: 24),
                    _buildGoogleButton(),
                    const SizedBox(height: 48),
                    _buildRegisterLink(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- CÁC WIDGET PHỤ (GIỮ NGUYÊN) ---

  Widget _buildBackgroundDecor() => Stack(children: [
        Positioned(
            top: -100,
            right: -100,
            child: _buildBlurCircle(AppColors.primary.withOpacity(0.05), 400)),
        Positioned(
            bottom: -100,
            left: -100,
            child: _buildBlurCircle(AppColors.secondary.withOpacity(0.05), 350))
      ]);
  Widget _buildLeftImageSection() => Stack(children: [
        Image.asset('assets/icons/logo_login.png',
            height: 800, width: double.infinity, fit: BoxFit.cover),
        Container(
            height: 800,
            decoration: BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                  Colors.transparent,
                  AppColors.primary.withOpacity(0.4)
                ]))),
        Positioned(
            bottom: 48,
            left: 48,
            right: 48,
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text("Moc Chau Highland",
                  style: AppTextStyles.bodyLarge
                      .copyWith(color: Colors.white70, letterSpacing: 2)),
              const SizedBox(height: 16),
              Text("Experience the mist-veiled sanctuary.",
                  style: AppTextStyles.h1
                      .copyWith(color: Colors.white, fontSize: 32))
            ]))
      ]);
  Widget _buildLogo() =>
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Image.asset('assets/icons/logo_login.png'),
        const SizedBox(width: 12),
        Text("THAO NGUYEN",
            style: AppTextStyles.h2.copyWith(
                fontWeight: FontWeight.w900, color: AppColors.primary))
      ]);
  Widget _buildLoginButton() => SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
          style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.onPrimary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              elevation: 10,
              shadowColor: AppColors.primary.withOpacity(0.2)),
          onPressed: _handleLogin,
          child: Text("Login",
              style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.bold, color: Colors.white))));
  Widget _buildGoogleButton() => SizedBox(
        width: double.infinity,
        height: 56,
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
              side:
                  BorderSide(color: AppColors.outlineVariant.withOpacity(0.3)),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16))),
          onPressed: _handleGoogleLogin,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/icons/logo_login_google.png',
                height: 20,
                errorBuilder: (context, error, stackTrace) =>
                    const Icon(Icons.account_circle, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                "Login with Google",
                style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600, color: AppColors.onSurface),
              )
            ],
          ),
        ),
      );
  Widget _buildDivider() => Row(children: [
        Expanded(
            child: Divider(color: AppColors.outlineVariant.withOpacity(0.3))),
        const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text("OR CONTINUE WITH", style: AppTextStyles.labelSmall)),
        Expanded(
            child: Divider(color: AppColors.outlineVariant.withOpacity(0.3)))
      ]);
  Widget _buildRegisterLink() => Center(
        child: RichText(
          text: TextSpan(
            style: AppTextStyles.bodyMedium,
            children: [
              const TextSpan(text: "Don't have an account? "),
              TextSpan(
                text: "Register",
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  decoration: TextDecoration.underline,
                ),
                recognizer: TapGestureRecognizer()
                  ..onTap = () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const RegisterPage(),
                      ),
                    );
                  },
              ),
            ],
          ),
        ),
      );

  InputDecoration _inputStyle(String hint,
          {Widget? suffixIcon, String? errorText}) =>
      InputDecoration(
        hintText: hint,
        hintStyle:
            AppTextStyles.bodyMedium.copyWith(color: AppColors.outlineVariant),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: AppColors.surfaceContainerHigh,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: errorText != null
                ? const BorderSide(color: AppColors.error, width: 1.0)
                : BorderSide.none),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
                color: errorText != null ? AppColors.error : AppColors.primary,
                width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(
          vertical: 18,
          horizontal: 16,
        ),
        errorText: errorText,
        errorStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.error,
          fontSize: 12,
        ),
      );
  Widget _buildPasswordLabel() => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const AppLabel(text: "PASSWORD"),
          TextButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ForgotPasswordPage(),
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                "Forgot password?",
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.secondary,
                  letterSpacing: 0,
                ),
              ),
            ),
          ),
        ],
      );
  Widget _buildBlurCircle(Color color, double size) => Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color));
  Widget _buildFooter() => const Align(
        alignment: Alignment.bottomCenter,
        child: Padding(
          padding: EdgeInsets.only(bottom: 26),
          child: Opacity(
            opacity: 0.6,
            child: Text(
              "© THAO NGUYEN RESORT · MOC CHAU, VIETNAM",
              style: AppTextStyles.labelSmall,
            ),
          ),
        ),
      );
}
