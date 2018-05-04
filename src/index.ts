import { MessageBot, Player } from '@bhmb/bot'
import { UIExtensionExports } from '@bhmb/ui'
import { history } from './history'

export interface ConsoleExtensionExports {
    log(message: string): void
}

import html from './tab.html'
import css from './style.css'

MessageBot.registerExtension('console', function(ex, world) {
    if (!ex.bot.getExports('ui')) {
        throw new Error('This extension should only be loaded in a browser, and must be loaded after the UI is loaded.')
    }
    const ui = ex.bot.getExports('ui') as UIExtensionExports

    // Create the tab.
    let style = document.head.appendChild(document.createElement('style'))
    style.textContent = css

    let tab = ui.addTab('Console')
    tab.innerHTML = html

    let chatUl = tab.querySelector('ul') as HTMLUListElement
    let chatContainer = chatUl.parentElement as HTMLDivElement
    let template = tab.querySelector('template') as HTMLTemplateElement

    // Handle sending
    let input = tab.querySelector('input') as HTMLInputElement
    function userSend() {
        ex.bot.send(input.value)
        input.value = ''
    }
    input.addEventListener('keyup', event => {
        if (event.key == 'Enter') {
            userSend()
        }
    })

    // History module, used to be a separate extension
    history(input);

    (tab.querySelector('button') as HTMLButtonElement).addEventListener('click', userSend)

    // Auto scroll when new chat is added to the page, unless we are scrolled up.
    new MutationObserver(function (events) {
        let total = chatUl.children.length

        // Determine how many messages have been added
        let addedHeight = 0
        for (let i = total - events.length; i < total; i++) {
            addedHeight += chatUl.children[i].clientHeight
        }

        // If we were scrolled down already, stay scrolled down
        if (chatContainer.scrollHeight - chatContainer.clientHeight - chatContainer.scrollTop == addedHeight) {
            chatContainer.scrollTop = chatContainer.scrollHeight
        }

        // Remove old messages if necessary
        while (chatUl.children.length > 500) {
            chatUl.children[0].remove()
        }
    }).observe(chatUl, { childList: true, subtree: true })

    // Add a message to the page
    function addPlayerMessage(player: Player, message: string): void {
        if (!message.length) return

        let messageClass = 'player'
        if (player.isAdmin) messageClass = 'admin'
        if (player.isMod) messageClass = 'mod'

        ui.buildTemplate(template, chatUl, [
            { selector: 'li', 'class': messageClass },
            { selector: 'span:first-child', text: player.name },
            { selector: 'span:last-child', text: ': ' + message }
        ])
    }
    function addGenericMessage(message: string): void {
        if (!message.length) return

        let li = document.createElement('li')
        li.textContent = message
        chatUl.appendChild(li)
    }

    // Export required functions
    let consoleExports: ConsoleExtensionExports = {
        log: (message: string) => addPlayerMessage(world.getPlayer('SERVER'), message)
    }
    ex.exports = consoleExports

    function logJoins(player: Player) {
        if (ex.storage.get('logJoinIps', true)) {
            consoleExports.log(`${player.name} (${player.ip}) joined.`)
        } else {
            consoleExports.log(`${player.name} joined.`)
        }

    }
    world.onJoin.sub(logJoins)

    function logLeaves(player: Player) {
        consoleExports.log(player.name + ' left')
    }
    world.onLeave.sub(logLeaves)

    function logMessages({ player, message }: { player: Player, message: string }) {
        addPlayerMessage(player, message)
    }
    world.onMessage.sub(logMessages)

    function logOther(message: string) {
        if (ex.storage.get('logUnparsedMessages', true)) {
            addGenericMessage(message)
        }
    }
    world.onOther.sub(logOther)

    ex.remove = function () {
        ui.removeTab(tab)
        style.remove()
        world.onJoin.unsub(logJoins)
        world.onLeave.unsub(logLeaves)
        world.onMessage.unsub(logMessages)
        world.onOther.unsub(logOther)
    }
})
