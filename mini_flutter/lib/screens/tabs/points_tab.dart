import 'package:flutter/material.dart';

import '../../services/points_api.dart';
import '../../services/rewards_api.dart';

/// PWA `/child/points` — P상점
class PointsTab extends StatefulWidget {
  const PointsTab({super.key});

  @override
  State<PointsTab> createState() => _PointsTabState();
}

class _PointsTabState extends State<PointsTab> {
  final _pointsApi = PointsApi();
  final _rewardsApi = RewardsApi();
  int _balance = 0;
  List<ShopReward> _rewards = [];
  String? _toast;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _pointsApi.close();
    _rewardsApi.close();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        _pointsApi.fetchBalance(),
        _rewardsApi.fetchShopRewards(),
      ]);
      if (!mounted) return;
      setState(() {
        _balance = results[0] as int;
        _rewards = results[1] as List<ShopReward>;
      });
    } catch (_) {}
  }

  Future<void> _redeem(ShopReward r) async {
    if (_balance < r.costP) {
      _showToast('P가 부족해요');
      return;
    }
    try {
      final bal = await _pointsApi.spendPoints(r.won, r.label);
      if (!mounted) return;
      setState(() => _balance = bal);
      _showToast('${r.label} 사용 완료! (-${r.costP}P)');
    } catch (_) {
      _showToast('교환에 실패했어요');
    }
  }

  void _showToast(String msg) {
    setState(() => _toast = msg);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _toast = null);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        RefreshIndicator(
          onRefresh: _load,
          color: const Color(0xFF00B8CF),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('P상점', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('${_balance}P', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF00B8CF))),
                      Text('≈ ${(_balance * PayoutCalc.wonPerP).toString()}원', style: const TextStyle(fontSize: 10, color: Color(0xFF828C94))),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (_rewards.isEmpty)
                const Text('보상 목록이 없습니다', style: TextStyle(color: Color(0xFF828C94)))
              else
                ..._rewards.map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        onTap: () => _redeem(r),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFEAEDEF)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(r.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    Text('${r.won}원 · ${r.costP}P', style: const TextStyle(color: Color(0xFF828C94), fontSize: 12)),
                                  ],
                                ),
                              ),
                              const Text('교환', style: TextStyle(color: Color(0xFF00B8CF), fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (_toast != null)
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF2F3438),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(_toast!, style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ),
          ),
      ],
    );
  }
}
