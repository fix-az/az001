import { Card } from './card.js';

export class Player {
  constructor(name, isHuman = false) {
    this.name = name;
    this.isHuman = isHuman;
    this.hand = [];
    this.winSets = []; // 存储胡过的牌组
  }

  addCard(card) {
    this.hand.push(card);
  }

  removeCard(index) {
    return this.hand.splice(index, 1)[0];
  }

  canPairWith(card1, card2) {
    return card1.pointValue + card2.pointValue === 14;
  }

  canAllCardsPairUp(cards) {
    if (cards.length % 2 !== 0) return false;
    const count = new Array(14).fill(0);
    cards.forEach(c => {
      if (c.pointValue >= 1 && c.pointValue <= 13) {
        count[c.pointValue]++;
      }
    });
    if (count[7] % 2 !== 0) return false;
    for (let i = 1; i <= 6; i++) {
      if (count[i] !== count[14 - i]) return false;
    }
    return true;
  }

  checkWin() {
    return this.canAllCardsPairUp(this.hand);
  }
}
