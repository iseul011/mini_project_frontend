import 'package:chungsora_child/services/points_api.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('calcCleaningPayout — streak 7일 1.5x', () {
    final p = PayoutCalc.calc(3000, 80, 7);
    expect(p.wonFromScore, 2400);
    expect(p.mult, 1.5);
    expect(p.finalWon, 3600);
    expect(p.finalP, 360);
  });
}
