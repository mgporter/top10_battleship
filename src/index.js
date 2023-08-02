import './basestyle.css';
import './style.css';
import buildDom from './dom';

const dom = buildDom();
dom.buildPlayerBoard();
dom.buildOpponentBoard();
