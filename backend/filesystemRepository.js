const fs = require("fs");
const path = require("path");

const initialGameState = {
  wins: 0,
  losses: 0,
  lastResult: null,
};

const GS_FILE = path.join(__dirname, "lucky_wheel_state.json");

/**
 * @function readGameState
 * @description reads current gs & returns it
 * @returns {Promise<GameState>}
 */
async function readGameState() {
  console.log(`filesystem.readGameState called`);
  try {
    //1. create file lucky_wheel_state.json if not exist and save initial gs in it
    if (!fs.existsSync(GS_FILE)) {
      saveGameState(initialGameState);
    }
    //2. read the file and save content in json object
    const data = fs.readFileSync(GS_FILE, "utf-8");
    const gsJson = JSON.parse(data);
    //3. return json object
    return gsJson;
  } catch (error) {
    console.error(`reading gs failed`, error);
  }
}

/**
 * @function saveGameState
 * @description saves gs to data source
 * @returns {Promise<void>}
 */
async function saveGameState(gs) {
  console.log(`filesystem.saveGameState called`);
  try {
    fs.writeFileSync(GS_FILE, JSON.stringify(gs, null, 2), "utf-8");
  } catch (error) {
    console.error(`saving gs failed`, error);
  }
}

/**
 * @function resetGameState
 * @description reset gs in data source to initial value
 * @returns {Promise<GameState>}
 */
async function resetGameState() {
  console.log(`filesystem.resetGameState called`);
  const newEmptyGs = { ...initialGameState };
  try {
    fs.writeFileSync(GS_FILE, JSON.stringify(newEmptyGs, null, 2), "utf-8");
    return newEmptyGs;
  } catch (error) {
    console.error(`resetting gs failed`, error);
    return initialGameState;
  }
}

module.exports = {
  readGameState,
  saveGameState,
  resetGameState,
};
