import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';
import 'child_http.dart';
import 'session_store.dart';

class FamilySummary {
  const FamilySummary({
    required this.childDisplayName,
    required this.pointsBalance,
    required this.baseCleanWon,
    required this.streakDays,
    required this.streakMult,
    required this.passScore,
    required this.baselineUrls,
    required this.baselineVerified,
    required this.todayScore,
  });

  final String childDisplayName;
  final int pointsBalance;
  final int baseCleanWon;
  final int streakDays;
  final double streakMult;
  final int passScore;
  final List<String?> baselineUrls;
  final bool baselineVerified;
  final int todayScore;

  factory FamilySummary.fromJson(Map<String, dynamic> json) {
    final rawUrls = json['baseline_urls'];
    List<String?> urls;
    if (rawUrls is List) {
      urls = rawUrls.map((e) => e?.toString()).toList();
    } else {
      urls = [];
    }
    while (urls.length < 3) {
      urls.add(null);
    }
    return FamilySummary(
      childDisplayName: json['child_display_name'] as String? ?? '자녀',
      pointsBalance: (json['points_balance'] as num?)?.toInt() ?? 0,
      baseCleanWon: (json['base_clean_won'] as num?)?.toInt() ?? 0,
      streakDays: (json['streak_days'] as num?)?.toInt() ?? 0,
      streakMult: (json['streak_mult'] as num?)?.toDouble() ?? 1.0,
      passScore: (json['pass_score'] as num?)?.toInt() ?? 70,
      baselineUrls: urls.take(3).toList(),
      baselineVerified: json['baseline_verified'] as bool? ?? false,
      todayScore: (json['today_score'] as num?)?.toInt() ?? 0,
    );
  }

  bool get baselineReady =>
      baselineVerified && baselineUrls.where((u) => u != null && u.isNotEmpty).length >= 3;
}

class FamilyApi {
  FamilyApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<FamilySummary> fetchSummary() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/family/summary');
    final res = await childAuthorizedRequest(
      (token) => _client.get(
        uri,
        headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
      ),
    );
    if (res.statusCode == 401) throw ApiException('unauthorized');
    if (res.statusCode != 200) throw ApiException('http_${res.statusCode}');
    return FamilySummary.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  void close() => _client.close();
}
