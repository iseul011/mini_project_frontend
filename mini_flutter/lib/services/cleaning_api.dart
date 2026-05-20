import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../config/api_config.dart';
import 'api_exception.dart';
import 'session_store.dart';

const _aiTimeout = Duration(seconds: 120);

class ScanResult {
  ScanResult({
    required this.monsters,
    required this.pollutionLevel,
    required this.summary,
    this.modelId,
  });

  final List<AiMonster> monsters;
  final int pollutionLevel;
  final String summary;
  final String? modelId;

  factory ScanResult.fromJson(Map<String, dynamic> json) {
    final monsters = (json['monsters'] as List<dynamic>? ?? [])
        .map((e) => AiMonster.fromJson(e as Map<String, dynamic>))
        .toList();
    return ScanResult(
      monsters: monsters,
      pollutionLevel: (json['pollution_level'] as num?)?.toInt() ?? 50,
      summary: json['summary'] as String? ?? '',
      modelId: json['model_id'] as String?,
    );
  }
}

class AiMonster {
  AiMonster({required this.id, required this.name});
  final String id;
  final String name;

  factory AiMonster.fromJson(Map<String, dynamic> json) {
    return AiMonster(
      id: json['id'] as String? ?? 'clutter',
      name: json['name'] as String? ?? '먼지',
    );
  }
}

class VerifyResult {
  VerifyResult({
    required this.cleanliness,
    required this.comment,
    this.modelId,
  });

  final int cleanliness;
  final String comment;
  final String? modelId;

  factory VerifyResult.fromJson(Map<String, dynamic> json) {
    return VerifyResult(
      cleanliness: (json['cleanliness'] as num?)?.toInt() ?? 0,
      comment: json['comment'] as String? ?? '',
      modelId: json['model_id'] as String?,
    );
  }
}

class CleaningApi {
  CleaningApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<ScanResult> scanRoom(List<int> imageBytes, String roomName) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/cleaning/scan');
    final request = http.MultipartRequest('POST', uri)
      ..fields['room_id'] = 'room-1'
      ..fields['room_name'] = roomName
      ..files.add(
        http.MultipartFile.fromBytes(
          'file',
          imageBytes,
          filename: 'scan.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      );
    return _postMultipart(request, ScanResult.fromJson);
  }

  Future<VerifyResult> compareWithBaseline(
    List<int> baselineBytes,
    List<int> afterBytes,
    String slotLabel,
  ) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/cleaning/compare-baseline');
    final request = http.MultipartRequest('POST', uri)
      ..fields['slot_label'] = slotLabel
      ..files.addAll([
        http.MultipartFile.fromBytes(
          'baseline_file',
          baselineBytes,
          filename: 'baseline.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
        http.MultipartFile.fromBytes(
          'after_file',
          afterBytes,
          filename: 'after.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      ]);
    return _postMultipart(request, VerifyResult.fromJson);
  }

  Future<void> uploadLogPhoto({
    required String date,
    required String phase,
    required int slot,
    required List<int> bytes,
  }) async {
    final token = await SessionStore.getDeviceToken();
    if (token == null) throw ApiException('not_paired');

    final uri = Uri.parse(
      '${ApiConfig.baseUrl}/api/v1/logs/$date/photos?phase=$phase&slot=$slot',
    );
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $token'
      ..files.add(
        http.MultipartFile.fromBytes(
          'file',
          bytes,
          filename: '$phase$slot.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      );
    final streamed = await request.send().timeout(_aiTimeout);
    final body = await http.Response.fromStream(streamed);
    if (body.statusCode != 200) {
      throw ApiException('upload_${body.statusCode}');
    }
  }

  Future<void> patchLogMeta({
    required String date,
    required int score,
    required int streakDays,
  }) async {
    final token = await SessionStore.getDeviceToken();
    if (token == null) throw ApiException('not_paired');

    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/logs/$date');
    final res = await _client.patch(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'score': score, 'streak_days': streakDays}),
    );
    if (res.statusCode != 200) throw ApiException('patch_${res.statusCode}');
  }

  Future<List<int>> downloadBytes(String urlOrPath) async {
    final url = urlOrPath.startsWith('http')
        ? urlOrPath
        : '${ApiConfig.baseUrl}$urlOrPath';
    final res = await _client.get(Uri.parse(url)).timeout(_aiTimeout);
    if (res.statusCode != 200) throw ApiException('download_${res.statusCode}');
    return res.bodyBytes;
  }

  Future<T> _postMultipart<T>(
    http.MultipartRequest request,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    final streamed = await request.send().timeout(_aiTimeout);
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode != 200) {
      throw ApiException('http_${res.statusCode}');
    }
    return fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  void close() => _client.close();
}
