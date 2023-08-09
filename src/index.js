import './basestyle.css';
import './style.css';
import LogicController from './logic-controller';

const lc = LogicController();

window.addEventListener('restart_game', () => {
  window.location.reload();
});
