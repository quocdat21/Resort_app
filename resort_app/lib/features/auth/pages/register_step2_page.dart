import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/widgets/app_label.dart';
import 'package:resort_app/features/auth/pages/register_step3_page.dart';

class RegisterStep2Page extends StatefulWidget {
  const RegisterStep2Page({super.key});

  @override
  State<RegisterStep2Page> createState() => _RegisterStep2PageState();
}

class _RegisterStep2PageState extends State<RegisterStep2Page> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

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
          "STEP 2 OF 3",
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
              _buildProgressBar(2),
              const SizedBox(height: 40),
              const Text(
                "Secure your\nstay.",
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
                "Choose a password to protect your account\nand bookings.",
                style: AppTextStyles.bodyLarge,
              ),
              const SizedBox(height: 40),

              // PASSWORD
              const AppLabel(text: "PASSWORD"),
              TextField(
                obscureText: _obscurePassword,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface, fontSize: 16),
                decoration: _inputStyle("........").copyWith(
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: AppColors.outline),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // CONFIRM PASSWORD
              const AppLabel(text: "CONFIRM PASSWORD"),
              TextField(
                obscureText: _obscureConfirmPassword,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.onSurface, fontSize: 16),
                decoration: _inputStyle("Re-enter password").copyWith(
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscureConfirmPassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: AppColors.outline),
                    onPressed: () => setState(() =>
                        _obscureConfirmPassword = !_obscureConfirmPassword),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Chips
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(
                          0xFFFDF0E1), // Light beige for the chip to match image perfectly
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle_outline,
                            size: 16, color: AppColors.secondary),
                        const SizedBox(width: 6),
                        Text(
                          "8+ Characters",
                          style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.secondary, letterSpacing: 0),
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
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.radio_button_unchecked,
                            size: 16, color: AppColors.outline),
                        const SizedBox(width: 6),
                        Text(
                          "Special symbol",
                          style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.onSurfaceVariant,
                              letterSpacing: 0),
                        ),
                      ],
                    ),
                  ),
                ],
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
                            const RegisterStep3Page(),
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
                    "Next",
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Save For Later
              Center(
                child: TextButton(
                  onPressed: () {},
                  child: Text(
                    "SAVE FOR LATER",
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.secondary,
                      letterSpacing: 2.0,
                    ),
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
