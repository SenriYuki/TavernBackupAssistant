const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');

// Attempt to load dependencies / 尝试加载依赖
let archiver, AdmZip, fsExtra;
try {
    archiver = require('archiver');
    AdmZip = require('adm-zip');
    fsExtra = require('fs-extra');
} catch (e) {
    console.error('[BackupAssistant] ❌ Missing dependencies! Please run "npm install" in the plugin directory. / 缺少依赖！请在插件目录下运行 "npm install"');
}

const PLUGIN_ID = 'tavern-backup-assistant';
const PLUGIN_DIR = __dirname;
// Target directory for frontend extension files / 前端扩展文件的目标目录
const EXTENSION_DIR = path.join(process.cwd(), 'public', 'scripts', 'extensions', 'third-party', 'TavernBackupAssistant');
const BACKUP_TEMP_DIR = path.join(PLUGIN_DIR, 'temp_backups');

let currentTask = { status: 'idle', progress: 0, message: '', resultFile: null };

/**
 * Helper: Recursively get directory size
 * 辅助：递归获取目录大小
 */
function getDirectorySize(dirPath) {
    let size = 0;
    if (!fs.existsSync(dirPath)) return 0;
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) size += getDirectorySize(filePath);
            else size += stats.size;
        }
    } catch (e) {}
    return size;
}

/**
 * Helper: Clean temporary folder to prevent accumulation
 * 辅助：清空临时文件夹以防止文件堆积
 */
function cleanTempFolder() {
    try {
        if (fs.existsSync(BACKUP_TEMP_DIR)) {
            fsExtra.emptyDirSync(BACKUP_TEMP_DIR);
        } else {
            fs.mkdirSync(BACKUP_TEMP_DIR);
        }
    } catch (e) {
        console.error("[BackupAssistant] Failed to clean temp folder / 清理临时文件夹失败:", e);
    }
}

/**
 * Helper: Check if file content is different
 * 辅助：检查文件内容是否不同
 */
function isFileDifferent(src, dest) {
    if (!fs.existsSync(dest)) return true;
    try {
        const srcStat = fs.statSync(src);
        const destStat = fs.statSync(dest);
        if (srcStat.size !== destStat.size) return true;
        const srcBuff = fs.readFileSync(src);
        const destBuff = fs.readFileSync(dest);
        return !srcBuff.equals(destBuff);
    } catch (e) {
        return true;
    }
}

/**
 * Helper: Auto-deploy frontend files
 * 辅助：自动部署前端文件
 */
function installFrontend() {
    try {
        if (!fs.existsSync(EXTENSION_DIR)) fs.mkdirSync(EXTENSION_DIR, { recursive: true });
        let updated = false;
        ['index.js', 'style.css', 'manifest.json'].forEach(file => {
            const src = path.join(PLUGIN_DIR, 'public', file);
            const dest = path.join(EXTENSION_DIR, file);
            if (fs.existsSync(src)) {
                if (isFileDifferent(src, dest)) {
                    fs.copyFileSync(src, dest);
                    updated = true;
                }
            }
        });
        if (updated) console.log('[BackupAssistant] UI Extension files installed/updated.');
    } catch (err) {
        console.error('[BackupAssistant] UI Install Error:', err);
    }
}

function updateStatus(progress, message, status = 'working') {
    currentTask.progress = Math.min(100, Math.max(0, Math.round(progress)));
    currentTask.message = message;
    currentTask.status = status;
}

function init(app, config) {
    installFrontend();
    if (!fs.existsSync(BACKUP_TEMP_DIR)) fs.mkdirSync(BACKUP_TEMP_DIR);

    // API: Get Task Status / 获取任务状态
    app.get('/status', (req, res) => res.json(currentTask));

    // API: Start Backup / 开始备份
    app.post('/backup', async (req, res) => {
        if (currentTask.status === 'working') return res.status(409).json({ error: "Task in progress / 任务进行中" });
        if (!archiver) return res.status(500).json({ error: "Missing dependencies / 缺少依赖" });

        // Clean old files before starting / 开始前清理旧文件
        cleanTempFolder();

        const { data, extensions, themes, config: incConfig, secrets } = req.body;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `ST_Backup_${timestamp}.zip`;
        const filePath = path.join(BACKUP_TEMP_DIR, fileName);

        currentTask.resultFile = null;
        updateStatus(0, "Scanning files... / 正在扫描文件...", 'working');

        const output = fs.createWriteStream(filePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        const rootDir = process.cwd();

        // Path definitions / 路径定义
        const P = {
            data: path.join(rootDir, 'data'),
            extGlobal: path.join(rootDir, 'public', 'scripts', 'extensions'),
            extUser: path.join(rootDir, 'data', 'default-user', 'extensions'),
            themeGlobal: path.join(rootDir, 'public', 'themes'),
            themeUser: path.join(rootDir, 'data', 'default-user', 'themes'),
            movables: path.join(rootDir, 'public', 'Movables')
        };

        // Estimate size for progress bar / 预估大小用于进度条
        let totalBytes = 0;
        if (data) totalBytes += getDirectorySize(P.data);
        if (extensions) {
            totalBytes += getDirectorySize(P.extGlobal);
            if (!data) totalBytes += getDirectorySize(P.extUser);
        }
        if (themes) {
            totalBytes += getDirectorySize(P.themeGlobal);
            if (!data) totalBytes += getDirectorySize(P.themeUser);
        }
        if (incConfig) totalBytes += 10000;

        archive.pipe(output);

        archive.on('progress', (progress) => {
            const percent = totalBytes > 0 ? (progress.fs.processedBytes / totalBytes) * 100 : 50;
            updateStatus(percent, `Packing: ${Math.round(progress.fs.processedBytes / 1024 / 1024)}MB / 正在打包...`);
        });

        output.on('close', () => {
            currentTask.resultFile = fileName;
            updateStatus(100, "Done! / 完成！", 'done');
        });

        archive.on('error', (err) => {
            updateStatus(0, "Error: " + err.message, 'error');
        });

        // Add files to archive / 添加文件到压缩包
        if (data) archive.directory(P.data, 'data');
        if (extensions) {
            archive.directory(P.extGlobal, 'public/scripts/extensions');
            // If data is not selected, manually grab user extensions / 若未选Data，手动抓取用户插件
            if (!data && fs.existsSync(P.extUser)) archive.directory(P.extUser, 'data/default-user/extensions');
        }
        if (themes) {
            archive.directory(P.themeGlobal, 'public/themes');
            if (!data && fs.existsSync(P.themeUser)) archive.directory(P.themeUser, 'data/default-user/themes');
            if (fs.existsSync(P.movables)) archive.directory(P.movables, 'public/Movables');
        }
        if (incConfig && fs.existsSync(path.join(rootDir, 'config.yaml'))) {
            archive.file(path.join(rootDir, 'config.yaml'), { name: 'config.yaml' });
        }
        if (secrets && fs.existsSync(path.join(rootDir, 'secrets.json'))) {
            archive.file(path.join(rootDir, 'secrets.json'), { name: 'secrets.json' });
        }

        archive.append(JSON.stringify({ createdBy: 'TavernBackupAssistant', version: '2.2' }), { name: 'backup_info.json' });
        archive.finalize();

        res.json({ success: true, message: "Backup started" });
    });

    // API: Download File / 下载文件
    app.get('/download/:filename', (req, res) => {
        const file = path.join(BACKUP_TEMP_DIR, req.params.filename);
        if (fs.existsSync(file)) {
            // Delete file after download completes / 下载完成后立即删除文件
            res.download(file, (err) => {
                if (!err) {
                    try {
                        fs.unlinkSync(file); 
                        console.log(`[BackupAssistant] Temp file cleaned: ${req.params.filename}`);
                    } catch (e) {}
                }
            });
        } else {
            res.status(404).send("File not found");
        }
    });

    // API: Restore Backup / 还原备份
    app.post('/restore', (req, res) => {
        if (!AdmZip) return res.status(500).json({ error: "Missing dependencies / 缺少依赖" });
        
        // Clean temp folder / 清理临时文件夹
        cleanTempFolder();

        updateStatus(0, "Uploading... / 正在接收文件...", 'working');
        const fileName = 'restore_upload.zip';
        const filePath = path.join(BACKUP_TEMP_DIR, fileName);
        const writeStream = fs.createWriteStream(filePath);

        const totalBytes = parseInt(req.headers['content-length'] || 0);
        let receivedBytes = 0;
        let lastUpdate = 0;

        const progressMonitor = new Transform({
            transform(chunk, encoding, callback) {
                receivedBytes += chunk.length;
                const now = Date.now();
                // Update at most every 500ms to avoid spamming
                if (totalBytes > 0 && now - lastUpdate > 500) {
                    // Map 0-100 upload to 0-90 total progress
                    const uploadPercent = (receivedBytes / totalBytes);
                    const totalPercent = uploadPercent * 90;
                    updateStatus(totalPercent, `Uploading... ${Math.round(uploadPercent * 100)}%`);
                    lastUpdate = now;
                }
                callback(null, chunk);
            }
        });

        req.pipe(progressMonitor).pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                if (!fsExtra) throw new Error("fs-extra dependency missing");

                updateStatus(95, "Verifying... / 校验文件...", 'working');
                const zip = new AdmZip(filePath);
                const rootDir = process.cwd();
                const extractDir = path.join(BACKUP_TEMP_DIR, 'extract_temp');
                
                // Clean extract dir
                fsExtra.emptyDirSync(extractDir);

                updateStatus(96, "Extracting... / 正在解压...", 'working');
                try {
                    zip.extractAllTo(extractDir, true);
                } catch (e) {
                    throw new Error("Unzip failed: " + e.message);
                }

                updateStatus(98, "Restoring... / 正在还原...", 'working');

                // Detect Backup Type / 检测备份类型
                if (fs.existsSync(path.join(extractDir, 'data'))) {
                    // Type A: Plugin Backup (contains 'data' folder) / 插件备份（包含 data 目录）
                    console.log('[BackupAssistant] Detected Plugin Backup');
                    
                    // Safety Check: Remove broken config.yaml if it's too small (e.g. symlink text) / 安全检查：如果配置文件过小（可能是损坏的链接文本），则不还原它
                    const configPath = path.join(extractDir, 'config.yaml');
                    if (fs.existsSync(configPath)) {
                        const stats = fs.statSync(configPath);
                        if (stats.size < 100) {
                            console.warn('[BackupAssistant] Skipped restoring suspicious config.yaml (too small)');
                            fs.unlinkSync(configPath);
                        }
                    }

                    fsExtra.copySync(extractDir, rootDir, { overwrite: true });
                } else if (fs.existsSync(path.join(extractDir, 'characters')) || fs.existsSync(path.join(extractDir, 'chats'))) {
                    // Type B: Standard Backup (flat structure) / 标准备份（扁平结构）
                    console.log('[BackupAssistant] Detected Standard Backup');
                    const targetDir = path.join(rootDir, 'data', 'default-user');
                    // Ensure target directory exists
                    fsExtra.ensureDirSync(targetDir);
                    fsExtra.copySync(extractDir, targetDir, { overwrite: true });
                } else {
                    // Type C: Unknown, fallback to root / 未知格式，默认解压到根目录
                    console.log('[BackupAssistant] Unknown Backup Format, restoring to root');
                    fsExtra.copySync(extractDir, rootDir, { overwrite: true });
                }

                // Clean up / 清理
                try { fs.unlinkSync(filePath); } catch(e) {}
                try { fsExtra.removeSync(extractDir); } catch(e) {}

                updateStatus(100, "Success! Please refresh. / 还原成功！请刷新。", 'done');
                res.json({ success: true });
            } catch (err) {
                console.error("[BackupAssistant] Restore Error:", err);
                updateStatus(0, "Error: " + err.message, 'error');
                res.json({ success: false, error: err.message });
            }
        });
        
        writeStream.on('error', () => res.json({ success: false }));
    });
}

module.exports = { init, info: { id: PLUGIN_ID, name: 'Tavern Backup Assistant', description: 'Easy backup and restore tools' } };