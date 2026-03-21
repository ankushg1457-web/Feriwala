import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/shop_auth_provider.dart';
import '../services/api_service.dart';

class ShopInventoryScreen extends StatefulWidget {
  const ShopInventoryScreen({super.key});

  @override
  State<ShopInventoryScreen> createState() => _ShopInventoryScreenState();
}

class _ShopInventoryScreenState extends State<ShopInventoryScreen> {
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    final shopId = context.read<ShopAuthProvider>().shopId;
    try {
      final res = await ShopApiService().get('/products', queryParams: {'shopId': '$shopId', 'limit': '100'});
      setState(() { _products = res['data'] ?? []; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _showUpdateDialog(Map<String, dynamic> product) {
    final inv = (product['inventory'] as List?)?.isNotEmpty == true ? product['inventory'][0] : null;
    final qtyCtrl = TextEditingController(text: '${inv?['quantity'] ?? 0}');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Update Stock: ${product['name']}'),
        content: TextField(
          controller: qtyCtrl,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Quantity', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ShopApiService().put('/products/${product['id']}/inventory', body: {
                  'quantity': int.parse(qtyCtrl.text),
                });
                if (ctx.mounted) Navigator.pop(ctx);
                _loadProducts();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inventory')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProducts,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _products.length,
                itemBuilder: (context, index) {
                  final p = _products[index];
                  final inv = (p['inventory'] as List?)?.isNotEmpty == true ? p['inventory'][0] : null;
                  final qty = inv?['quantity'] ?? 0;
                  final isLow = qty <= (inv?['lowStockThreshold'] ?? 5);

                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      title: Text(p['name'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('SKU: ${p['sku'] ?? 'N/A'}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isLow ? Colors.red[50] : Colors.green[50],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$qty',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isLow ? Colors.red : Colors.green[700],
                                fontSize: 16,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.edit, color: Color(0xFFF47721)),
                            onPressed: () => _showUpdateDialog(p),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
