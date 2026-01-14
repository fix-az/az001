export class GameAI {
  static decideAction(player, drawnCard = null) {
    const hand = player.hand;

    // 如果刚摸牌，检查是否能吃
    if (drawnCard) {
      for (let i = 0; i < hand.length; i++) {
        if (hand[i].pointValue + drawnCard.pointValue === 14) {
          return { action: "eat" };
        }
      }
      return { action: "pass_eat" };
    }

    // 出牌策略：优先打7，其次打孤张
    let sevenIndex = -1;
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].pointValue === 7) {
        sevenIndex = i;
        break;
      }
    }
    if (sevenIndex !== -1 && hand.length > 2) {
      return { action: "play", cardIndex: sevenIndex };
    }

    // 否则随机出
    return { action: "play", cardIndex: Math.floor(Math.random() * hand.length) };
  }
}
