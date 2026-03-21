import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class OrderTrackingScreen extends StatefulWidget {
  final int orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  Map<String, dynamic>? _order;
  bool _loading = true;
  final _socketService = SocketService();

  final _statusSteps = [
    'pending', 'confirmed', 'preparing', 'ready_for_pickup',
    'picked_up', 'out_for_delivery', 'delivered',
  ];

  @override
  void initState() {
    super.initState();
    _loadOrder();
    _listenToUpdates();
  }

  void _listenToUpdates() {
    _socketService.onOrderStatus((data) {
      if (data['orderId'] == widget.orderId) {
        _loadOrder();
      }
    });
    _socketService.onDeliveryStatus((data) {
      if (data['orderId'] == widget.orderId) {
        _loadOrder();
      }
    });
  }

  Future<void> _loadOrder() async {
    try {
      final res = await ApiService().get('/orders/${widget.orderId}');
      setState(() {
        _order = res['data'];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  int _currentStep() {
    final status = _order?['status'] ?? 'pending';
    final index = _statusSteps.indexOf(status);
    return index >= 0 ? index : 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_order?['orderNumber'] ?? 'Order Details')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _order == null
              ? const Center(child: Text('Order not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status stepper
                      Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Order Status', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 16),
                              ..._statusSteps.asMap().entries.map((entry) {
                                final i = entry.key;
                                final step = entry.value;
                                final isActive = i <= _currentStep();
                                final isCurrent = i == _currentStep();
                                return Row(
                                  children: [
                                    Column(
                                      children: [
                                        Container(
                                          width: 24,
                                          height: 24,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: isActive ? const Color(0xFFF47721) : Colors.grey[300],
                                          ),
                                          child: isActive
                                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                                              : null,
                                        ),
                                        if (i < _statusSteps.length - 1)
                                          Container(
                                            width: 2,
                                            height: 24,
                                            color: isActive ? const Color(0xFFF47721) : Colors.grey[300],
                                          ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.only(bottom: 16),
                                        child: Text(
                                          step.replaceAll('_', ' ').toUpperCase(),
                                          style: TextStyle(
                                            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                                            color: isActive ? Colors.black : Colors.grey,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              }),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Order items
                      Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              ...(_order!['items'] as List? ?? []).map((item) => Padding(
                                    padding: const EdgeInsets.only(bottom: 8),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(child: Text('${item['productName']} x${item['quantity']}')),
                                        Text('₹${item['total']}'),
                                      ],
                                    ),
                                  )),
                              const Divider(),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                                  Text('₹${_order!['total']}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFF47721))),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Request return (if delivered)
                      if (_order!['status'] == 'delivered')
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: () {
                              // Navigate to return request
                            },
                            style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                            child: const Text('Request Return'),
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }
}
