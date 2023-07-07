import { Console } from 'console';
import { Gamestate, BotSelection } from '../models/gamestate';


class Bot {
    dynamites = 0;

    counts = {"P" : 0, "R" : 0, "S" : 0, "W" : 0, "D" : 0}
    weights = {"P" : 8, "R" : 8, "S" : 8, "W" : 0, "D" : 0}

    maxLength = 4;

    prevDynamite = 0;
    period = 0;
    washes = 0;
    ties = 0;

    makeMove(gamestate: Gamestate): BotSelection {
        this.weights["D"] += 1/20;

        let strings = this.roundsToStrings(gamestate.rounds);

        let enemyMoves = strings[1];
        //console.log(enemyMoves.slice(-1));
        let lengthCounts = {}

        for (let length = 1; length <= this.maxLength; length++) {
            if (enemyMoves.length >= length) {
                if (this.counts[enemyMoves.slice(-length)] == null) {
                    this.counts[enemyMoves.slice(-length)] = 0;
                }
                this.counts[enemyMoves.slice(-length)] += 1;
                if(lengthCounts[length] == null) {
                    lengthCounts[length] = 0;
                }
                lengthCounts[length]++;
            }
        }

        let prediction = {"P" : 1, "R" : 1, "S" : 1, "W" : 0, "D" : 0}

        for (let length = this.maxLength; length > 0; length--) {
            if (enemyMoves.length >= length) {
                for (let key in prediction) {
                    prediction[key] += (this.counts[enemyMoves.slice(-length-1) + key] ?? 0) / lengthCounts[length];
                }
                continue;
            }
        }

        

        if (gamestate.rounds.length > 0) {
            let lastRound = gamestate.rounds.slice(-1)[0];
            let previousMove = lastRound['p2'];
            if (previousMove == "D") { // average period between dynamites
                this.period = ((this.period * this.counts["D"]) + (gamestate.rounds.length - this.prevDynamite)) / (this.counts["D"] + 1);
                this.prevDynamite = gamestate.rounds.length;
            }
            
        }

        var items = Object.keys(prediction).map(function(key) {
        return [key, prediction[key]];
        });
        
        // Sort the array based on the second element
        items.sort(function(first, second) {
        return second[1] - first[1];
        });

        let confidence = items[1][1] / items[0][1];
        //console.log(items);
        if (confidence < 0.6) {
            this.weights["P"] = prediction["R"] * confidence;
            this.weights["R"] = prediction["S"] * confidence;
            this.weights["S"] = prediction["P"] * confidence;
            this.weights["W"] = prediction["D"] * confidence;
            //console.log("Based off pred.");
        } else {
            this.weights["P"] = this.counts["R"];
            this.weights["R"] = this.counts["S"];
            this.weights["S"] = this.counts["P"];
            this.weights["W"] = 0;
            
            if (gamestate.rounds.length > 0) {
                let lastRound = gamestate.rounds.slice(-1)[0];
                if (lastRound['p1'] == lastRound['p2']) {
                    this.ties++;
                    if (this.ties > 3) {
                        if (Math.random() < 0.2) {
                            return this.select("D");
                        }
                        switch (lastRound['p1']) {
                            case "R":
                                this.weights["P"] += 200;
                            case "P":
                                this.weights["R"] += 200;
                            case "S":
                                this.weights["S"] += 200;
                        }
                    }
                } else {
                    this.ties = 0;
                }

                if (this.period > 0 && this.counts["D"] > 0) {
                    this.counts[enemyMoves.slice(-1)] += 1;

                    let phase = (gamestate.rounds.length + 1 + (this.period / 2)) % this.period;

                    this.weights["W"] = Math.abs(1 / (1 - (2/this.period)*phase)) * (this.washes * 5 + this.counts["D"]);
                    this.weights["W"] = Math.min(1000, this.weights["W"]);
                }
            }
        }
        

        if (this.dynamites > 99) {
            this.weights["D"] = 0;
        }
        if (this.counts["D"] > 99) {
            this.weights["W"] = 0;
        }
        let choice = this.select(this.chooseFromWeights(this.weights));
        if (choice == null) {
            //console.log(this.weights);
        }
        //console.log(prediction);
        return choice;
    }

    chooseFromWeights(weights : {[Key: string] : number}) {
        let x = Math.random();
        let curr = 0;
        let n = 0;

        for (let choice in weights) {
            n += weights[choice];
        }
        if (n == 0) {
            for (let choice of ["R", "P", "S"]) {
                curr += 1 / 3;
                if (x < curr) {
                    return choice;
                }
            }
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

    roundsToStrings(rounds : {[Key: string] : string}[]) : string[] {
        if (rounds == null || rounds.length == 0) {
            return ["", ""];
        }
        let p1 = "";
        let p2 = "";

        for (let round of rounds) {
            p1 += round['p1'];
            p2 += round['p2'];
        }

        return [p1, p2];
    }
}

export = new Bot();