import { Console } from 'console';
import { Gamestate, BotSelection } from '../models/gamestate';


class Bot {

    makeMove(gamestate: Gamestate): BotSelection {
        let phase = gamestate.rounds.length % 25;
        phase += 3;
        if (phase == 0) {
            return "D";
        } else {
            switch (phase % 3) {
                case 0:
                    return "R";
                case 1:
                    return "P";
                case 2:
                    return "S";
                default:
                    return "W";
            }
        }
    }
}

export = new Bot();