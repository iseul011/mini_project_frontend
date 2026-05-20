import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';
import 'session_store.dart';

class ShopReward {
  ShopReward({required this.id, required this.label, required this.won});
  final String id;
  final String label;
  final int won;

  factory ShopReward.fromJson(Map<String, dynamic> json) {
    return ShopReward(
      id: json['id']?.toString() ?? '',
      label: json['label'] as String? ?? '',
      won: (json['won'] as num?)?.toInt() ?? 0,
    );
  }

  int get costP => (won / 10).ceil();
}

class RewardsApi {
  RewardsApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<Map<String, String>> _headers() async {
    final token = await SessionStore.getDeviceToken();
    if (token == null) throw ApiException('not_paired');
    return {'Authorization': 'Bearer $token', 'Accept': 'application/json'};
  }

  Future<List<ShopReward>> fetchShopRewards() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/rewards/shop');
    final res = await _client.get(uri, headers: await _headers());
    if (res.statusCode != 200) throw ApiException('http_${res.statusCode}');
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return (body['rewards'] as List<dynamic>? ?? [])
        .map((e) => ShopReward.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  void close() => _client.close();
}
