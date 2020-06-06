const { ipcRenderer } = require("electron");

const config = require("../config");
const Types = require("../Types");

const levelsList = document.getElementById("levels");

localStorage.removeItem("level");

levelsList.innerHTML += config.map(({ type }) => `<li data-level="${type}" class="level ${type.toLowerCase()}">${type}</li>`).join("");

levelsList.addEventListener("click", e => {
    if(e.target === e.currentTarget) return;
    const { level } = e.target.dataset;
    ipcRenderer.send(Types.LEVEL_SELECTED, { level });
});