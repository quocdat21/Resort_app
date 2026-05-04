import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class Onboarding1 extends StatelessWidget {
  final VoidCallback onNext;
  final VoidCallback onSkip;

  const Onboarding1({
    super.key,
    required this.onNext,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Background image
        Image.asset(
          'assets/images/image_onboarding1.png',
          fit: BoxFit.cover,
        ),
        // Content
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),

                // Header row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Logo text
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "HIGHLAND\nSANCTUARY",
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.onPrimary.withOpacity(0.6),
                            letterSpacing: 2.0,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "THAO NGUYEN",
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.onTertiary,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                    // Skip button
                    GestureDetector(
                      onTap: onSkip,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.onTertiary.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Text(
                          AppStrings.get(context, 'skip'),
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.onPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const Spacer(),

                // Title
                RichText(
                  text: TextSpan(
                    style: const TextStyle(
                      fontFamily: AppTextStyles.fontFamily,
                      fontSize: 44,
                      fontWeight: FontWeight.w900,
                      height: 1.1,
                    ),
                    children: [
                      TextSpan(
                        text: AppStrings.get(context, 'onboarding1_title1'),
                        style: const TextStyle(color: AppColors.onPrimary),
                      ),
                      TextSpan(
                        text: AppStrings.get(context, 'onboarding1_title2'),
                        style: const TextStyle(
                          color: AppColors.onPrimaryContainer,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Description
                Text(
                  AppStrings.get(context, 'onboarding1_desc'),
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.onPrimary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 32),

                // Next button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary.withOpacity(0.85),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 0,
                    ),
                    onPressed: onNext,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          AppStrings.get(context, 'next'),
                          style: AppTextStyles.bodyLarge.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, size: 20),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
