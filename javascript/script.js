
class Game {
    constructor(size, prob) {
        this.size = size;
        this.prob = prob;
        this.board = new Board(this.size, this.prob);
    }
}

class Board {
    constructor(size, prob) {
        this.size = size;
        this.prob = prob;
        this.fields = [];

        for (let i = 0; i < this.size; i++) {
            let fields_i = [];
            for (let j = 0; j < this.size; j++) {
                fields_i.push(new Field(i, j, Math.random() < this.prob));
            }
            this.fields.push(fields_i);
        }
    }

    getField(r, c) {
        let field = null;
        to1DArray(this.fields).forEach(f => {
            if (f.row == r && f.column == c) field = f;
        });
        return field;
    }

    getRow(index) {
        let row = [];
        to1DArray(this.fields).forEach(field => {
            if (field.row == index) row.push(field);
        })
        return row;
    }

    getColumn(index) {
        let column = [];
        to1DArray(this.fields).forEach(field => {
            if (field.column == index) column.push(field);
        })
        return column;
    }
}

class Field {
    constructor(row, column, legit) {
        this.row = row;
        this.column = column;
        this.clicked = false;
        this.legit = legit;
    }
}

function to1DArray(array) {
    return array.reduce((a,row) => [...a, ...row],[]);
}

let gameover = false;

function startGame() {
    gameover = false;
    let hasTable = document.querySelector("table");
    if (hasTable) hasTable.remove();
    let prob = document.getElementById("slider").value/100;
    let game = new Game(10, prob);
    
    let table = document.createElement("table");

    let firstRow = document.createElement("tr");
    let fc = document.createElement("td");
    firstRow.append(fc);
    for (let i = 0; i < game.size; i++) {
        let td = document.createElement("td");
        td.innerHTML = getColumnNumbers(game.board.getColumn(i));
        firstRow.append(td);
    }
    table.append(firstRow);

    for (let i = 0; i < game.size; i++) {
        let tr = document.createElement("tr");
        
        let firstCol = document.createElement("td");
        let rownumbers = getRowNumbers(game.board.getRow(i));
        firstCol.innerHTML = rownumbers;
        tr.append(firstCol);

        game.board.getRow(i).forEach(c => {
            let td = document.createElement("td");
            td.setAttribute("row", c.row);
            td.addEventListener('click', e => {
                openField(game, td);
            });
            td.setAttribute("column", c.column);
            td.className = "field";
            tr.append(td);
        })
        table.append(tr);
    }
    document.querySelector("div.container").append(table);
    
}

function openField(game, td) {
    let r = td.getAttribute("row"), c = td.getAttribute("column");
    to1DArray(game.board.fields).forEach(f => {
        if (f.row == r && f.column == c) {
            if (!gameover && !f.clicked) {
                setClicked(f, td);
                checkWin(game);
                checkRowComplete(game, td);
                checkColumnComplete(game, td);
            }
        }
    })
}

/*
    Is a column complete
*/
function checkColumnComplete(game, td) {
    let column = td.getAttribute("column");
    let col_fields = game.board.getColumn(column);

    let complete = true;
    col_fields.forEach(f => {
        if (f.legit && !f.clicked) complete = false;
    });

    if (complete) columnCompleteAnimation(game, td);
}

function columnCompleteAnimation(game, td) {
    let column = td.getAttribute("column");
    let col_fields = game.board.getColumn(column);
    let i = 0;
    let interval = setInterval(function () {
        if (i < col_fields.length) {
            fadeFieldAnimation(col_fields[i]);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

/*
    Is a row complete
*/
function checkRowComplete(game, td) {
    let row = td.getAttribute("row");
    let row_fields = game.board.getRow(row);

    let complete = true;
    row_fields.forEach(f => {
        if (f.legit && !f.clicked) complete = false;
    });

    if (complete) rowCompleteAnimation(game, td);
}

function rowCompleteAnimation(game, td) {
    let row = td.getAttribute("row");
    let row_fields = game.board.getRow(row);
    let i = 0;
    let interval = setInterval(function () {
        if (i < row_fields.length) {
            fadeFieldAnimation(row_fields[i]);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

function fadeFieldAnimation(field) {
    let r = field.row, c = field.column;
    let td = document.querySelector(`td.field[row="${r}"][column="${c}"]`);
    let opacity = 100;
    let interval = setInterval(function() {
        if (opacity >= 50) {
            td.style.opacity = opacity/100;
            opacity--;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function getRowNumbers(fields) {
    let numbers = [];
    let c = 0;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].legit) {
            c++;
            if (i == fields.length - 1) {
                numbers.push(c);
            }
        } else {
            if (i > 0 && c > 0) {
                numbers.push(c);
                c = 0;
            }
        }
    }
    let numberString = "";
    for (let i = 0; i < numbers.length; i++) {
        numberString += numbers[i] + " ";
    }

    return numberString;
}

function getColumnNumbers(fields) {
    let numbers = [];
    let c = 0;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].legit) {
            c++;
            if (i == fields.length - 1) {
                numbers.push(c);
            }
        } else {
            if (i > 0 && c > 0) {
                numbers.push(c);
                c = 0;
            }
        }
    }
    let numberString = "";
    for (let i = 0; i < numbers.length; i++) {
        numberString += numbers[i] + "<br>";
    }

    return numberString;
}

function setClicked(f, td) {
    f.clicked = true;
    if (f.legit) {
        startAnimation("legit", td);
    } else {
        gameover = true;
        startAnimation("fail", td);
    }
}

function checkWin(game) {
    let win = true;
    to1DArray(game.board.fields).forEach(f => {
        if (f.legit && !f.clicked) win = false;
    });

    if (win) {
        gameover = true;
        startEndAnimation(game);
    }
}

function startEndAnimation(game) {
    let fieldsList = document.querySelectorAll("td.field");
    fieldsList.forEach(f => {
        let r = f.getAttribute("row"), c = f.getAttribute("column");
        let field = game.board.getField(r, c);
        if (!field.legit) doAnimation(f);
    });
}

function doAnimation(field) {
    let rgb = 211;
    let interval = setInterval(() => {
        if (rgb < 255) {
            rgb++;
            field.style.backgroundColor = "rgb(" + rgb + ", " + rgb + ", " + rgb + ")";
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function startAnimation(classname, td) {
    td.classList = classname + " field";
    console.log(td.getAttribute("row"));
}

let slider = document.getElementById("slider");
let sliderValue = document.getElementById("sliderValue");
sliderValue.innerHTML = slider.value + "%";
function changeValue() {
    sliderValue.innerHTML = slider.value + "%";
}

startGame();