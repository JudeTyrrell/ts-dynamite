import { Console } from 'console';
import { Gamestate, BotSelection } from '../models/gamestate';


class Bot {
    dynamites = 0;
    counts = {"P" : 0, "R" : 0, "S" : 0, "W" : 0, "D" : 0}
    weights = {"P" : 8, "R" : 8, "S" : 8, "W" : 1, "D" : 1}
    periodicity = 0

    makeMove(gamestate: Gamestate): BotSelection {

        if (gamestate.rounds.length > 0) {
            let lastRound = gamestate.rounds.slice(-1)[0];

            let previousMove = lastRound['p2'];
            this.counts[previousMove] += 1;

            if (previousMove == "D") {
                this.weights["W"] += 1;
            } else if (previousMove == "P") {
                this.weights["R"] -= 1;
                this.weights["S"] += 1;
            } else if (previousMove == "R") {
                this.weights["S"] -= 1;
                this.weights["P"] += 1;
            } else if (previousMove == "S") {
                this.weights["P"] -= 1;
                this.weights["R"] += 1;
            } else if (previousMove == "W") {
                this.weights["S"] += 1;
                this.weights["P"] += 1;
                this.weights["R"] += 1;
            }
        }

        if (this.dynamites > 99) {
            this.weights["D"] = 0;
        }
        if (this.counts["D"] > 99) {
            this.weights["W"] = 0;
        }
        return this.select(this.chooseFromDist(this.weights));
    }

    chooseFromWeights(weights : {[Key: string] : number}) {
        let x = Math.random();
        let curr = 0;
        let n = 0;

        for (let choice in weights) {
            n += weights[choice];
        }

        for (let choice in weights) {
            curr += weights[choice] / n;
            if (x < curr) {
                return choice;
            }
        }
    }

    chooseFromDist(dist : {[Key: string] : number}) {
        let x = Math.random();
        let curr = 0;

        for (let choice in dist) {
            curr += dist[choice];
            if (x < curr) {
                return choice;
            }
        }
    }

    select(s : string) : BotSelection {
        switch (s) {
            case "P":
                return "P"
            case "R":
                return "R"
            case "S":
                return "S"
            case "W":
                return "W"
            case "D":
                this.dynamites++;
                return "D"
        }
    }
}

export = new Bot();