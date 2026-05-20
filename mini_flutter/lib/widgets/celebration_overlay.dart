import 'package:flutter/material.dart';

/// C-30e — 첫 로그 / unlock 축하 오버레이
class CelebrationOverlay extends StatelessWidget {
  const CelebrationOverlay({
    super.key,
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.onDismiss,
  });

  final String emoji;
  final String title;
  final String subtitle;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(emoji, style: const TextStyle(fontSize: 48)),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                style: const TextStyle(color: Color(0xFF828C94), fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: onDismiss,
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF00B8CF)),
                child: const Text('확인'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
