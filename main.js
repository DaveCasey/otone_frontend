if (require('electron-squirrel-startup')) return;
const $ = jQuery = require('jquery')
const http       = require('http')
, CLogger  = require('node-clogger')
const path = require('path')
const nightlife  = require('nightlife-rabbit')
    , autobahn = require('autobahn')
const child_process = require("child_process")
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let backendProcess = undefined

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 1200, height: 900})
  mainWindow.loadURL("file://" + __dirname + "/src/index.html")

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null

    if (backendProcess){
      try {
        if (process.platform == "darwin") {
          backendProcess.kill()
        } else if (process.platform == "win32") {
          child_process.spawn('taskkill', ['/pid', backendProcess.pid, '/T', '/F'])
        }
        console.log('************** KILLED BACKEND ****************')
      }
      catch(e){
        console.log(e)
      }
    }

    app.quit()
  })
}

function startWampRouter() {
    var router = nightlife.createRouter({
        httpServer: http.createServer(),
        port: 8080,
        path: '/ws',
        autoCreateRealms: true,
        logger: new CLogger({name: 'nightlife-router'})
    });
}

function startBackend() {
  if (process.platform == "darwin") {
    backendProcess = child_process.exec(app.getAppPath() + "/backend-dist/mac/otone_client " + app.getAppPath());
  } else if (process.platform == "win32") {
    backendProcess = child_process.spawn(app.getAppPath() + "\\backend-dist\\win\\otone_client.exe ", [app.getAppPath()]);
  }
}

app.on('ready', createWindow)
app.on('ready', startWampRouter)
app.on('ready', startBackend)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
