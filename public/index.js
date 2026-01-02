(function () {
    const MODAL_ID = 'backup-assistant-ui';
    const PLUGIN_BASE_URL = '/api/plugins/tavern-backup-assistant';
    let pollInterval = null;

    // Polling function to update progress / 轮询函数更新进度
    async function startPolling() {
        const bar = document.getElementById('ba-progress-bar');
        const txt = document.getElementById('ba-status-text');
        const warn = document.getElementById('ba-warning-blink');
        const btn = document.getElementById('btn-start-backup');
        
        if(pollInterval) clearInterval(pollInterval);
        
        pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${PLUGIN_BASE_URL}/status`);
                const data = await res.json();
                
                if (bar && txt) {
                    bar.style.width = data.progress + '%';
                    txt.innerText = `${data.progress}% - ${data.message}`;
                    
                    // Status: Working / 状态：进行中
                    if (data.status === 'working') {
                        if(warn) warn.style.display = 'block';
                    }
                    // Status: Done / 状态：完成
                    if (data.status === 'done') {
                        clearInterval(pollInterval);
                        bar.style.backgroundColor = '#4caf50';
                        if(warn) warn.style.display = 'none';
                        
                        if (data.resultFile) {
                            txt.innerText = "✅ 打包完成！浏览器正在下载...";
                            window.location.href = `${PLUGIN_BASE_URL}/download/${data.resultFile}`;
                        } else {
                            txt.innerText = "✅ 还原完成！请刷新页面。";
                        }
                        if(btn) btn.disabled = false;
                    } 
                    // Status: Error / 状态：错误
                    else if (data.status === 'error') {
                        clearInterval(pollInterval);
                        bar.style.backgroundColor = '#f44336';
                        if(warn) warn.style.display = 'none';
                        alert("❌ 错误 (Error): " + data.message);
                        if(btn) btn.disabled = false;
                    }
                }
            } catch(e) {}
        }, 800);
    }

    window.backupAssistant = {
        show() {
            const html = `
            <div id="${MODAL_ID}" class="ba-mask">
                <div class="ba-win">
                    <div class="ba-head">
                        <h3><i class="fa-solid fa-box-archive"></i> 酒馆备份助手 <small>v2.2</small></h3>
                        <div class="ba-close" onclick="document.getElementById('${MODAL_ID}').remove()">×</div>
                    </div>
                    
                    <div class="ba-tabs">
                        <div class="ba-tab active" onclick="window.backupAssistant.switchTab(this, 'tab-backup')">📤 备份 (Backup)</div>
                        <div class="ba-tab" onclick="window.backupAssistant.switchTab(this, 'tab-restore')">📥 还原 (Restore)</div>
                    </div>

                    <div id="tab-backup" class="ba-content">
                        <div class="ba-desc">请选择要打包的内容：</div>
                        <div class="ba-list">
                            <label class="ba-item">
                                <input type="checkbox" id="chk-data" checked> 
                                <div class="ba-item-text">
                                    <div class="ba-title"><i class="fa-solid fa-database"></i> 核心数据 (Data)</div>
                                    <div class="ba-subtitle">包含：角色、聊天记录、群组、世界书、用户头像</div>
                                </div>
                            </label>
                            <label class="ba-item">
                                <input type="checkbox" id="chk-ext" checked> 
                                <div class="ba-item-text">
                                    <div class="ba-title"><i class="fa-solid fa-puzzle-piece"></i> 插件 (Extensions)</div>
                                    <div class="ba-subtitle">包含：已安装的功能性插件 (System & User)</div>
                                </div>
                            </label>
                            <label class="ba-item">
                                <input type="checkbox" id="chk-themes" checked> 
                                <div class="ba-item-text">
                                    <div class="ba-title"><i class="fa-solid fa-palette"></i> 主题美化 (Themes)</div>
                                    <div class="ba-subtitle">包含：界面主题、背景图、动态立绘 (Movables)</div>
                                </div>
                            </label>
                            <label class="ba-item">
                                <input type="checkbox" id="chk-conf" checked> 
                                <div class="ba-item-text">
                                    <div class="ba-title"><i class="fa-solid fa-gears"></i> 设置 (Config)</div>
                                    <div class="ba-subtitle">config.yaml 配置文件</div>
                                </div>
                            </label>
                            <label class="ba-item">
                                <input type="checkbox" id="chk-sec"> 
                                <div class="ba-item-text">
                                    <div class="ba-title"><i class="fa-solid fa-key"></i> 密钥 (Secrets)</div>
                                    <div class="ba-subtitle">API Key 等敏感信息 (慎选)</div>
                                </div>
                            </label>
                        </div>
                        <div class="ba-actions">
                            <button id="btn-start-backup" class="ba-btn primary" onclick="window.backupAssistant.doBackup()">
                                <i class="fa-solid fa-download"></i> 开始打包并下载
                            </button>
                        </div>
                    </div>

                    <div id="tab-restore" class="ba-content" style="display:none;">
                        <div class="ba-warning-box">
                            <div style="font-weight:bold; margin-bottom:5px; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-triangle-exclamation"></i> 警告 (Warning)
                            </div>
                            <div style="font-size:0.9em; opacity:0.8;">
                                还原操作将 <b>直接覆盖</b> 现有的同名文件。<br>
                                如果当前酒馆内有重要数据，请先进行备份。
                            </div>
                        </div>

                        <div class="ba-upload-area" onclick="document.getElementById('restore-file').click()">
                            <i class="fa-solid fa-file-zipper" style="font-size: 2em; margin-bottom: 10px; opacity: 0.5;"></i>
                            <div id="ba-upload-text">点击选择或拖拽 ZIP 文件到此处</div>
                            <input type="file" id="restore-file" accept=".zip" 
                                   onchange="window.backupAssistant.updateFileName(this)" 
                                   onclick="event.stopPropagation()">
                        </div>

                        <div class="ba-actions">
                            <button id="btn-start-restore" class="ba-btn danger" onclick="window.backupAssistant.preRestore()">
                                <i class="fa-solid fa-upload"></i> 上传并还原
                            </button>
                        </div>
                    </div>

                    <div class="ba-progress-area">
                        <div class="ba-status-text" id="ba-status-text">准备就绪 (Ready)</div>
                        <div class="ba-progress-bg">
                            <div class="ba-progress-bar" id="ba-progress-bar" style="width: 0%"></div>
                        </div>
                        <div id="ba-warning-blink" style="display:none; text-align:center; color:#ff6b6b; font-weight:bold; margin-top:8px; animation: ba-blink 1.5s infinite;">
                            ⚡ 正在处理，请勿关闭或刷新此窗口 ⚡
                        </div>
                    </div>
                    <div class="ba-foot">Plugin by SenriYuki</div>
                </div>
            </div>
            <style>@keyframes ba-blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }</style>`;
            
            const exist = document.getElementById(MODAL_ID);
            if(exist) exist.remove();
            $('body').append(html);
        },

        // Update file name display / 更新文件名显示
        updateFileName(input) {
            const txt = document.getElementById('ba-upload-text');
            if (input.files && input.files[0]) {
                txt.innerHTML = `<span style="color:#6fa8dc; font-weight:bold;">${input.files[0].name}</span>`;
                txt.style.opacity = '1';
            } else {
                txt.innerText = "点击选择或拖拽 ZIP 文件到此处";
            }
        },

        switchTab(el, targetId) {
            document.querySelectorAll('.ba-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            document.querySelectorAll('.ba-content').forEach(c => c.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
        },

        async doBackup() {
            const opts = {
                data: document.getElementById('chk-data').checked,
                extensions: document.getElementById('chk-ext').checked,
                themes: document.getElementById('chk-themes').checked,
                config: document.getElementById('chk-conf').checked,
                secrets: document.getElementById('chk-sec').checked
            };

            const btn = document.getElementById('btn-start-backup');
            btn.disabled = true;
            const bar = document.getElementById('ba-progress-bar');
            if(bar) bar.style.backgroundColor = '#6fa8dc'; 

            try {
                startPolling();
                const res = await fetch(`${PLUGIN_BASE_URL}/backup`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(opts)
                });
                const data = await res.json();
                if (!data.success) {
                    alert("启动失败 (Start Failed): " + data.error);
                    btn.disabled = false;
                }
            } catch(e) { btn.disabled = false; }
        },

        preRestore() {
            const fileInput = document.getElementById('restore-file');
            if (!fileInput.files || fileInput.files.length === 0) return alert("请先选择一个 ZIP 文件！");
            
            // Double confirmation / 二次确认
            if (confirm("⚠️ 严重警告 ⚠️\n\n即将开始还原数据，这将【覆盖】现有文件。\n\nData restore will OVERWRITE existing files.\n\n确定要继续吗？")) {
                if(confirm("再次确认 (Confirm Again)：\n\n建议先备份当前数据！\n真的要覆盖吗？")) this.doRestore(fileInput.files[0]);
            }
        },

        async doRestore(file) {
            const btn = document.getElementById('btn-start-restore');
            btn.disabled = true;
            startPolling();
            try {
                await fetch(`${PLUGIN_BASE_URL}/restore`, { method: 'POST', body: file });
            } catch(e) { alert("上传错误 (Upload Error)"); }
            btn.disabled = false;
        }
    };

    // Auto-inject button into Extensions Menu / 自动注入按钮到扩展菜单
    const checkBtn = setInterval(() => {
        const bar = document.getElementById('extensionsMenu');
        if(bar && !document.getElementById('ba-open-btn')) {
            const btn = document.createElement('div');
            btn.id = 'ba-open-btn';
            btn.className = 'list-group-item flex-container flex-gap-10 interactable';
            btn.innerHTML = '<div class="fa-solid fa-box-archive"></div><div>酒馆备份助手</div>';
            btn.onclick = () => window.backupAssistant.show();
            bar.appendChild(btn);
            clearInterval(checkBtn);
        }
    }, 2000);
})();