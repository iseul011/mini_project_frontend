import 'package:flutter/material.dart';

import '../../services/family_api.dart';
import '../../services/lock_service.dart';
import '../../services/session_store.dart';
import '../cleaning_flow_screen.dart';
import '../pair_screen.dart';

/// PWA `/child/home` parity
class ChildHomeTab extends StatefulWidget {
  const ChildHomeTab({super.key, required this.lockService});

  final LockService lockService;

  @override
  State<ChildHomeTab> createState() => _ChildHomeTabState();
}

class _ChildHomeTabState extends State<ChildHomeTab> {
  final _familyApi = FamilyApi();
  FamilySummary? _summary;
  bool _paired = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _familyApi.close();
    super.dispose();
  }

  Future<void> _load() async {
    final p = await SessionStore.isPaired();
    if (!mounted) return;
    setState(() => _paired = p);
    if (!p) return;
    try {
      final s = await _familyApi.fetchSummary();
      if (mounted) setState(() => _summary = s);
    } catch (_) {}
  }

  void _openCleaning() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CleaningFlowScreen(lockService: widget.lockService),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = _summary?.childDisplayName ?? '자녀';
    final points = _summary?.pointsBalance ?? 0;
    final streak = _summary?.streakDays ?? 0;
    final mult = _summary?.streakMult ?? 1.0;
    final todayDone = (_summary?.todayScore ?? 0) > 0;

    return RefreshIndicator(
      onRefresh: _load,
      color: const Color(0xFF00B8CF),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('안녕, $name', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              Text(
                '${points}P',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF00B8CF)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _card(
            title: todayDone ? '오늘 청소 완료 ✓' : '오늘 청소 대기',
            subtitle: '스트릭 $streak일 · ${mult}x 배율',
            trailing: todayDone ? '🔓' : '🧹',
          ),
          const SizedBox(height: 12),
          if (!_paired)
            FilledButton(
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => PairScreen(lockService: widget.lockService),
                  ),
                );
                await _load();
              },
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF00B8CF),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('부모와 연결하기'),
            )
          else
            FilledButton(
              onPressed: _openCleaning,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF00B8CF),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('청소하기'),
            ),
          const SizedBox(height: 12),
          _card(
            title: '잠금 스케줄',
            subtitle: widget.lockService.policy != null
                ? '${widget.lockService.policy!.lockDays} · ${widget.lockService.policy!.lockTime}'
                : '동기화 중…',
            trailing: '🔒',
          ),
        ],
      ),
    );
  }

  Widget _card({required String title, required String subtitle, required String trailing}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEAEDEF)),
      ),
      child: Row(
        children: [
          Text(trailing, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Color(0xFF828C94), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
