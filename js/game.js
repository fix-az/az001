import { Card } from './card.js';
import { Player } from './player.js';
import { GameAI } from './ai.js';

export const GameState = {
  DRAWING: 'drawing',
  EATING: 'eating',
  PLAYING: 'playing',
  DISCARDING: 'discarding',
  GAME_OVER: 'game_over'
};

export class PokerGame {
  constructor() {
    this.players = [
      new Player('玩家 (你)', true),
      new Player('电脑1'),
      new Player('电脑2'),
      new Player('电脑3')
    ];
    this.discardPile = [];
    this.deck = [];
    this.state = GameState.DRAWING;
    this.currentPlayer = 0;
    this.eatingPhase = null; // { drawnCard, validEaters: [p0, p1], currentIdx }
    this.initializeGame();
  }

  initializeGame() {
    this.deck = Card.createDeck();
    Card.shuffle(this.deck);
    // 发牌：每人3张
    for (let i = 0; i < 3; i++) {
      for (let p of this.players) {
        p.addCard(this.deck.pop());
      }
    }
  }

  drawCard(playerIndex) {
    if (this.deck.length === 0) return { success: false, message: "牌堆空了！" };
    const card = this.deck.pop();
    this.currentPlayer = playerIndex;

    // 设置吃牌权限：只有自己和下家
    const nextPlayer = (playerIndex + 1) % 4;
    this.eatingPhase = {
      drawnCard: card,
      validEaters: [playerIndex, nextPlayer],
      currentIdx: 0
    };
    this.state = GameState.EATING;

    return { success: true, drawnCard: card, eaterIndex: playerIndex };
  }

  passEat(playerIndex) {
    if (!this.eatingPhase || this.state !== GameState.EATING) return { success: false };
    const phase = this.eatingPhase;
    if (phase.validEaters[phase.currentIdx] !== playerIndex) {
      return { success: false, message: "不是你的回合！" };
    }

    const nextIdx = phase.currentIdx + 1;
    if (nextIdx >= phase.validEaters.length) {
      // 都不吃 → 弃牌
      this.discardPile.push(phase.drawnCard);
      this.eatingPhase = null;
      this.state = GameState.DISCARDING;
      return { success: true, action: 'all_passed' };
    } else {
      phase.currentIdx = nextIdx;
      return { success: true, action: 'next_eater', eater: phase.validEaters[nextIdx] };
    }
  }

  eatCard(playerIndex) {
    if (!this.eatingPhase || this.state !== GameState.EATING) return { success: false };
    const phase = this.eatingPhase;
    if (phase.validEaters[phase.currentIdx] !== playerIndex) {
      return { success: false, message: "你不能吃！" };
    }

    this.players[playerIndex].addCard(phase.drawnCard);
    this.eatingPhase = null;
    this.state = GameState.PLAYING;
    return { success: true };
  }

  playCard(playerIndex, cardIndex) {
    const player = this.players[playerIndex];
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      return { success: false, message: "无效牌索引" };
    }

    const card = player.removeCard(cardIndex);
    this.discardPile.push(card);

    // 检查是否胡牌
    if (player.checkWin()) {
      player.winSets.push([...player.hand, card]); // 记录胡牌组合
      this.state = GameState.GAME_OVER;
      return { success: true, win: true, winner: playerIndex };
    }

    // 切换到下家
    this.currentPlayer = (playerIndex + 1) % 4;
    this.state = GameState.DRAWING;
    return { success: true };
  }

  getCurrentEater() {
    return this.eatingPhase?.validEaters[this.eatingPhase.currentIdx];
  }
}
