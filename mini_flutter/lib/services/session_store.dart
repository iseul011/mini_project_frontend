import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/api_config.dart';

class SessionStore {
  static const _tokenKey = 'device_token';
  static const _deviceIdKey = 'device_id';
  static const _parentIdKey = 'parent_id';

  static Future<String?> getDeviceToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<bool> isPaired() async {
    final token = await getDeviceToken();
    return token != null && token.isNotEmpty;
  }

  static Future<void> savePairSession({
    required String deviceToken,
    required String deviceId,
    required int parentId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, deviceToken);
    await prefs.setString(_deviceIdKey, deviceId);
    await prefs.setInt(_parentIdKey, parentId);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_deviceIdKey);
    await prefs.remove(_parentIdKey);
  }
}

class PairService {
  PairService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<PairResult> verifyCode(String code) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/family/pair/verify');
    final res = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: jsonEncode({'code': code.trim().toUpperCase()}),
    );

    if (res.statusCode != 200) {
      return PairResult.fail('http_${res.statusCode}');
    }

    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (body['ok'] != true) {
      return PairResult.fail(body['reason'] as String? ?? 'invalid');
    }

    final token = body['device_token'] as String;
    final deviceId = body['device_id'] as String;
    final parentId = body['parent_account_id'] as int;

    await SessionStore.savePairSession(
      deviceToken: token,
      deviceId: deviceId,
      parentId: parentId,
    );

    return PairResult.ok(deviceId: deviceId, parentId: parentId);
  }

  void close() => _client.close();
}

class PairResult {
  const PairResult._({required this.ok, this.reason, this.deviceId, this.parentId});

  final bool ok;
  final String? reason;
  final String? deviceId;
  final int? parentId;

  factory PairResult.ok({required String deviceId, required int parentId}) =>
      PairResult._(ok: true, deviceId: deviceId, parentId: parentId);

  factory PairResult.fail(String reason) => PairResult._(ok: false, reason: reason);
}
