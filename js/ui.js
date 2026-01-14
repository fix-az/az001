export class GameUI {
  constructor(game) {
    this.game = game;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.playerHandEl = document.getElementById('player-hand');
    this.opponents = [
      document.getElementById('player-1'),
      document.getElementById('player-2'),
      document.getElementById('player-3')
    ];
    this.discardPileEl = document.getElementById('discard-pile');
    this.messageEl = document.getElementById('game-message');
    this.winSetsEl = document.getElementById('win-sets');

    this.btnEat = document.getElementById('btn-eat');
    this.btnPassEat = document.getElementById('btn-pass-eat');
    this.btnPlay = document.getElementById('btn-play');
  }

  bindEvents() {
    this.btnEat.onclick = () => this.handleEat();
    this.btnPassEat.onclick = () => this.handlePassEat();
    this.btnPlay.onclick = () => this.handlePlay();
  }

  render() {
    this.renderPlayerHand();
    this.renderOpponents();
    this.updateButtons();
    this.updateMessage();
  }

  renderPlayerHand() {
    this.playerHandEl.innerHTML = '';
    const hand = this.game.players[0].hand;
    hand.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = `card ${['♥','♦'].includes(card.suit) ? 'red' : ''}`;
      el.textContent = `${card.suit}${card.point}`;
      el.onclick = () => {
        if (this.game.state === GameState.PLAYING && this.game.currentPlayer === 0) {
          this.selectedCardIndex = index;
          this.updateButtons();
        }
      };
      this.playerHandEl.appendChild(el);
    });
  }

  renderOpponents() {
    // 上家 (player 1)
    this.opponents[0].innerHTML = `<div>电脑1 (${this.game.players[1].hand.length}张)</div>`;
    for (let i = 0; i < this.game.players[1].hand.length; i++) {
      this.opponents[0].innerHTML += '<div class="card-placeholder"></div>';
    }

    // 左家 (player 2)
    this.opponents[1].innerHTML = `<div>电脑2 (${this.game.players[2].hand.length}张)</div>`;
    for (let i = 0; i < this.game.players[2].hand.length; i++) {
      this.opponents[1].innerHTML += '<div class="card-placeholder"></div>';
    }

    // 右家 (player 3)
    this.opponents[2].innerHTML = `<div>电脑3 (${this.game.players[3].hand.length}张)</div>`;
    for (let i = 0; i < this.game.players[3].hand.length; i++) {
      this.opponents[2].innerHTML += '<div class="card-placeholder"></div>';
    }
  }

  updateButtons() {
    const state = this.game.state;
    const currentPlayer = this.game.currentPlayer;
    const isMyTurn = (currentPlayer === 0);

    // 默认禁用
    this.btnEat.disabled = true;
    this.btnPassEat.disabled = true;
    this.btnPlay.disabled = true;

    if (state === GameState.EATING) {
      const eater = this.game.getCurrentEater();
      if (eater === 0) {
        this.btnEat.disabled = false;
        this.btnPassEat.disabled = false;
      }
    } else if (state === GameState.PLAYING && isMyTurn) {
      this.btnPlay.disabled = (this.selectedCardIndex === undefined);
    }
  }

  updateMessage() {
    let msg = '';
    if (this.game.state === GameState.EATING) {
      const eater = this.game.getCurrentEater();
      msg = `${this.game.players[eater].name} 请决定是否吃牌`;
    } else if (this.game.state === GameState.PLAYING && this.game.currentPlayer === 0) {
      msg = '请选择一张牌打出';
    } else if (this.game.state === GameState.DRAWING && this.game.currentPlayer === 0) {
      msg = '轮到你摸牌';
    }
    this.messageEl.textContent = msg;
  }

  handleEat() {
    const result = this.game.eatCard(0);
    if (result.success) {
      this.render();
      this.checkGameOver();
    }
  }

  handlePassEat() {
    const result = this.game.passEat(0);
    if (result.success) {
      if (result.action === 'next_eater') {
        // 轮到下家（AI）
        setTimeout(() => this.aiThink(), 500);
      } else if (result.action === 'all_passed') {
        this.game.currentPlayer = (this.game.currentPlayer + 1) % 4;
        this.render();
        if (this.game.currentPlayer !== 0) {
          setTimeout(() => this.aiThink(), 500);
        }
      }
    }
    this.render();
  }

  handlePlay() {
    if (this.selectedCardIndex === undefined) return;
    const result = this.game.playCard(0, this.selectedCardIndex);
    if (result.success) {
      if (result.win) {
        this.showWin(result.winner);
      } else {
        this.render();
        setTimeout(() => this.aiThink(), 500);
      }
    }
    this.selectedCardIndex = undefined;
  }

  aiThink() {
    let playerIndex = this.game.currentPlayer;
    while (playerIndex !== 0 && this.game.state !== GameState.GAME_OVER) {
      const player = this.game.players[playerIndex];
      if (this.game.state === GameState.DRAWING) {
        const drawResult = this.game.drawCard(playerIndex);
        if (!drawResult.success) break;
        // AI 决策吃不吃
        const aiAction = GameAI.decideAction(player, drawResult.drawnCard);
        if (aiAction.action === 'eat') {
          this.game.eatCard(playerIndex);
        } else {
          const passResult = this.game.passEat(playerIndex);
          if (passResult.action === 'next_eater') {
            // 下家也是AI，继续决策
            continue;
          } else {
            // 回合结束，切到下家
            playerIndex = (playerIndex + 1) % 4;
            this.game.currentPlayer = playerIndex;
          }
        }
      } else if (this.game.state === GameState.PLAYING) {
        const aiAction = GameAI.decideAction(player);
        const playResult = this.game.playCard(playerIndex, aiAction.cardIndex);
        if (playResult.win) {
          this.showWin(playerIndex);
          return;
        }
        playerIndex = this.game.currentPlayer;
      }
    }
    this.render();
  }

  showWin(winnerIndex) {
    const winner = this.game.players[winnerIndex];
    alert(`${winner.name} 胡牌了！`);
    // 渲染胡牌记录
    this.renderWinSet(winner);
    this.game.state = GameState.GAME_OVER;
  }

  renderWinSet(player) {
    if (player.winSets.length === 0) return;
    const lastSet = player.winSets[player.winSets.length - 1];
    const setEl = document.createElement('div');
    setEl.className = 'win-set';
    setEl.innerHTML = `
      <strong>${player.name}:</strong>
      ${lastSet.map(card => 
        `<span class="card small ${['♥','♦'].includes(card.suit)?'red':''}">${card.suit}${card.point}</span>`
      ).join('')}
    `;
    this.winSetsEl.appendChild(setEl);
    this.winSetsEl.scrollTop = this.winSetsEl.scrollHeight;
  }
}
