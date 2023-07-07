import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    dynamites : number = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        let x = Math.random();
        let n = 3;

        if (x < 1 / n) {
            return "P";
        } else if (x < 2 / n) {
            return "R";
        } else if (x < 3 / n) {
            return "S";
        }
    }
}

export = new Bot();