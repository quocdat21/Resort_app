import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  bool _isObscure1 = true;
  bool _isObscure2 = true;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
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
          "RESET PASSWORD",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.onBackground,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "ACCOUNT RECOVERY",
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.onSecondaryContainer,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "Reset\nPassword",
                style: AppTextStyles.h1.copyWith(
                  fontSize: 40,
                  height: 1.1,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                "Create a new secure password to\nprotect your forest sanctuary access.",
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.onSurfaceVariant,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              const AppLabel(text: "NEW PASSWORD"),
              TextField(
                controller: _passwordController,
                obscureText: _isObscure1,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface),
                decoration: InputDecoration(
                  hintText: "••••••••",
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.outlineVariant, letterSpacing: 4.0),
                  filled: true,
                  fillColor: AppColors.surfaceContainerHigh,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 18,
                    horizontal: 16,
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isObscure1
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.outline,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _isObscure1 = !_isObscure1),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const AppLabel(text: "CONFIRM PASSWORD"),
              TextField(
                controller: _confirmController,
                obscureText: _isObscure2,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface),
                decoration: InputDecoration(
                  hintText: "••••••••",
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.outlineVariant, letterSpacing: 4.0),
                  filled: true,
                  fillColor: AppColors.surfaceContainerHigh,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 18,
                    horizontal: 16,
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isObscure2
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.outline,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _isObscure2 = !_isObscure2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_outline,
                            size: 14, color: AppColors.onSecondaryContainer),
                        const SizedBox(width: 6),
                        Text(
                          "8+ Characters",
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.onSecondaryContainer,
                            letterSpacing: 0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.circle_outlined,
                            size: 14, color: AppColors.outline),
                        const SizedBox(width: 6),
                        Text(
                          "Special symbol",
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.outline,
                            letterSpacing: 0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
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
                  onPressed: () {
                    // Navigate or submit
                  },
                  child: Text(
                    "SUBMIT",
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Center(
                child: RichText(
                  text: TextSpan(
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.onSurfaceVariant,
                      fontWeight: FontWeight.w600,
                    ),
                    children: [
                      const TextSpan(text: "Need help? "),
                      TextSpan(
                        text: "Contact Concierge",
                        style: const TextStyle(
                          decoration: TextDecoration.underline,
                        ),
                        recognizer: TapGestureRecognizer()..onTap = () {},
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
