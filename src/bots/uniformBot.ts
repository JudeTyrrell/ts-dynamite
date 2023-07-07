import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    dynamites : number = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        let x = Math.random();
        let n = this.dynamites >= 100 ? 4 : 5;

        if (x < 1 / n) {
            return "P";
        } else if (x < 2 / n) {
            return "R";
        } else if (x < 3 / n) {
            return "S";
        } else if (x < 4 / n) {
            return "W";
        } else if (x < 5 / n) {
            this.dynamites += 1;
            return "D";
        }
    }
}

export = new Bot();