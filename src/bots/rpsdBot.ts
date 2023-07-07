import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    dynamites = 0;
    count = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        let x = Math.random();
        let n = 3;
        this.count += 1;

        if (this.count == 25 && this.dynamites < 100) {
            this.count = 0;
            this.dynamites++;
            return "D";
        }

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