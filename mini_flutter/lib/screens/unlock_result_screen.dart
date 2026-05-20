import 'package:flutter/material.dart';

import '../services/cleaning_session.dart';
import '../services/points_api.dart';
import '../widgets/celebration_overlay.dart';

class UnlockResultScreen extends StatefulWidget {
  const UnlockResultScreen({
    super.key,
    required this.session,
    required this.onDone,
    required this.onRetry,
  });

  final CleaningSession session;
  final VoidCallback onDone;
  final VoidCallback onRetry;

  @override
  State<UnlockResultScreen> createState() => _UnlockResultScreenState();
}

class _UnlockResultScreenState extends State<UnlockResultScreen> {
  late bool _showCelebration;

  @override
  void initState() {
    super.initState();
    _showCelebration = widget.session.passed;
  }

  @override
  Widget build(BuildContext context) {
    final passed = widget.session.passed;
    final score = widget.session.cleanliness;
    final payout = PayoutCalc.calc(widget.session.baseCleanWon, score, widget.session.streakDays);

    return Stack(
      children: [
        Scaffold(
          backgroundColor: const Color(0xFFF7F9FA),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(passed ? '🔓' : '⏳', style: const TextStyle(fontSize: 48)),
                  const SizedBox(height: 16),
                  Text(
                    passed ? '잠금 해제!' : score <= 0 ? 'AI 채점 필요' : '점수 미달',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.session.verifyComment.isNotEmpty
                        ? widget.session.verifyComment
                        : 'AI 검증 완료',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF828C94), fontSize: 14),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFEAEDEF)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AI $score점', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        _row(
                          '기본 ${widget.session.baseCleanWon}원 × $score%',
                          '${payout.wonFromScore}원',
                        ),
                        _row(
                          '스트릭 ${widget.session.streakDays}일 (${payout.mult}×)',
                          '+${payout.finalP.toStringAsFixed(1)}P',
                          highlight: true,
                        ),
                        if (!passed)
                          Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Text(
                              '합격 기준 ${widget.session.passScore}점',
                              style: const TextStyle(color: Color(0xFFF04452), fontSize: 13),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  if (passed)
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: widget.onDone,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF00B8CF),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('홈으로'),
                      ),
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: widget.onRetry,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF00B8CF),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('다시 청소하기'),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
        if (_showCelebration)
          CelebrationOverlay(
            emoji: '🎉',
            title: '잠금 해제!',
            subtitle: 'AI ${score}점 · +${payout.finalP.toStringAsFixed(1)}P',
            onDismiss: () => setState(() => _showCelebration = false),
          ),
      ],
    );
  }

  Widget _row(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF828C94), fontSize: 14)),
          Text(
            value,
            style: TextStyle(
              fontWeight: highlight ? FontWeight.bold : FontWeight.normal,
              color: highlight ? const Color(0xFF00B8CF) : const Color(0xFF2F3438),
            ),
          ),
        ],
      ),
    );
  }
}
