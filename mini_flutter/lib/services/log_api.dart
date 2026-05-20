import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';
import 'session_store.dart';

class LogMessage {
  LogMessage({
    required this.id,
    required this.role,
    required this.text,
    this.badge,
    this.at,
  });

  final String id;
  final String role;
  final String text;
  final String? badge;
  final String? at;

  factory LogMessage.fromJson(Map<String, dynamic> json) {
    return LogMessage(
      id: json['id']?.toString() ?? '',
      role: json['role'] as String? ?? 'child',
      text: json['text'] as String? ?? '',
      badge: json['badge'] as String?,
      at: json['at'] as String?,
    );
  }
}

class LogDetail {
  LogDetail({
    required this.date,
    required this.score,
    required this.streakDays,
    required this.messages,
    this.beforeUrl,
    this.afterUrl,
  });

  final String date;
  final int score;
  final int streakDays;
  final List<LogMessage> messages;
  final String? beforeUrl;
  final String? afterUrl;

  factory LogDetail.fromJson(Map<String, dynamic> json) {
    return LogDetail(
      date: json['date'] as String? ?? '',
      score: (json['score'] as num?)?.toInt() ?? 0,
      streakDays: (json['streak_days'] as num?)?.toInt() ?? 0,
      beforeUrl: json['before_url'] as String?,
      afterUrl: json['after_url'] as String?,
      messages: (json['messages'] as List<dynamic>? ?? [])
          .map((e) => LogMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class LogApi {
  LogApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<Map<String, String>> _headers() async {
    final token = await SessionStore.getDeviceToken();
    if (token == null) throw ApiException('not_paired');
    return {'Authorization': 'Bearer $token', 'Accept': 'application/json'};
  }

  Future<LogDetail> fetchDetail(String date) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/logs/$date');
    final res = await _client.get(uri, headers: await _headers());
    if (res.statusCode != 200) throw ApiException('http_${res.statusCode}');
    return LogDetail.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<LogMessage> postMessage({
    required String date,
    required String text,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/logs/$date/messages');
    final res = await _client.post(
      uri,
      headers: {
        ...(await _headers()),
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'role': 'child', 'text': text}),
    );
    if (res.statusCode != 200) throw ApiException('http_${res.statusCode}');
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return LogMessage.fromJson(body['message'] as Map<String, dynamic>);
  }

  void close() => _client.close();
}
