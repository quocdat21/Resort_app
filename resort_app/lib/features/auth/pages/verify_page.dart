import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/core/widgets/loading.dart';
import 'package:resort_app/features/auth/pages/reset_password_page.dart';
import 'package:resort_app/features/home/pages/home_page.dart';

class VerifyEmailPage extends StatefulWidget {
  final String email;
  final String type; // 'register' or 'reset_password'
  final bool autoSendOtp;

  const VerifyEmailPage({
    super.key,
    required this.email,
    this.type = 'register',
    this.autoSendOtp = false,
  });

  @override
  State<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends State<VerifyEmailPage> {
  final List<TextEditingController> _otpControllers =
      List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (index) => FocusNode());

  bool _isLoading = false;
  bool _canResend = false;
  int _resendCountdown = 60;

  @override
  void initState() {
    super.initState();
    if (widget.autoSendOtp) {
      _canResend = true; // allow resend to pass the initial check
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _handleResend();
      });
    } else {
      _startResendTimer();
    }
  }

  void _startResendTimer() {
    setState(() {
      _canResend = false;
      _resendCountdown = 60;
    });
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _resendCountdown--);
      if (_resendCountdown <= 0) {
        setState(() => _canResend = true);
        return false;
      }
      return true;
    });
  }

  @override
  void dispose() {
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onOtpChanged(String value, int index) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    setState(() {});
  }

  String get _otpCode =>
      _otpControllers.map((c) => c.text).join();

  String get _maskedEmail {
    final parts = widget.email.split('@');
    if (parts.length != 2) return widget.email;
    final name = parts[0];
    final masked = name.length > 3
        ? '${name.substring(0, 3)}***'
        : '${name[0]}***';
    return '$masked@${parts[1]}';
  }

  Future<void> _handleVerify() async {
    final otp = _otpCode;
    if (otp.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập đủ 6 số OTP.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.verifyOTP(
        email: widget.email,
        otp: otp,
        type: widget.type,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (result['success'] == true) {
        if (widget.type == 'register') {
          // Đăng ký thành công → lưu session → vào Home
          final userData = result['data']['user'];
          final token = result['data']['token'];
          await ApiService.saveSession(token: token, user: userData);

          if (!mounted) return;
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) => HomeScreen(
                userName: userData['full_name'] ?? 'Traveler',
              ),
            ),
            (route) => false,
          );
        } else if (widget.type == 'reset_password') {
          // Forgot password → chuyển đến ResetPasswordPage
          final resetToken = result['data']['reset_token'];
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => ResetPasswordPage(
                resetToken: resetToken,
              ),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Xác thực thất bại.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không thể kết nối đến server.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _handleResend() async {
    if (!_canResend) return;

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.resendOTP(
        email: widget.email,
        type: widget.type,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'OTP đã được gửi lại.'),
          backgroundColor:
              result['success'] == true ? AppColors.primary : AppColors.error,
        ),
      );

      if (result['success'] == true) {
        _startResendTimer();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text(
          "VERIFY YOUR EMAIL",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.onBackground,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    "Verify Your\nEmail",
                    textAlign: TextAlign.center,
                    style: AppTextStyles.h1.copyWith(
                      fontSize: 40,
                      height: 1.1,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.onSurfaceVariant,
                        height: 1.5,
                      ),
                      children: [
                        const TextSpan(
                            text:
                                "Enter the 6-digit code sent to your email\n"),
                        TextSpan(
                          text: _maskedEmail,
                          style: AppTextStyles.bodyLarge.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children:
                        List.generate(6, (index) => _buildOtpBox(index)),
                  ),
                  const SizedBox(height: 48),

                  // Resend timer / button
                  if (!_canResend)
                    Text(
                      "RESEND CODE IN ${_resendCountdown}S",
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.onBackground,
                      ),
                    ),
                  if (_canResend)
                    GestureDetector(
                      onTap: _handleResend,
                      child: Text(
                        "RESEND CODE",
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                  const SizedBox(height: 48),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 0,
                      ),
                      onPressed: _handleVerify,
                      child: Text(
                        "VERIFY",
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 48),
                  Text(
                    "Didn't receive a code? Please check your spam\nfolder or contact our concierge.",
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.onSurfaceVariant,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_isLoading) const Loading(),
        ],
      ),
    );
  }

  Widget _buildOtpBox(int index) {
    bool hasFocus = _focusNodes[index].hasFocus;
    bool hasText = _otpControllers[index].text.isNotEmpty;

    return Container(
      width: 48,
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color:
              (hasFocus || hasText) ? AppColors.primary : Colors.transparent,
          width: 1.5,
        ),
      ),
      alignment: Alignment.center,
      child: TextField(
        controller: _otpControllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: AppTextStyles.h2.copyWith(color: AppColors.primary),
        decoration: const InputDecoration(
          counterText: "",
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
        onChanged: (value) => _onOtpChanged(value, index),
      ),
    );
  }
}
