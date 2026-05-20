import 'package:flutter/material.dart';

import 'screens/main_shell.dart';
import 'services/lock_service.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  late final LockService _lockService;

  @override
  void initState() {
    super.initState();
    _lockService = LockService();
    _lockService.start();
  }

  @override
  void dispose() {
    _lockService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MainShell(lockService: _lockService);
  }
}
