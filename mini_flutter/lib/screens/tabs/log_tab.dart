import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/api_config.dart';
import '../../services/cleaning_session.dart';
import '../../services/family_api.dart';
import '../../services/log_api.dart';
import '../../services/points_api.dart';
import '../../widgets/celebration_overlay.dart';

/// PWA `/log` — 사진 + 댓글 (C-30d)
class LogTab extends StatefulWidget {
  const LogTab({super.key});

  @override
  State<LogTab> createState() => _LogTabState();
}

class _LogTabState extends State<LogTab> {
  final _logApi = LogApi();
  final _familyApi = FamilyApi();
  final _controller = TextEditingController();
  LogDetail? _detail;
  int _baseCleanWon = 0;
  bool _loading = true;
  bool _showFireworks = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _load();
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('log_fireworks_seen')) {
      if (mounted) setState(() => _showFireworks = true);
      await prefs.setBool('log_fireworks_seen', true);
    }
  }

  @override
  void dispose() {
    _logApi.close();
    _familyApi.close();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final date = todayLogDate();
      final results = await Future.wait([
        _logApi.fetchDetail(date),
        _familyApi.fetchSummary(),
      ]);
      if (!mounted) return;
      setState(() {
        _detail = results[0] as LogDetail;
        _baseCleanWon = (results[1] as FamilySummary).baseCleanWon;
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = '로그를 불러오지 못했습니다';
          _loading = false;
        });
      }
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();
    try {
      final msg = await _logApi.postMessage(date: todayLogDate(), text: text);
      if (!mounted) return;
      setState(() {
        _detail = LogDetail(
          date: _detail!.date,
          score: _detail!.score,
          streakDays: _detail!.streakDays,
          beforeUrl: _detail!.beforeUrl,
          afterUrl: _detail!.afterUrl,
          messages: [..._detail!.messages, msg],
        );
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final d = _detail;
    final payout = d != null && d.score > 0
        ? PayoutCalc.calc(_baseCleanWon, d.score, d.streakDays)
        : null;

    return Stack(
      children: [
        Column(
          children: [
            Expanded(
              child: RefreshIndicator(
                onRefresh: _load,
                color: const Color(0xFF00B8CF),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('오늘의 로그', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        if (d != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F9EE),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '스트릭 ${d.streakDays}일',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF00C73C)),
                            ),
                          ),
                      ],
                    ),
                    if (payout != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        'AI ${d!.score}점 · +${payout.finalP.toStringAsFixed(1)}P',
                        style: const TextStyle(color: Color(0xFF828C94), fontSize: 12),
                      ),
                    ],
                    const SizedBox(height: 12),
                    if (d?.beforeUrl != null || d?.afterUrl != null)
                      Row(
                        children: [
                          if (d?.beforeUrl != null)
                            Expanded(child: _photo('전', resolveUploadUrl(d!.beforeUrl))),
                          if (d?.beforeUrl != null && d?.afterUrl != null) const SizedBox(width: 8),
                          if (d?.afterUrl != null)
                            Expanded(child: _photo('후', resolveUploadUrl(d!.afterUrl))),
                        ],
                      ),
                    const SizedBox(height: 16),
                    if (_loading)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(child: CircularProgressIndicator(color: Color(0xFF00B8CF))),
                      )
                    else if (_error != null)
                      Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFF04452)))
                    else if (d?.messages.isEmpty ?? true)
                      const Text('아직 메시지가 없어요', style: TextStyle(color: Color(0xFF828C94)))
                    else
                      ...d!.messages.map(_bubble),
                  ],
                ),
              ),
            ),
            Material(
              elevation: 8,
              color: Colors.white,
              child: SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          decoration: InputDecoration(
                            hintText: '메시지 입력…',
                            filled: true,
                            fillColor: const Color(0xFFF7F9FA),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          ),
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _send,
                        icon: const Icon(Icons.send, size: 20),
                        style: IconButton.styleFrom(backgroundColor: const Color(0xFF00B8CF)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        if (_showFireworks)
          CelebrationOverlay(
            emoji: '🎉',
            title: '첫 청소 로그!',
            subtitle: '엄마·아빠와 대화를 나눠보세요',
            onDismiss: () => setState(() => _showFireworks = false),
          ),
      ],
    );
  }

  Widget _photo(String label, String url) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF828C94))),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: AspectRatio(
            aspectRatio: 4 / 3,
            child: Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => _photoPlaceholder()),
          ),
        ),
      ],
    );
  }

  Widget _photoPlaceholder() => Container(color: const Color(0xFFEAEDEF), child: const Icon(Icons.image_outlined));

  Widget _bubble(LogMessage m) {
    final isChild = m.role == 'child';
    return Align(
      alignment: isChild ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.75),
        decoration: BoxDecoration(
          color: isChild ? const Color(0xFF00B8CF) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: isChild ? null : Border.all(color: const Color(0xFFEAEDEF)),
        ),
        child: Text(
          m.text,
          style: TextStyle(color: isChild ? Colors.white : const Color(0xFF2F3438), fontSize: 14),
        ),
      ),
    );
  }
}
