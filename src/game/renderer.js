const {ipcRenderer} = require("electron");

const Types = require("../Types");
const Game = require("./core/Game");
const {startGameBtn, resultPlaceholder} = require("./elems");
const initRecorder = require("./screen-recorder");

const levelTypeElem = document.getElementById("level-type");

const init = level => {
    levelTypeElem.innerText = level;
    initRecorder();
    startGameBtn
        .addEventListener("click", e => {
            e.currentTarget.classList.add("d-none");
            resultPlaceholder.className = "result-placeholder d-none";
            resultPlaceholder.innerText = "";
            new Game(level).init();
        });
};

const level = localStorage.getItem("level");

if (level) {
    init(level);
} else {
    ipcRenderer.on(Types.GAME_INIT, (e, {level}) => {
        localStorage.setItem("level", level);
        init(level);
    });
}