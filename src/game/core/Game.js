const config = require("../../config");
const Entity = require("./Entity");
const { startGameBtn, resultPlaceholder } = require("../elems");

class Game {
    constructor(level) {
        const currConfig = config.find(c => c.type === level);
        this.matrixConfig = currConfig.matrix;
        this.delay = currConfig.delay;
        this.matrixPlaceholderElem = document.getElementById("matrix-placeholder");
        this.matrix = [];
        this.timeout = null;
        this.settedEntities = {
            [Entity.Success]: 0,
            [Entity.Failed]: 0
        };
    }

    init() {
        this.initMatrix();
        this.initListeners();
        this.startTimer();
    }

    initMatrix() {
        const process = new Array(this.matrixConfig);
        process.fill(0);
        this.matrixPlaceholderElem.classList.remove("d-none");
        this.matrixPlaceholderElem.innerHTML = (
            process.map((_, i) => {
                const row = [];
                const template = `
                    <div class="row">
                        ${
                            process.map((_, j) => {
                                row.push(Entity.Empty);
                                return `<div class="column" data-row="${i}" data-column="${j}"></div>`
                            }).join("")
                         }
                    </div>
                `;
                this.matrix.push(row);
                return template;
            }).join("")
        );
    }

    initListeners() {
        this.matrixPlaceholderElem.onclick = e => {
            if(!e.target.classList.contains("column")) return;
            const { row, column } = e.target.dataset;
            const entity = this.getEntity(row, column);
            const setEntity = entity => this.setEntity(entity, row, column);
            switch (entity) {
                case Entity.Active:
                    return setEntity(Entity.Success);
                case Entity.Success:
                case Entity.Failed:
                    return;
                case Entity.Empty:
                    return setEntity(Entity.Failed);
            }
        };
    }

    startTimer() {
        const { rowIndex, columnIndex } = this.getRandomColumn();
        const setEntity = entity => this.setEntity(entity, rowIndex, columnIndex);
        setEntity(Entity.Active);
        this.timeout = setTimeout(() => {
            if(this.getEntity(rowIndex, columnIndex) !== Entity.Success) setEntity(Entity.Failed);
            this.startTimer.call(this);
        }, this.delay);
    }

    getRandomColumn() {
        const empty = this.matrix.reduce((acc, row, rowIndex) => {
            const emptyColumns = (
                row
                    .map((column, columnIndex) => [column, columnIndex])
                    .filter(([column]) => column === Entity.Empty)
                    .map(([, columnIndex]) => ({ rowIndex, columnIndex }))
            );
            return [...acc, ...emptyColumns];
        }, []);
        return empty[Math.floor(Math.random() * empty.length)];
    }

    setEntity(entity, rowIndex, columnIndex) {
        this.matrix[rowIndex][columnIndex] = entity;
        this.syncMatrix();
        if(this.settedEntities[entity] !== void 0) {
            this.settedEntities[entity] += 1;
            const finished = Object.entries(this.settedEntities).find(([, count]) => this.isGameFinished(count));
            if(finished) {
                const [entity] = finished;
                return entity == Entity.Success ? this.handleWin() : this.handleLoose();
            }
        }
    }

    isGameFinished(count) {
        return count >= ((this.matrixConfig ** 2) / 2) + 1;
    }

    handleWin() {
        resultPlaceholder.classList.add("win");
        resultPlaceholder.innerText = "Win!!!!";
        this.cleanUp();
    }

    handleLoose() {
        resultPlaceholder.classList.add("loose");
        resultPlaceholder.innerText = "Loose((((";
        this.cleanUp();
    }

    cleanUp() {
        clearTimeout(this.timeout);
        this.timeout = null;
        this.matrixPlaceholderElem.innerHTML = "";
        this.matrixPlaceholderElem.classList.add("d-none");
        startGameBtn.classList.remove("d-none");
    }

    getEntity(rowIndex, columnIndex) {
        return this.matrix[rowIndex][columnIndex];
    }

    syncMatrix() {
        this.matrix.forEach((row, rowIndex) => {
            row.forEach((column, columnIndex) => {
                if(column === Entity.Empty) return;
                const elem = document.querySelector(`.column[data-row="${rowIndex}"][data-column="${columnIndex}"]`);
                const [key] = Object.entries(Entity).find(([, value]) => column === value);
                const className = key.toLowerCase();
                if(!elem.classList.contains(className)) elem.classList.add(className);
            });
        })
    }
}

module.exports = Game;