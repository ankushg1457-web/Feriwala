import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'providers/delivery_auth_provider.dart';
import 'screens/delivery_login_screen.dart';
import 'screens/delivery_home_screen.dart';
import 'screens/task_detail_screen.dart';
import 'screens/return_verification_screen.dart';
import 'screens/delivery_profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DeliveryApiService().init();
  runApp(const FeriwalaDeliveryApp());
}

class FeriwalaDeliveryApp extends StatelessWidget {
  const FeriwalaDeliveryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => DeliveryAuthProvider()..init()),
      ],
      child: MaterialApp(
        title: 'Feriwala Delivery',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF16213E),
            primary: const Color(0xFF16213E),
          ),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF16213E),
            foregroundColor: Colors.white,
          ),
        ),
        initialRoute: '/login',
        routes: {
          '/login': (context) => const DeliveryLoginScreen(),
          '/home': (context) => const DeliveryHomeScreen(),
          '/profile': (context) => const DeliveryProfileScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/task-detail') {
            final taskId = settings.arguments as int;
            return MaterialPageRoute(builder: (_) => TaskDetailScreen(taskId: taskId));
          }
          if (settings.name == '/return-verification') {
            final taskId = settings.arguments as int;
            return MaterialPageRoute(builder: (_) => ReturnVerificationScreen(taskId: taskId));
          }
          return null;
        },
      ),
    );
  }
}
