const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

// enable calls from different domain names
app.use(cors());
// use json formats
app.use(express.json());

const repo = require("./repository");

const wheelSegments = [
  { value: "Blank", weight: 10 },
  { value: "1000$", weight: 10 },
  { value: "5000$", weight: 80 },
];

// Pick a random value from wheelSegments based on it's weight
function spin() {
  try {
    const totalWeight = wheelSegments.reduce((sum, s) => sum + s.weight, 0);
    let randomNumber = Math.random() * totalWeight;
  
    for (const segment of wheelSegments) {
      randomNumber -= segment.weight;
      if (randomNumber <= 0) {
        return segment.value;
      }
    }
  } catch (error) {
    console.error(`spinning wheel failed`, error);
  }
}
// WoF REST Endpoints

app.get("/api", async (req, res) => {
  console.log(`BE REST Endpoint [/] called by client with IP [${req.id}]\n`);
  const gs = await repo.readGameState();
  res.json(gs);
});

app.post("/api/spin", async (req, res) => {
  console.log(`BE REST Endpoint [/spin] called by client with IP [${req.ip}]\n`);
  //1. get current gs
  const gs = await repo.readGameState();
  //2. spin (choose from wheelSegment array with 3 values, based on prob.) and save result
  const spinResult = spin();
  //3. update gs based on spin result
  if (spinResult === "Blank") {
    gs.losses++;
  } else {
    gs.wins++;
  }
  gs.lastResult = spinResult;
  //4. save updated gs
  repo.saveGameState(gs);
  //5. return updated gs
  res.json(gs);
});

app.post("/api/reset", async (req, res) => {
  console.log(`BE REST Endpoint [/reset] called by client with IP [${req.ip}]\n`);
  // 1. reset gs
  const newEmptyGs = await repo.resetGameState();
  // 3. return empty gs
  res.json(newEmptyGs);
});

app.listen(port, () => {
  console.log(`WoF backend running on ${port}`);
  repo.readGameState();
});
