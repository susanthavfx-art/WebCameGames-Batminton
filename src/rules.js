export function hasWon(score, player, target) {
  const cap = target === 11 ? 15 : 30;
  return score[player] >= target && (score[player] - score[1 - player] >= 2 || score[player] >= cap);
}
