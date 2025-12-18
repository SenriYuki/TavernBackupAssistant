# Tavern Backup Assistant (酒馆备份助手)

**Author:** SenriYuki  
**Version:** 2.2

A simple, "idiot-proof" backup and restore tool designed for SillyTavern.  
专为 SillyTavern 设计的傻瓜式一键备份与还原工具。

## ✨ Features (功能特色)

* **一键全备份**：核心数据（角色/对话）、插件、主题美化、配置、密钥。
* **一键还原**：拖拽 ZIP 包即可还原，自动清理临时文件。
* **安全防呆**：实时进度条 + 还原前二次确认。
* **手机/PC 通用**：完美支持 Termux 端酒馆。

## 📦 Installation (安装方法)

由于本插件包含后端功能，**请勿使用酒馆界面内的“从 URL 安装”**（那只能安装前端插件）。
请根据您的设备选择以下一种方式：

## 📱 Termux Configuration Guide (手机端配置指南)

If you are using Termux, follow these steps to enable server plugins:  
如果您是 Termux 用户，请按照以下步骤开启服务端插件功能：

1.  **Enter SillyTavern directory** (进入酒馆目录):
    ```bash
    cd ~/SillyTavern
    ```
2.  **Open config.yaml with Nano editor** (使用 Nano 编辑器打开配置):
    ```bash
    nano config.yaml
    ```
3.  **Find and modify these lines** (找到并修改以下参数):
    * Press `Ctrl + W` to search for "plugins". (按 `Ctrl + W` 搜索 "plugins")
    * Change the values to `true` (将值改为 `true`):
    ```yaml
    enableServerPlugins: true
    enableServerPluginsAutoUpdate: true
    ```
4.  **Save and Exit** (保存并退出):
    * Press `Ctrl + O` then `Enter` to save. (按 `Ctrl + O` 然后回车保存)
    * Press `Ctrl + X` to exit. (按 `Ctrl + X` 退出)

---

## ⚙️ Configuration (配置要求 - PC & General)

**CRITICAL**: This plugin requires "Server Plugins" to be enabled.  
**重要**：本插件需要开启 SillyTavern 的“服务端插件”功能才能运行。

* **File Path (文件路径)**: `SillyTavern/config.yaml`
* **Settings (设置项)**:

```yaml
enableServerPlugins: true             # Allow backend logic (允许运行后端逻辑)
enableServerPluginsAutoUpdate: true   # Auto-install dependencies (允许自动安装组件)
```

### 📱 Android (Termux) 用户 [推荐]
**只需一步！复制下面的指令，粘贴到 Termux 中并回车：**

```bash
cd ~/SillyTavern/plugins && git clone [https://github.com/SenriYuki/TavernBackupAssistant.git](https://github.com/SenriYuki/TavernBackupAssistant.git) && cd TavernBackupAssistant && npm install && echo "安装完成！请重启酒馆"
```

### 💻 PC (Windows/Linux) 用户 [推荐]

```bash
cd SillyTavern/plugins
git clone https://github.com/SenriYuki/TavernBackupAssistant.git
cd TavernBackupAssistant
npm install
```

