import './basestyle.css';
import './style.css';
import buildDom from './dom';
import Model from './models';

const dom = buildDom();
dom.buildPlayerBoard();
dom.buildOpponentBoard();

const model = Model();
model.renderTest();
