import 'package:flutter/material.dart';

import '../services/lock_service.dart';
import 'cleaning_flow_screen.dart';
import 'lock_screen.dart';
import 'tabs/child_home_tab.dart';
import 'tabs/log_tab.dart';
import 'tabs/me_tab.dart';
import 'tabs/points_tab.dart';

/// Phase 6 — PWA 하단 탭 + 잠금 오버레이
class MainShell extends StatefulWidget {
  const MainShell({super.key, required this.lockService});

  final LockService lockService;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    widget.lockService.addListener(_onLock);
  }

  @override
  void dispose() {
    widget.lockService.removeListener(_onLock);
    super.dispose();
  }

  void _onLock() {
    if (mounted) setState(() {});
  }

  void _openCleaning() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CleaningFlowScreen(lockService: widget.lockService),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.lockService.uiLocked) {
      return LockScreen(
        lockService: widget.lockService,
        onStartCleaning: _openCleaning,
      );
    }

    final tabs = [
      ChildHomeTab(lockService: widget.lockService),
      const LogTab(),
      const PointsTab(),
      MeTab(lockService: widget.lockService),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: '홈'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: '로그'),
          NavigationDestination(icon: Text('P', style: TextStyle(fontWeight: FontWeight.bold)), label: 'P상점'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: '나'),
        ],
      ),
    );
  }
}
