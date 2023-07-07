import { Console } from 'console';
import { Gamestate, BotSelection } from '../models/gamestate';


class Bot {
    dynamites = 0;

    counts = {"P" : 0, "R" : 0, "S" : 0, "W" : 0, "D" : 0}
    weights = {"P" : 8, "R" : 8, "S" : 8, "W" : 0, "D" : 0}

    prevDynamite = 0;
    period = 0;
    washes = 0;
    ties = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        this.weights["D"] += 1/20;

        if (gamestate.rounds.length > 0) {
            let lastRound = gamestate.rounds.slice(-1)[0];

            let previousMove = lastRound['p2'];

            let count = 0;
            for (let key in this.counts) {
                count += this.counts[key];
            }

            if (previousMove == "P" && this.weights["R"] >= 1) {
                this.weights["R"] -= 3;
                this.weights["S"] += 3;
            } else if (previousMove == "R" && this.weights["S"] >= 1) {
                this.weights["S"] -= 3;
                this.weights["P"] += 3;
            } else if (previousMove == "S" && this.weights["P"] >= 1) {
                this.weights["P"] -= 3;
                this.weights["R"] += 3;
            } else if (previousMove == "D") { // average period between dynamites
                this.period = ((this.period * this.counts["D"]) + (gamestate.rounds.length - this.prevDynamite)) / (this.counts["D"] + 1);
                this.prevDynamite = gamestate.rounds.length;
                if (lastRound['p1'] == "W") {
                    this.washes += 1;
                }
            } else if (previousMove == "W") {
                this.weights["D"] = Math.max(this.weights["D"]-1,0);
            }

            if (this.period > 0 && this.counts["D"] > 0) {
                this.counts[previousMove] += 1;

                let phase = (gamestate.rounds.length + 1 + (this.period / 2)) % this.period;

                this.weights["W"] = Math.abs(1 / (1 - (2/this.period)*phase)) * (this.washes * 5 + this.counts["D"]);
            }

            
            /*if (Math.random() < 0.05) {
                console.log(this.weights["W"], phase - this.period/2, this.period, this.washes);
                console.log(this.weights);
            }*/
            if (gamestate.rounds.length == 1000) {
                //console.log(gamestate.rounds);
            }
            if (lastRound['p1'] == lastRound['p2']) {
                this.ties++;
                if (this.ties > 2) {
                    if (Math.random() < 0.2) {
                        return this.select("D");
                    }
                    switch (lastRound['p1']) {
                        case "R":
                            return "P";
                        case "P":
                            return "S";
                        case "S":
                            return "R";
                    }
                }
            } else {
                this.ties = 0;
            }
        }

        if (this.dynamites > 99) {
            this.weights["D"] = 0;
        }
        if (this.counts["D"] > 99) {
            this.weights["W"] = 0;
        }
        return this.select(this.chooseFromWeights(this.weights));
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
                //console.log("Boom");
                this.weights["D"] = 0;
                return "D"
            default:
                return null;
        }
    }
}

export = new Bot();