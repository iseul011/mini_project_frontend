import 'package:flutter/material.dart';

import '../../services/family_api.dart';
import '../../services/lock_service.dart';
import '../../services/points_api.dart';
import '../../services/session_store.dart';
import '../diagnostics_screen.dart';
import '../pair_screen.dart';

/// PWA `/child/me` + E2E 진단 · 페어링
class MeTab extends StatefulWidget {
  const MeTab({super.key, required this.lockService});

  final LockService lockService;

  @override
  State<MeTab> createState() => _MeTabState();
}

class _MeTabState extends State<MeTab> {
  final _familyApi = FamilyApi();
  final _pointsApi = PointsApi();
  String _name = '자녀';
  int _balance = 0;
  int _streak = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _familyApi.close();
    _pointsApi.close();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final s = await _familyApi.fetchSummary();
      final b = await _pointsApi.fetchBalance();
      if (!mounted) return;
      setState(() {
        _name = s.childDisplayName;
        _balance = b;
        _streak = s.streakDays;
      });
    } catch (_) {
      /* 401은 childAuthorizedRequest가 토큰 갱신 시도 — 연결 끊지 않음 */
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('나', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text('${_balance}P', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00B8CF))),
          ],
        ),
        const SizedBox(height: 16),
        _rowCard('스트릭', '$_streak일'),
        _rowCard('이름', _name),
        _rowCard('앱 버전', '0.5.0'),
        const SizedBox(height: 8),
        _actionTile('새 폰으로 다시 연결', Icons.phonelink_setup, () async {
          await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => PairScreen(
                lockService: widget.lockService,
                relinkMode: true,
              ),
            ),
          );
          await _load();
        }),
        _actionTile('E2E 진단', Icons.medical_services_outlined, () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => DiagnosticsScreen(lockService: widget.lockService)),
          );
        }),
        _actionTile('배터리 최적화 제외', Icons.battery_charging_full, () {
          widget.lockService.requestBatteryExemption();
        }),
        const SizedBox(height: 16),
        if (widget.lockService.status?.deviceOwner == true)
          OutlinedButton(
            onPressed: widget.lockService.forceLock,
            child: const Text('테스트 잠금 (개발)'),
          ),
      ],
    );
  }

  Widget _rowCard(String k, String v) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEAEDEF)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(k),
          Text(v, style: const TextStyle(color: Color(0xFF828C94))),
        ],
      ),
    );
  }

  Widget _actionTile(String label, IconData icon, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: const Color(0xFF00B8CF)),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFFADB5BD)),
    );
  }
}
