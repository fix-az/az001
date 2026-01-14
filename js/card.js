export class Card {
  constructor(suit, point) {
    this.suit = suit; // '♠', '♥', '♦', '♣'
    this.point = point; // 'A', '2'-'10', 'J', 'Q', 'K'
    this.pointValue = this.getPointValue(point);
  }

  getPointValue(pointStr) {
    const mapping = {
      'A': 1, '2':2, '3':3, '4':4, '5':5, '6':6,
      '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13
    };
    return mapping[pointStr] || 0;
  }

  static createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const points = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const deck = [];
    for (const suit of suits) {
      for (const point of points) {
        deck.push(new Card(suit, point));
      }
    }
    return deck;
  }

  static shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}
