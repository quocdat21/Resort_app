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
import 'package:resort_app/features/auth/pages/verify_page.dart';
import 'package:resort_app/core/constants/dev_credentials.dart';
import 'package:resort_app/core/localization/app_strings.dart';

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
        _emailError = AppStrings.get(context, 'login_error_email_empty');
        isValid = false;
      } else if (!_emailRegex.hasMatch(email) && !_phoneRegex.hasMatch(email)) {
        _emailError = AppStrings.get(context, 'login_error_email_invalid');
        isValid = false;
      } else {
        _emailError = null;
      }

      final password = _passwordController.text;
      if (password.isEmpty) {
        _passwordError = AppStrings.get(context, 'login_error_password_empty');
        isValid = false;
      } else if (password.length < 8) {
        _passwordError = AppStrings.get(context, 'login_error_password_short');
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
        if (result['unverified'] == true) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              backgroundColor: AppColors.background,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
          title: Text(AppStrings.get(context, 'verify_account_title'),
              style: AppTextStyles.h3),
          content: Text(
            AppStrings.get(context, 'verify_account_msg'),
            style: AppTextStyles.bodyMedium,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(AppStrings.get(context, 'cancel'),
                  style: AppTextStyles.labelSmall
                      .copyWith(color: AppColors.secondary)),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => VerifyEmailPage(
                      email: _emailController.text.trim(),
                      autoSendOtp: true,
                    ),
                  ),
                );
              },
              child: Text(AppStrings.get(context, 'verify_now'),
                  style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold)),
            ),
          ],
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ??
                  AppStrings.get(context, 'login_failed')),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      print("LOGIN ERROR: $e");
      if (!mounted) return;
      setState(() => _isGlobalLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppStrings.get(context, 'cannot_connect_server')),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();

    // Tự động điền tài khoản nếu được bật trong dev_credentials.dart
    if (DevCredentials.useDevCredentials) {
      _emailController.text = DevCredentials.email;
      _passwordController.text = DevCredentials.password;
      _showPasswordIcon = DevCredentials.password.isNotEmpty;
    }

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
                    const SizedBox(height: 10),
                    Text(AppStrings.get(context, 'welcome_back'),
                        style: AppTextStyles.h2),
                    Text(
                      AppStrings.get(context, 'login_subtitle'),
                      style: AppTextStyles.bodyMedium,
                    ),
                    const SizedBox(height: 32),
                    AppLabel(text: AppStrings.get(context, 'phone_email_label')),
                    TextField(
                      controller: _emailController,
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.onSurface),
                      decoration: _inputStyle(AppStrings.get(context, 'email_hint'),
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
                        AppStrings.get(context, 'password_hint'),
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
              Text(AppStrings.get(context, 'onboarding1_desc'),
                  style: AppTextStyles.h1
                      .copyWith(color: Colors.white, fontSize: 32))
            ]))
      ]);
  Widget _buildLogo() => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset(
            'assets/icons/icon_resort_login.png',
            height: 60,
            fit: BoxFit.contain,
          ),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "THAO NGUYEN",
                style: AppTextStyles.h2.copyWith(
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF1A8A3D),
                  height: 1.0,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    "HOTEL & RESORT",
                    style: AppTextStyles.labelSmall.copyWith(
                      color: const Color(0xFF1A8A3D),
                      fontWeight: FontWeight.w600,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(
                      4,
                      (index) => const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 1.0),
                        child: Icon(
                          Icons.star,
                          color: Color(0xFF1A8A3D),
                          size: 10,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      );

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
          child: Text(AppStrings.get(context, 'login'),
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
                AppStrings.get(context, 'login_with_google'),
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
            child: Text("HOẶC", style: AppTextStyles.labelSmall)),
        Expanded(
            child: Divider(color: AppColors.outlineVariant.withOpacity(0.3)))
      ]);
  Widget _buildRegisterLink() => Center(
        child: RichText(
          text: TextSpan(
            style: AppTextStyles.bodyMedium,
            children: [
              TextSpan(text: AppStrings.get(context, 'no_account')),
              TextSpan(
                text: AppStrings.get(context, 'register'),
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
          AppLabel(text: AppStrings.get(context, 'password_label')),
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
                AppStrings.get(context, 'forgot_password'),
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
