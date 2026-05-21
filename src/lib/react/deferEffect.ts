/** Effect 본문에서 setState 호출 시 react-hooks/set-state-in-effect 회피 */
export function deferEffect(fn: () => void) {
  queueMicrotask(fn);
}
