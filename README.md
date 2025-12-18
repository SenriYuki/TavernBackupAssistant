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

### 📱 Android (Termux) 用户 [推荐]
**只需一步！复制下面的指令，粘贴到 Termux 中并回车：**

```bash
cd ~/SillyTavern/plugins && git clone [https://github.com/SenriYuki/TavernBackupAssistant.git](https://github.com/SenriYuki/TavernBackupAssistant.git) && cd TavernBackupAssistant && npm install && echo "安装完成！请重启酒馆"

