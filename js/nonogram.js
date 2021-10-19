// global variables for game state, timer start time and timer interval
let gameover, mistakes, start_time, timer, drawing

// reset game
function reset() {
    // reset variables
    gameover = false
    mistakes = 0

    // reset mistakes text
    mistakes_label.innerText = mistakes
    mistakes_label.classList.remove('notzero')

    // hide win message
    win_label.classList.remove('active')

    // clear board
    document.querySelector('game').className = ''
    document.querySelectorAll('game>*').forEach(e => e.remove())

    // set size
    let size = parseInt(size_slider.value)

    // create data
    let data = new Array(size).fill(new Array(size).fill(0)).map(r => r.map(c => Math.random() < chance_slider.value / 100))

    // create table
    let table = document.createElement('table')

    // inject first row (for column headers)
    let first_row = document.createElement('tr')
    first_row.append(document.createElement('td'))
    for (let x = 0; x < size; x++) {
        let f = document.createElement('td')
        f.innerHTML = [...data].reduce((a, b) => [...a, ...b], [])
            .filter((e, i) => i % size === x)
            .reduce((a, b) => b ? a + '1' : a + '0', '')
            .split('0').map(f => f.length).filter(f => f != 0).join('<br>')
        first_row.append(f)
    }
    table.append(first_row)

    // set field borders every n fields
    let division = size < 6 ? null : size == 6 ? 3 : [7, 8].includes(size) ? 4 : 5

    // inject rows with fields
    for (let y = 0; y < size; y++) {
        // first field of row is header
        let tr = document.createElement('tr')
        tr.append(document.createElement('td'))

        for (let x = 0; x < size; x++) {
            let f = document.createElement('td')
            f.setAttribute('y', y)
            f.setAttribute('x', x)
            f.setAttribute('complete', false)
            f.setAttribute('clicked', false)
            f.setAttribute('legit', data[y][x])
            f.addEventListener('contextmenu', e => {
                e.preventDefault()
            })
            f.addEventListener('mouseenter', e => {
                if (drawing !== false && [0, 1].includes(drawing)) open_field(f, drawing)
            })
            f.addEventListener('mousedown', e => {
                if ([0, 2].includes(e.button)) {
                    drawing = e.button == 0 ? 0 : 1
                    open_field(e.target, drawing)
                }
            })
            f.className = 'field'
            if (division) {
                if (x % division == division - 1) f.classList.add('divider', 'r')
                else if (x % division == 0) f.classList.add('divider', 'l')

                if (y % division == division - 1) f.classList.add('divider', 'b')
                else if (y % division == 0) f.classList.add('divider', 't')
            }
            tr.append(f)
        }
        table.append(tr)
    }

    // inject table into container
    document.querySelector('game').append(table)

    // set number tips in rows
    document.querySelectorAll('tr:not(:first-of-type) td:first-of-type').forEach((f, y) => {
        f.innerHTML = data[y]
            .reduce((a, b) => b ? a + '1' : a + '0', '')
            .split('0').map(f => f.length).filter(f => f != 0).join(' ')
    })

    // re-center table
    table.style.paddingRight = `${document.querySelector('td').offsetWidth / 2}px`

    // start timer
    if (timer) clearInterval(timer)
    start_time = new Date().getTime()
    timer = setInterval(() => {
        let t = new Date().getTime() - start_time
        let h = Math.floor(t / 3600000)
        h = h.toString().length == 1 ? '0' + h : h
        t -= h * 3600000
        let m = Math.floor(t / 60000)
        m = m.toString().length == 1 ? '0' + m : m
        t -= m * 60000
        let s = Math.floor(t / 1000)
        s = s.toString().length == 1 ? '0' + s : s
        t -= s * 1000

        timer_label.innerText = `${h}:${m}:${s}`
    }, 100)
}

// evaluate a click on a field
// left click: n=0, right click: n=1
function open_field(f, n) {
    if (!gameover && !f.classList.contains('fail') && f.getAttribute('clicked') == 'false' && f.getAttribute('complete') == 'false') {
        // check if counts as mistake
        if (n == 0 && f.getAttribute('legit') == 'true' || n == 1 && f.getAttribute('legit') == 'false') {
            // set field to clicked and completed
            f.setAttribute('clicked', 'true')
            if (n == 0) f.classList.add('legit')

            // check if won
            if (document.querySelectorAll(`td.field[legit = 'true'][clicked = 'false']`).length == 0) {
                // stop timer
                clearInterval(timer)

                // clear remaining tiles
                document.querySelectorAll(`field`).forEach(e => {
                    if (e.getAttribute('complete') == 'false' && e.getAttribute('clicked') == false) e.style.animationDelay = `${Math.random().toFixed(2)}s`
                    else e.style.animationDelay = null
                })

                // add gameover class
                document.querySelector('game').classList.add('gameover')

                // game over
                gameover = true

                // show win message
                win_label.classList.add('active')
            } else {
                // play animation if row complete
                if (document.querySelectorAll(`td.field[y='${f.getAttribute('y')}'][legit='true'][clicked='false']`).length == 0) {
                    let row = document.querySelectorAll(`td.field[y='${f.getAttribute('y')}']`)
                    row.forEach((e, x) => {
                        e.setAttribute('complete', 'false')
                        e.style.animationDelay = `${x / (row.length - 1)}s`
                        e.setAttribute('complete', 'true')
                    })
                }

                // play animation if column complete
                if (document.querySelectorAll(`td.field[x='${f.getAttribute('x')}'][legit='true'][clicked='false']`).length == 0) {
                    let col = document.querySelectorAll(`td.field[x='${f.getAttribute('x')}']`)
                    col.forEach((e, y) => {
                        e.setAttribute('complete', 'false')
                        e.style.animationDelay = `${y / (col.length - 1)}s`
                        e.setAttribute('complete', 'true')
                    })
                }
            }
        } else {
            mistakes++
            mistakes_label.innerText = mistakes
            mistakes_label.classList.add('notzero')
            f.classList.add('fail')
            setTimeout(() => f.classList.remove('fail'), 1000)
        }
    }
}

// timer text
let timer_label = document.querySelector('#time_label span')

// chance slider
let chance_slider = document.querySelector('#chance_slider')
chance_slider.addEventListener('input', e => chance_label.innerText = `Chance: ${chance_slider.value}% `)

// size slider
let size_slider = document.querySelector('#size_slider')
size_slider.addEventListener('input', e => size_label.innerText = `Size: ${size_slider.value}x${size_slider.value} `)

// chance label
let chance_label = document.querySelector('#chance_label')
chance_label.innerText = `Chance: ${chance_slider.value}% `

// size label
let size_label = document.querySelector('#size_label')
size_label.innerText = `Size: ${size_slider.value}x${size_slider.value} `

// mistakes label
let mistakes_label = document.querySelector('#mistakes_label span')

// win label
let win_label = document.querySelector('#win_label')

// reset button
document.querySelector('#reset_btn').addEventListener('click', reset)

// on mouseup in window, set drawing to null
window.addEventListener('mouseup', e => drawing = null)

// start
reset()