/// 청소 촬영 3슬롯 (PWA ghostSlots와 동일)
class CleaningSlots {
  CleaningSlots._();

  static const count = 3;
  static const labels = ['입구', '바닥', '책상'];
  static const roomId = 'room-1';
  static const roomNamePrefix = '지민 방';

  static String roomLabel(int index) => '$roomNamePrefix · ${labels[index]}';
}
