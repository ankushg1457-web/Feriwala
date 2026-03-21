import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReturnVerificationScreen extends StatefulWidget {
  final int taskId;
  const ReturnVerificationScreen({super.key, required this.taskId});

  @override
  State<ReturnVerificationScreen> createState() => _ReturnVerificationScreenState();
}

class _ReturnVerificationScreenState extends State<ReturnVerificationScreen> {
  bool _tagsIntact = false;
  bool _noStains = false;
  bool _noTears = false;
  bool _originalPackaging = false;
  bool _matchesOrder = false;
  bool _notWorn = false;
  final _notesController = TextEditingController();
  bool _saving = false;

  Future<void> _submit() async {
    setState(() => _saving = true);
    try {
      await DeliveryApiService().put('/delivery/returns/${widget.taskId}/verify', body: {
        'checklist': {
          'tagsIntact': _tagsIntact,
          'noStains': _noStains,
          'noTears': _noTears,
          'originalPackaging': _originalPackaging,
          'matchesOrder': _matchesOrder,
          'notWorn': _notWorn,
        },
        'notes': _notesController.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Verification submitted!'), backgroundColor: Colors.green));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final allChecked = _tagsIntact && _noStains && _noTears && _originalPackaging && _matchesOrder && _notWorn;

    return Scaffold(
      appBar: AppBar(title: const Text('Return Verification')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Return Verification Checklist', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Please inspect the returned item and check all applicable conditions:', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),

            _CheckItem(
              title: 'Tags Intact',
              subtitle: 'All original tags are still attached',
              icon: Icons.local_offer,
              value: _tagsIntact,
              onChanged: (v) => setState(() => _tagsIntact = v!),
            ),
            _CheckItem(
              title: 'No Stains',
              subtitle: 'Item is free from stains or marks',
              icon: Icons.water_drop,
              value: _noStains,
              onChanged: (v) => setState(() => _noStains = v!),
            ),
            _CheckItem(
              title: 'No Tears',
              subtitle: 'No rips, tears, or damage',
              icon: Icons.content_cut,
              value: _noTears,
              onChanged: (v) => setState(() => _noTears = v!),
            ),
            _CheckItem(
              title: 'Original Packaging',
              subtitle: 'Item is in its original packaging',
              icon: Icons.inventory_2,
              value: _originalPackaging,
              onChanged: (v) => setState(() => _originalPackaging = v!),
            ),
            _CheckItem(
              title: 'Matches Order',
              subtitle: 'Item matches the original order (size, color, product)',
              icon: Icons.check_circle,
              value: _matchesOrder,
              onChanged: (v) => setState(() => _matchesOrder = v!),
            ),
            _CheckItem(
              title: 'Not Worn',
              subtitle: 'Item shows no signs of being worn or used',
              icon: Icons.dry_cleaning,
              value: _notWorn,
              onChanged: (v) => setState(() => _notWorn = v!),
            ),

            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Additional Notes (optional)',
                border: OutlineInputBorder(),
                hintText: 'Any observations about the returned item...',
              ),
            ),

            const SizedBox(height: 8),
            if (!allChecked)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning, color: Colors.orange),
                    SizedBox(width: 8),
                    Expanded(child: Text('Some checks failed. Return may be rejected.', style: TextStyle(color: Colors.orange))),
                  ],
                ),
              ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _saving ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: allChecked ? Colors.green : Colors.orange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _saving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        allChecked ? 'Approve Return' : 'Submit with Issues',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool value;
  final ValueChanged<bool?> onChanged;
  const _CheckItem({required this.title, required this.subtitle, required this.icon, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: CheckboxListTile(
        value: value,
        onChanged: onChanged,
        activeColor: Colors.green,
        secondary: Icon(icon, color: value ? Colors.green : Colors.grey),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.w500, color: value ? Colors.green[700] : null)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      ),
    );
  }
}
