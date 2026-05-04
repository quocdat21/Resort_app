import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/localization/app_strings.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';

class LocationPage extends StatelessWidget {
  const LocationPage({super.key});

  final String mapImageUrl =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRlIhFILjlNIeU5OtL3G6IIUtaQ3RypjkRKN_S6d9VUWKEUhZldNIWQD-nD-s3kaqsy9et1Sf-4f5eHDt0IDbruzei-qt-S9dp08i1CkGPyVJbdRwx6v9wOKWGGzFd0pZoYT7nCzAN-I6JDkqJF_S67xBaZkwFRZIHz6K64mNHIc6MGK81xXNu4bX7Ary5lA1HumO7NDtWksMINuxhaTlw9QUphNcfGVowTuNcyUPalIXxVKadjm6YjxJ8f8L5a91ia6ShiUaweFL-';

  Future<void> _openGoogleMaps() async {
    final Uri url = Uri.parse(
        'https://www.google.com/maps/search/?api=1&query=Th%E1%BA%A3o+Nguy%C3%AAn+Resort+Moc+Chau');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onBackground),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.get(context, 'location'),
          style: AppTextStyles.h3.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.onBackground,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top info section (scrollable text)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  Text(
                    AppStrings.get(context, 'our_sanctuary'),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.outline,
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Moc Chau, Son La,\nVietnam",
                    style: AppTextStyles.h1.copyWith(
                      color: AppColors.primary,
                      height: 1.1,
                      fontSize: 36,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Nestled in the misty highlands of Northern Vietnam, surrounded by verdant tea hills and blooming plum blossoms.",
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.onSurfaceVariant,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),

            // Map section - takes remaining space
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Stack(
                      children: [
                        // Map Image Background
                        Positioned.fill(
                          child: CachedNetworkImage(
                            imageUrl: mapImageUrl,
                            fit: BoxFit.cover,
                            httpHeaders: ApiService.imageHeaders,
                            placeholder: (context, url) => const Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: AppColors.surfaceContainerHigh,
                              child: const Icon(Icons.map,
                                  color: AppColors.outline),
                            ),
                          ),
                        ),
                        // Center Pin Overlay
                        Center(
                          child: Container(
                            width: 64,
                            height: 64,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.location_on,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                          ),
                        ),
                        // Floating Info Card
                        Positioned(
                          bottom: 16,
                          left: 16,
                          right: 16,
                          child: IgnorePointer(
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.95),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.08),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceContainerHigh,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.route_outlined,
                                      color: AppColors.primary,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "Highland Access",
                                        style:
                                            AppTextStyles.bodyMedium.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.onSurface,
                                        ),
                                      ),
                                      Text(
                                        "4 hours from Hanoi",
                                        style: AppTextStyles.bodySmall.copyWith(
                                          color: AppColors.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Bottom buttons
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 0,
                      ),
                      onPressed: _openGoogleMaps,
                      icon: const Icon(Icons.map_outlined, size: 20),
                      label: Text(
                        AppStrings.get(context, 'open_google_maps'),
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.surfaceContainerHigh,
                        foregroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.directions_car_outlined, size: 20),
                      label: Text(
                        AppStrings.get(context, 'request_pickup'),
                        style: AppTextStyles.bodyLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
