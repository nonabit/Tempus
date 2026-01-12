import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  initDatabase,
  closeDatabase,
  getAllTimeEntries,
  getTimeEntryByDate,
  getTimeEntriesByMonth,
  upsertTimeEntry,
  deleteTimeEntry,
  importTimeEntries,
  getSetting,
  setSetting,
  getAllSettings,
  getAllAchievementProgress,
  saveAchievementProgress,
  getAchievementStats,
  saveAchievementStats,
  getPunchRecordsByDateRange,
  savePunchRecords,
  clearPunchRecords,
  exportAllData,
  importAllData,
  type TimeEntryRow,
  type AchievementProgressRow,
  type AchievementStatsRow,
  type PunchRecordRow
} from './database'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    title: 'Tempus',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 初始化数据库
  initDatabase()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册数据库 IPC 处理器
  registerDatabaseHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出时关闭数据库
app.on('will-quit', () => {
  closeDatabase()
})

// 注册数据库 IPC 处理器
function registerDatabaseHandlers(): void {
  // 工时记录
  ipcMain.handle('db:getAllTimeEntries', () => getAllTimeEntries())
  ipcMain.handle('db:getTimeEntryByDate', (_, date: string) => getTimeEntryByDate(date))
  ipcMain.handle('db:getTimeEntriesByMonth', (_, yearMonth: string) =>
    getTimeEntriesByMonth(yearMonth)
  )
  ipcMain.handle('db:upsertTimeEntry', (_, entry: TimeEntryRow) => upsertTimeEntry(entry))
  ipcMain.handle('db:deleteTimeEntry', (_, id: string) => deleteTimeEntry(id))
  ipcMain.handle('db:importTimeEntries', (_, entries: TimeEntryRow[]) => importTimeEntries(entries))

  // 设置
  ipcMain.handle('db:getSetting', (_, key: string) => getSetting(key))
  ipcMain.handle('db:setSetting', (_, key: string, value: string) => setSetting(key, value))
  ipcMain.handle('db:getAllSettings', () => getAllSettings())

  // 成就进度
  ipcMain.handle('db:getAllAchievementProgress', () => getAllAchievementProgress())
  ipcMain.handle('db:saveAchievementProgress', (_, progress: AchievementProgressRow) =>
    saveAchievementProgress(progress)
  )

  // 成就统计
  ipcMain.handle('db:getAchievementStats', () => getAchievementStats())
  ipcMain.handle('db:saveAchievementStats', (_, stats: AchievementStatsRow) =>
    saveAchievementStats(stats)
  )

  // 打卡记录
  ipcMain.handle('db:getPunchRecordsByDateRange', (_, startTime: number, endTime: number) =>
    getPunchRecordsByDateRange(startTime, endTime)
  )
  ipcMain.handle('db:savePunchRecords', (_, records: PunchRecordRow[]) => savePunchRecords(records))
  ipcMain.handle('db:clearPunchRecords', () => clearPunchRecords())

  // 数据导入/导出
  ipcMain.handle('db:exportAllData', () => exportAllData())
  ipcMain.handle('db:importAllData', (_, jsonString: string) => importAllData(jsonString))
}
