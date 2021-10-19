const q = e => document.querySelector(e)
const qa = e => document.querySelectorAll(e)
const ce = e => document.createElement(e)
let cont = q`table`

let size = 5
let solution = []

// reset btn event listener
q`btn`.addEventListener('click', reset)

// reset size changer
q`input`.value = size
q`input`.addEventListener('change', e => size = e.target.value)

// procedurally inject
function reset() {
    // delete all children
    cont.querySelectorAll`*`.forEach(e => e.remove())

    // create solution
    solution = []
    for (let y = 0; y < size; y++) {
        let row = []
        for (let x = 0; x < size; x++) {
            row.push(Math.round(Math.random()))
        }
        solution.push(row)
    }

    // create hints
    let rowhints = [...solution].map(e =>
        e.reduce((a, b) => {
            if (b == 1) {
                if (a[a.length - 1] == -1) a.push(1)
                else a[a.length - 1]++
            } else a.push(-1)
            return a
        }, [-1]).filter(e => e != -1)
    )

    let colhints = []
    for (let x = 0; x < size; x++) {
        let a = [-1]
        for (let y = 0; y < size; y++) {
            let b = solution[y][x]
            if (b == 1) {
                if (a[a.length - 1] == -1) a.push(1)
                else a[a.length - 1]++
            } else a.push(-1)
        }
        colhints.push(a.filter(e => e != -1))
    }

    // append col hint header
    let hheader = ce`tr`
    hheader.append(ce`th`)
    for (let xhint of colhints) {
        let th = ce`th`
        th.scope = 'col'
        th.innerHTML = xhint.join('<br/>') || '—'
        hheader.append(th)
    }

    cont.append(hheader)

    // append rows
    for (let y = 0; y < size; y++) {
        let tr = ce('tr')

        // append hints
        let th = ce('th')
        th.scope = 'row'
        th.innerText = rowhints[y].join`,` || '—'
        tr.append(th)

        // append fields
        for (let x = 0; x < size; x++) {
            let td = ce('td')
            td.setAttribute('x', x)
            td.setAttribute('y', y)
            td.setAttribute('v', 0)
            td.addEventListener('click', e => cell_click(e, 1, e.target))
            td.addEventListener('contextmenu', e => cell_click(e, 2, e.target))
            tr.append(td)
        }

        cont.append(tr)
    }
}

function cell_click(e, v, cell) {
    e.preventDefault()
    if (cell.getAttribute('v') == 0 && !cont.classList.contains('won')) {
        let x = cell.getAttribute('x'), y = cell.getAttribute('y')
        if (v % 2 != solution[y][x]) cell.classList.add('error')
        cell.setAttribute('v', solution[y][x] + 1)
    }

    // check if won
    if (qa`td[v='0']`.length == 0) cont.classList.add('won')
    return false
}

reset()