# Tavern Backup Assistant (酒馆备份助手)

**Author:** SenriYuki  
**Version:** 2.2

A simple, "idiot-proof" backup and restore tool designed for SillyTavern.  
专为 SillyTavern 设计的傻瓜式一键备份与还原工具。

## ✨ Features (功能特色)

* **One-Click Backup (一键打包)**: 
    * **Full Data**: Chats, Characters, Worlds, Avatars. (核心数据：角色/对话/世界书/头像)
    * **Extensions**: Both system and user plugins. (插件：包含已安装的第三方插件)
    * **Themes**: Backgrounds, UI themes, Movables. (美化：背景图/主题/动态立绘)
    * **Config & Secrets**: Settings and API keys. (配置与密钥)
* **One-Click Restore (一键还原)**:
    * Drag & Drop ZIP file to restore. (拖拽 ZIP 包即可还原)
    * **Auto-Cleaning**: Automatically removes temp files to save space. (自动清理临时文件，不占空间)
* **Safety First (安全防呆)**:
    * "Do not close" warning during processing. (防误触警告)
    * Double confirmation prevents accidental overwrites. (还原前二次确认)

## 📦 How to Install (如何安装)

### Method 1: Install from URL (Recommended / 推荐)
**No coding required! / 不需要敲代码！**

1.  Copy the link to this repository:
    复制本插件的仓库链接：
    `https://github.com/YourUserName/TavernBackupAssistant`
    *(Replace `YourUserName` with the actual username)*

2.  Open **SillyTavern**:
    打开酒馆，点击上方的 **Extensions (扩展)** 图标（积木形状）。

3.  Select **"Install Extension"** -> **"Install from URL"**:
    选择 **“安装扩展”** -> 找到 **“从 URL 安装”**。

4.  Paste the link and click **Install**.
    粘贴链接并点击 **安装**。

5.  **🔴 CRITICAL STEP: RESTART SillyTavern 🔴**
    **🔴 关键步骤：重启酒馆 🔴**
    * **PC**: Close the black console window and open `Start.bat` again. (关闭小黑窗并重新运行)
    * **Android/Termux**: Choose "Exit" and restart Termux/SillyTavern. (彻底退出并重启)
    * *Dependencies will be installed automatically upon restart.* (重启时系统会自动安装所需组件)

### Method 2: Manual Install (手动安装)
Extract the zip into `SillyTavern/plugins/TavernBackupAssistant`.
解压至 `SillyTavern/plugins/TavernBackupAssistant` 目录。

## 🚀 Usage (使用方法)

1.  After restarting, open the **Extensions** menu.
    重启后，打开 **扩展** 菜单。
2.  Click the **"酒馆备份助手"** button at the top.
    点击顶部的 **“酒馆备份助手”** 按钮。
3.  **Backup**: Select items -> Click "Start Backup & Download".
    **备份**：勾选项目 -> 点击“开始打包并下载”。
4.  **Restore**: Drag your backup ZIP into the box -> Click "Upload & Restore".
    **还原**：拖入 ZIP 包 -> 点击“上传并还原”。

## ❓ Troubleshooting (故障排除)

**Q: I clicked the button but nothing happened? / 点击按钮没反应？**
* **A**: Did you restart SillyTavern? If yes, the automatic dependency installation might have failed.
    你重启酒馆了吗？如果重启了还是不行，可能是自动安装依赖失败了。
* **Fix (手动修复)**:
    Open your terminal/console, go to the plugin folder, and run:
    打开终端（CMD/Termux），进入插件目录，运行以下命令：
    ```bash
    cd plugins/TavernBackupAssistant
    npm install
    ```
    Then restart again. (然后再次重启)