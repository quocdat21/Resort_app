import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';
import 'package:resort_app/features/auth/pages/register_step2_page.dart';

class RegisterStep1Page extends StatefulWidget {
  const RegisterStep1Page({super.key});

  @override
  State<RegisterStep1Page> createState() => _RegisterStep1PageState();
}

class _RegisterStep1PageState extends State<RegisterStep1Page> {
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
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
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppColors.onBackground, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text(
          "STEP 1 OF 3",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.secondary,
            letterSpacing: 2.0,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildProgressBar(1),
              const SizedBox(height: 40),
              const Text(
                "Create\nAccount",
                style: TextStyle(
                  fontFamily: AppTextStyles.fontFamily,
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                "Begin your journey into the Moc Chau sanctuary. Your forest hideaway awaits.",
                style: AppTextStyles.bodyLarge,
              ),
              const SizedBox(height: 40),

              // Full Name
              const AppLabel(text: "FULL NAME"),
              TextField(
                controller: _fullNameController,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface, fontSize: 16),
                decoration: _inputStyle("Thao Nguyen"),
              ),
              const SizedBox(height: 24),

              // Email
              const AppLabel(text: "EMAIL ADDRESS"),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface, fontSize: 16),
                decoration: _inputStyle("nature@sanctuary.com"),
              ),
              const SizedBox(height: 24),

              // Phone Number
              const AppLabel(text: "PHONE NUMBER"),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface, fontSize: 16),
                decoration: _inputStyle("+84 000 000 000"),
              ),
              const SizedBox(height: 48),

              // Next Button
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
                    Navigator.push(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            const RegisterStep2Page(),
                        transitionsBuilder:
                            (context, animation, secondaryAnimation, child) {
                          return FadeTransition(
                            opacity: animation,
                            child: SlideTransition(
                              position: Tween<Offset>(
                                begin: const Offset(0.05, 0),
                                end: Offset.zero,
                              ).animate(CurvedAnimation(
                                parent: animation,
                                curve: Curves.easeOutCubic,
                              )),
                              child: child,
                            ),
                          );
                        },
                        transitionDuration: const Duration(milliseconds: 400),
                      ),
                    );
                  },
                  child: Text(
                    "NEXT",
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 2.0,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Log In Text
              Center(
                child: RichText(
                  text: TextSpan(
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
                    children: [
                      const TextSpan(text: "Already have an account? "),
                      TextSpan(
                        text: "LOG IN",
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            Navigator.pop(context);
                          },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputStyle(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.outlineVariant,
        fontSize: 16,
      ),
      filled: true,
      fillColor: AppColors.surfaceContainerHigh.withOpacity(0.5),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(
        vertical: 20,
        horizontal: 16,
      ),
    );
  }

  Widget _buildProgressBar(int currentStep) {
    return Row(
      children: List.generate(3, (index) {
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: index < 2 ? 8.0 : 0),
            height: 4,
            decoration: BoxDecoration(
              color: index < currentStep
                  ? AppColors.primary
                  : AppColors.outlineVariant.withOpacity(0.5),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}
