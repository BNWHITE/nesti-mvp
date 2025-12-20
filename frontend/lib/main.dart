import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() {
  // Disable debug banner in production
  if (kReleaseMode) {
    debugPrint = (String? message, {int? wrapWidth}) {};
  }
  
  runApp(const NestiApp());
}

class NestiApp extends StatelessWidget {
  const NestiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Nesti - Assistant Familial',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
