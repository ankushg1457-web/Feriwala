import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/delivery_auth_provider.dart';

class DeliveryProfileScreen extends StatelessWidget {
  const DeliveryProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<DeliveryAuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: const Color(0xFFF47721).withAlpha(25),
              child: const Icon(Icons.delivery_dining, size: 40, color: Color(0xFFF47721)),
            ),
            const SizedBox(height: 12),
            Text(auth.user?['name'] ?? 'Agent', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(auth.user?['email'] ?? '', style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(leading: const Icon(Icons.phone), title: const Text('Phone'), subtitle: Text(auth.user?['phone'] ?? '-')),
                  const Divider(height: 0),
                  ListTile(leading: const Icon(Icons.badge), title: const Text('Role'), subtitle: Text(auth.user?['role'] ?? '-')),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
                },
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
