import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';

class Onboarding2 extends StatelessWidget {
  final VoidCallback onNext;
  final VoidCallback onBack;

  const Onboarding2({
    super.key,
    required this.onNext,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Blurred background
        ImageFiltered(
          imageFilter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
          child: Image.asset(
            'assets/images/image_onboarding1.png',
            fit: BoxFit.cover,
          ),
        ),
        // White overlay for readability
        Container(color: AppColors.background.withOpacity(0.60)),
        // Content
        SafeArea(
          child: Column(
            children: [
              // Back arrow
              Align(
                alignment: Alignment.topLeft,
                child: Padding(
                  padding: const EdgeInsets.only(left: 12, top: 8),
                  child: IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.surfaceContainerHigh.withOpacity(0.6),
                      ),
                      child: const Icon(
                        Icons.arrow_back,
                        color: AppColors.onBackground,
                        size: 20,
                      ),
                    ),
                    onPressed: onBack,
                  ),
                ),
              ),

              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      // Image card with border
                      Expanded(
                        flex: 5,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: AppColors.outlineVariant.withOpacity(0.4),
                              width: 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(23),
                            child: Image.asset(
                              'assets/images/image_onboarding2.jpg',
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Title + description + button
                      Expanded(
                        flex: 3,
                        child: Column(
                          children: [
                            Text(
                              AppStrings.get(context, 'onboarding2_title'),
                              textAlign: TextAlign.center,
                              style: AppTextStyles.h1.copyWith(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              AppStrings.get(context, 'onboarding2_desc'),
                              textAlign: TextAlign.center,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.onSurfaceVariant,
                                height: 1.5,
                              ),
                            ),
                            const Spacer(),

                            // NEXT button
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
                                onPressed: onNext,
                                child: Text(
                                  AppStrings.get(context, 'next').toUpperCase(),
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                    letterSpacing: 2.0,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
