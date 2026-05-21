import 'package:flutter/foundation.dart';

class QuestItem {
  QuestItem({required this.id, required this.label, this.done = false});
  final String id;
  final String label;
  bool done;

  QuestItem copyWith({bool? done}) => QuestItem(id: id, label: label, done: done ?? this.done);
}

enum CleaningPhase { dirty, scanning, quest, after, verifying, result }

/// dirty → scan → quest → after → verify → result
class CleaningSession extends ChangeNotifier {
  CleaningPhase phase = CleaningPhase.dirty;
  int slotIndex = 0;
  final List<List<int>?> dirtyCaptures = [null, null, null];
  final List<List<int>?> afterCaptures = [null, null, null];

  List<QuestItem> questItems = [];
  int pollutionLevel = 0;
  String scanSummary = '';

  int cleanliness = 0;
  String verifyComment = '';
  int passScore = 70;
  int baseCleanWon = 0;
  int streakDays = 0;

  String? error;

  bool get allDirtyDone => dirtyCaptures.every((c) => c != null && c!.isNotEmpty);
  bool get allAfterDone => afterCaptures.every((c) => c != null && c!.isNotEmpty);
  bool get allQuestDone => questItems.isNotEmpty && questItems.every((q) => q.done);
  bool get passed => cleanliness > 0 && cleanliness >= passScore;

  void setCapture(CleaningPhase mode, int index, List<int> bytes) {
    if (mode == CleaningPhase.dirty) {
      dirtyCaptures[index] = bytes;
    } else {
      afterCaptures[index] = bytes;
    }
    notifyListeners();
  }

  void nextSlot() {
    if (slotIndex < 2) {
      slotIndex++;
      notifyListeners();
    }
  }

  void resetSlotIndex() {
    slotIndex = 0;
    notifyListeners();
  }

  void setPhase(CleaningPhase p) {
    phase = p;
    error = null;
    notifyListeners();
  }

  void setScanResult({
    required List<String> labels,
    required int pollution,
    required String summary,
  }) {
    questItems = [
      for (var i = 0; i < labels.length; i++)
        QuestItem(id: '${i + 1}', label: labels[i]),
    ];
    pollutionLevel = pollution;
    scanSummary = summary;
    phase = CleaningPhase.quest;
    notifyListeners();
  }

  void toggleQuest(String id) {
    questItems = questItems
        .map((q) => q.id == id ? q.copyWith(done: !q.done) : q)
        .toList();
    notifyListeners();
  }

  void setVerifyResult({
    required int score,
    required String comment,
    required int pass,
    required int baseWon,
    required int streak,
  }) {
    cleanliness = score;
    verifyComment = comment;
    passScore = pass;
    baseCleanWon = baseWon;
    streakDays = streak;
    phase = CleaningPhase.result;
    notifyListeners();
  }

  void setError(String msg) {
    error = msg;
    notifyListeners();
  }

  void clearError() {
    error = null;
    notifyListeners();
  }

  void reset() {
    phase = CleaningPhase.dirty;
    slotIndex = 0;
    for (var i = 0; i < 3; i++) {
      dirtyCaptures[i] = null;
      afterCaptures[i] = null;
    }
    questItems = [];
    pollutionLevel = 0;
    scanSummary = '';
    cleanliness = 0;
    verifyComment = '';
    error = null;
    notifyListeners();
  }
}

String todayLogDate() {
  final n = DateTime.now();
  return '${n.year}-${n.month.toString().padLeft(2, '0')}-${n.day.toString().padLeft(2, '0')}';
}
