const {
    app,
    Menu,
    nativeImage,
    Tray,
    ipcMain
} = require('electron');
const path = require('path');

class AppTrayController {
    constructor(mainController) {
        this.mainController = mainController
        this.unreadType = 'none'
        this.platform = require('os').platform()
        this.init()
    }

    init() {
        this.tray = new Tray(this.createTrayIcon())
        this.tray.setToolTip('Wechat Desktop')

        const context = Menu.buildFromTemplate([{
                label: '显示主程序',
                click: () => this.mainController.toggle()
            },
            {
                label: '退出',
                click: () => this.cleanupAndExit()
            }
        ])

        this.tray.setContextMenu(context)

        this.tray.on('click', () => this.clickEvent())

    }

    clickEvent() {
        this.mainController.toggle()
    }

    createTrayIcon() {
        switch (this.platform) {
            case 'darwin':
                let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png'))
                trayIcon.setTemplateImage(true)
                return trayIcon
            default:
                return nativeImage.createFromPath(path.join(__dirname, '../../assets/original/icon.png'))
        }
    }


    cleanupAndExit() {
        app.exit(0);

    }
}

module.exports = AppTrayController