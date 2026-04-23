import 'package:flutter/material.dart';
import 'package:resort_app/core/constants/app_colors.dart';
import 'package:resort_app/core/constants/app_text_styles.dart';
import 'package:resort_app/core/services/api_service.dart';
import 'package:resort_app/features/home/pages/side_menu_drawer_page.dart';
import 'package:resort_app/features/navigation/bottomNav.dart';

class HomeScreen extends StatefulWidget {
  final String userName;

  const HomeScreen({super.key, this.userName = 'Traveler'});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _userName = '';

  @override
  void initState() {
    super.initState();
    _userName = widget.userName;
    _fetchUserName();
  }

  Future<void> _fetchUserName() async {
    // Attempt to load from local storage first
    if (_userName == 'Traveler') {
      final user = await ApiService.getUser();
      if (user != null && user['full_name'] != null && mounted) {
        setState(() {
          _userName = user['full_name'];
        });
      }
    }

    // Fetch the latest from API to ensure it's up to date after edits
    try {
      final response = await ApiService.fetchMe();
      if (response['success'] == true && mounted) {
        final data = response['data'];
        if (data != null && data['full_name'] != null) {
          setState(() {
            _userName = data['full_name'];
          });
        }
      }
    } catch (e) {
      // Keep existing name if fetch fails
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      drawer: const SideMenuDrawerPage(),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    _buildWelcome(),
                    const SizedBox(height: 16),
                    _buildSearch(),
                    const SizedBox(height: 20),
                    _buildBanner(),
                    const SizedBox(height: 20),
                    _buildCategories(),
                    const SizedBox(height: 20),
                    _buildPopular(),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 0),
    );
  }

  // ================= HEADER =================
  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Builder(
                builder: (context) => InkWell(
                  onTap: () => Scaffold.of(context).openDrawer(),
                  child: const Icon(Icons.menu),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                "Thao Nguyen Resort",
                style: AppTextStyles.h3.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              )
            ],
          ),
          const Row(
            children: [
              Stack(
                children: [
                  Icon(Icons.notifications),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: CircleAvatar(
                      radius: 4,
                      backgroundColor: AppColors.secondary,
                    ),
                  )
                ],
              ),
              SizedBox(width: 12),
              CircleAvatar(
                radius: 18,
                backgroundImage: AssetImage(
                  "assets/icons/profile.png",
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  // ================= WELCOME =================
  Widget _buildWelcome() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "WELCOME TO THE HIGHLANDS",
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "Hello, $_userName",
          style: AppTextStyles.h2.copyWith(
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  // ================= SEARCH =================
  Widget _buildSearch() {
    return TextField(
      decoration: InputDecoration(
        hintText: "Search experiences...",
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: AppColors.surfaceContainerHigh,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  // ================= BANNER =================
  Widget _buildBanner() {
    return SizedBox(
      height: 180,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _bannerItem(
            image:
                "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101d",
            title: "Summer Sanctuary\nSave 25%",
          ),
          _bannerItem(
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
            title: "Forest Spa Day\nFree Tea",
          ),
        ],
      ),
    );
  }

  Widget _bannerItem({required String image, required String title}) {
    return Container(
      width: 300,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: DecorationImage(
          image: NetworkImage(image),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        alignment: Alignment.bottomLeft,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            colors: [Colors.black.withOpacity(0.6), Colors.transparent],
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
          ),
        ),
        child: Text(
          title,
          style: AppTextStyles.h3.copyWith(color: Colors.white),
        ),
      ),
    );
  }

  // ================= CATEGORIES =================
  Widget _buildCategories() {
    final items = [
      Icons.villa,
      Icons.bed,
      Icons.houseboat,
      Icons.cabin,
      Icons.home_work,
    ];

    final labels = ["Villas", "Suites", "Bungalows", "Cabins", "Lofts"];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Room Categories", style: AppTextStyles.h3),
        const SizedBox(height: 12),
        SizedBox(
          height: 90,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            itemBuilder: (_, i) => Container(
              margin: const EdgeInsets.only(right: 12),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: i == 0
                        ? AppColors.primary
                        : AppColors.surfaceContainerHigh,
                    child: Icon(
                      items[i],
                      color: i == 0 ? AppColors.onPrimary : AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    labels[i].toUpperCase(),
                    style: AppTextStyles.labelSmall,
                  )
                ],
              ),
            ),
          ),
        )
      ],
    );
  }

  // ================= POPULAR =================
  Widget _buildPopular() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Popular Stays", style: AppTextStyles.h3),
        const SizedBox(height: 12),
        _roomCard(
          "Bamboo Forest Suite",
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
          "\$180",
        ),
        _roomCard(
          "Cloud Valley Villa",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
          "\$320",
        ),
      ],
    );
  }

  Widget _roomCard(String title, String image, String price) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Image.network(
              image,
              width: 110,
              height: 110,
              fit: BoxFit.cover,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.h3),
                  const SizedBox(height: 4),
                  const Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.orange),
                      SizedBox(width: 4),
                      Text("4.9 · MOC CHAU")
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "$price / NIGHT",
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
