import '../models/cleaning_slots.dart';
import 'cleaning_api.dart';
import 'family_api.dart';

bool _isGeminiResult(String? modelId) =>
    modelId != null && modelId.isNotEmpty && modelId != 'fallback';

/// PWA captureSlots.ts — 슬롯별 scan / baseline compare
class CleaningOrchestrator {
  CleaningOrchestrator({
    CleaningApi? cleaningApi,
    FamilyApi? familyApi,
  })  : _cleaning = cleaningApi ?? CleaningApi(),
        _family = familyApi ?? FamilyApi();

  final CleaningApi _cleaning;
  final FamilyApi _family;

  Future<DirtyScanAggregate> scanAllSlots(List<List<int>> captures) async {
    _assertCaptures(captures);
    final results = await Future.wait(
      List.generate(CleaningSlots.count, (i) {
        return _cleaning.scanRoom(captures[i], CleaningSlots.roomLabel(i));
      }),
    );

    if (results.every((r) => !_isGeminiResult(r.modelId))) {
      throw OrchestratorException('gemini_scan_failed');
    }

    final monsterMap = <String, AiMonster>{};
    for (final r in results) {
      for (final m in r.monsters) {
        monsterMap[m.id] = m;
      }
    }

    final pollution = (results.map((r) => r.pollutionLevel).reduce((a, b) => a + b) /
            results.length)
        .round();
    final summary = [
      for (var i = 0; i < results.length; i++)
        '[${CleaningSlots.labels[i]}] ${results[i].summary}',
    ].join(' ');

    return DirtyScanAggregate(
      questLabels: monsterMap.values.map((m) => m.name).take(5).toList(),
      pollutionLevel: pollution,
      summary: summary,
    );
  }

  Future<VerifyAggregate> compareAllAfterSlots(List<List<int>> afterCaptures) async {
    _assertCaptures(afterCaptures);
    final summary = await _family.fetchSummary();
    if (!summary.baselineReady) {
      throw OrchestratorException('baseline_not_ready');
    }

    final results = await Future.wait(
      List.generate(CleaningSlots.count, (i) async {
        final baselineUrl = summary.baselineUrls[i];
        if (baselineUrl == null || baselineUrl.isEmpty) {
          throw OrchestratorException('baseline_slot_$i');
        }
        final baselineBytes = await _cleaning.downloadBytes(baselineUrl);
        return _cleaning.compareWithBaseline(
          baselineBytes,
          afterCaptures[i],
          CleaningSlots.labels[i],
        );
      }),
    );

    if (results.every((r) => !_isGeminiResult(r.modelId))) {
      throw OrchestratorException('gemini_compare_failed');
    }

    final cleanliness = results.map((r) => r.cleanliness).reduce((a, b) => a < b ? a : b);
    final detail = [
      for (var i = 0; i < results.length; i++)
        '${CleaningSlots.labels[i]} ${results[i].cleanliness}점',
    ].join(' · ');
    final tail = results.last.comment;
    return VerifyAggregate(
      cleanliness: cleanliness,
      comment: 'baseline 비교 · $detail. $tail'.trim(),
      passScore: summary.passScore,
      baseCleanWon: summary.baseCleanWon,
      streakDays: summary.streakDays,
    );
  }

  void _assertCaptures(List<List<int>> captures) {
    if (captures.length != CleaningSlots.count) {
      throw OrchestratorException('slot_count');
    }
    for (var i = 0; i < captures.length; i++) {
      if (captures[i].isEmpty) {
        throw OrchestratorException('slot_empty_$i');
      }
    }
  }

  void close() {
    _cleaning.close();
    _family.close();
  }
}

class DirtyScanAggregate {
  DirtyScanAggregate({
    required this.questLabels,
    required this.pollutionLevel,
    required this.summary,
  });

  final List<String> questLabels;
  final int pollutionLevel;
  final String summary;
}

class VerifyAggregate {
  VerifyAggregate({
    required this.cleanliness,
    required this.comment,
    required this.passScore,
    required this.baseCleanWon,
    required this.streakDays,
  });

  final int cleanliness;
  final String comment;
  final int passScore;
  final int baseCleanWon;
  final int streakDays;

  bool get passed => cleanliness > 0 && cleanliness >= passScore;
}

class OrchestratorException implements Exception {
  OrchestratorException(this.code);
  final String code;

  String messageKo() {
    switch (code) {
      case 'baseline_not_ready':
        return '부모 baseline 3곳·AI 평가가 완료되지 않았습니다.';
      case 'gemini_scan_failed':
      case 'gemini_compare_failed':
        return 'Gemini AI에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.';
      default:
        return 'AI 평가에 실패했습니다 ($code)';
    }
  }
}
