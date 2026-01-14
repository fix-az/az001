import { PokerGame } from './game.js';
import { GameUI } from './ui.js';

// 横屏检测
if (window.innerHeight > window.innerWidth) {
  alert("请将手机横过来玩，体验更佳！");
}

const game = new PokerGame();
const ui = new GameUI(game);

// 初始渲染
ui.render();

// 玩家摸牌（点击任意位置开始？或自动）
document.body.onclick = () => {
  if (game.state === GameState.DRAWING && game.currentPlayer === 0) {
    const result = game.drawCard(0);
    if (result.success) {
      ui.render();
    }
  }
};
