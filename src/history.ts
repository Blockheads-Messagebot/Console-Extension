export default function history(input: HTMLInputElement) {
    let history: string[] = []
    let current = 0

    function addToHistory(message: string) {
        history.push(message)
        while (history.length > 100) {
            history.shift()
        }
        current = history.length
    }
    function addIfNew(message: string) {
        if (message != history.slice(-1).pop()) {
            addToHistory(message)
        } else {
            current = history.length
        }
    }

    input.addEventListener('keydown', event => {
        if (event.key == 'ArrowUp') {
            if (input.value.length && current == history.length) {
                addToHistory(input.value)
                current--
            }
            if (history.length && current) {
                input.value = history[--current]
            }
        } else if (event.key == 'ArrowDown') {
            if (history.length > current + 1) {
                input.value = history[++current]
            } else if (history.length == current + 1) {
                input.value = ''
                current = history.length
            }
        } else if (event.key == 'Enter') {
            addIfNew(input.value)
        }
    })
}
