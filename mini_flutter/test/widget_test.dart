import 'package:chungsora_child/app.dart';
import 'package:chungsora_child/app_shell.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('앱 타이틀 표시', (tester) async {
    await tester.pumpWidget(const ChungsoraChildApp());
    expect(find.text('홈'), findsOneWidget);
  });
}
