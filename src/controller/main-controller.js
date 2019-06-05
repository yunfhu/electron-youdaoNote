const {
    BrowserWindow,
    session,
    shell
} = require('electron');
var log = require('electron-log');
const path = require('path');
const CssInjector = require('../js/css-injector');

class MainController {
    constructor() {
        this.init()
    }

    init() {
        this.window = new BrowserWindow({
            show: false,
            width: 400,
            height: 450,
            frame: true,
            autoHideMenuBar: true,
            resizable: false,
            icon: path.join(__dirname, '../../assets/icons/icon.png'),
            webPreferences: { webSecurity: false }
        })

        this.window.loadURL('https://note.youdao.com/web/')

        this.window.webContents.on('dom-ready', () => {
            this.window.webContents.insertCSS(CssInjector.login)
            this.window.webContents.insertCSS(CssInjector.main)
            this.reDrawLogin()
            this.addFontAwesomeCDN()
            this.changeTitle()
            this.addToggleContactElement()

            // this.addUnreadMessageListener()

            this.show()
        })

        // triggering when user try to close the play window.
        this.window.on('close', (e) => {
            if (this.window.isVisible()) {
                e.preventDefault()
                this.window.hide()
            }
        })
        //mainly for youdao cloud corporation
        this.window.webContents.on('new-window', (event, url, frameName, disposition, options) => {
            event.preventDefault()
            // console.log(url)
            if (url.startsWith("https://note.youdao.com/group/")) {
                const win = new BrowserWindow({
                    webContents: options.webContents, // use existing webContents if provided
                    autoHideMenuBar: true,
                    show: false
                })
                win.once('ready-to-show', () => win.show())
                if (!options.webContents) {
                    win.loadURL(url) // existing webContents will be navigated automatically
                }
                event.newGuest = win
            } else {
                shell.openExternal(url)
            }
        })

        session.defaultSession.webRequest.onCompleted({
            urls: [
                'https://note.youdao.com/login/acc/se/reset?app=web&product=YNOTE',
                'https://note.youdao.com/editor/collab/bulb.html',
            ]
        },
            (details) => this.handleRequest(details)
        )
    }

    show() {
        this.window.show()
        this.window.focus()
    }

    toggle() {
        if (this.window.isFocused()) {
            this.window.hide()
        } else {
            this.show()
        }
    }


    handleRequest(details) {
        // console.log(details.url)
        details.url.startsWith('https://note.youdao.com/editor/collab/bulb.html') && this.login()
        details.url.startsWith('https://note.youdao.com/login/acc/se/reset?app=web&product=YNOTE') && this.logout()
    }



    login() {
        if (!this.window.isResizable()) {
            this.window.hide()
            this.window.setSize(1000, 670, true)
            this.window.setResizable(true)
            this.window.show()
        }
    }

    logout() {
        this.window.setSize(900, 500, true)
        this.window.setResizable(false)
    }

    addFontAwesomeCDN() {
        this.window.webContents.executeJavaScript(`
            let faLink = document.createElement('link');
            faLink.setAttribute('rel', 'stylesheet');
            faLink.type = 'text/css';
            faLink.href = 'https://use.fontawesome.com/releases/v5.0.13/css/all.css';
            faLink.integrity = 'sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp';
            faLink.crossOrigin = 'anonymous';
            document.head.appendChild(faLink);
        `)
    }

    reDrawLogin() {
        this.window.webContents.executeJavaScript(`
          document.querySelector("body > div.bd > div.login-main").style.cssText="width: 400px;margin-top: 0px;box-shadow: white;"
          document.querySelector("body > div.hd").style.cssText="background-color: #fbfcfe"
          `)}

    changeTitle() {
        this.window.webContents.executeJavaScript(`
            document.title = '有道运笔记';
            new MutationObserver(mutations => {
                if (document.title !== '有道运笔记') {
                    document.title = '有道运笔记';
                }
            }).observe(document.querySelector('title'), {childList: true});
        `)
    }


    addToggleContactElement() {
        this.window.webContents.executeJavaScript(`
            let toggleButton = document.createElement('i');
            toggleButton.className = 'toggle_contact_button fas fa-angle-double-left';
            toggleButton.onclick = () => {
                toggleButton.classList.toggle('mini');
                document.querySelector('.panel').classList.toggle('mini');
            };
            let titleBar = document.querySelector('.header');
            titleBar.appendChild(toggleButton);
        `)
    }
}

module.exports = MainController