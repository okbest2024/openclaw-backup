// 音频播放器应用
const API_BASE = '';

class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.tracks = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        
        this.initElements();
        this.bindEvents();
        this.loadTracks();
    }
    
    initElements() {
        // 上传
        this.uploadInput = document.getElementById('audio-upload');
        this.uploadProgress = document.getElementById('upload-progress');
        this.uploadFill = document.getElementById('upload-fill');
        this.uploadText = document.getElementById('upload-text');
        
        // 播放信息
        this.trackName = document.getElementById('track-name');
        this.trackStatus = document.getElementById('track-status');
        
        // 进度条
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progress-handle');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        
        // 控制按钮
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.getElementById('play-icon');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.stopBtn = document.getElementById('stop-btn');
        
        // 音量
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeIcon = document.getElementById('volume-icon');
        
        // 播放列表
        this.playlist = document.getElementById('playlist');
        this.clearAllBtn = document.getElementById('clear-all');
    }
    
    bindEvents() {
        // 上传
        this.uploadInput.addEventListener('change', (e) => this.handleUpload(e));
        
        // 控制按钮
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrev());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // 进度条
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // 音量
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        
        // 清空
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('error', (e) => this.onError(e));
    }
    
    // 加载曲目列表
    async loadTracks() {
        try {
            const res = await fetch(`${API_BASE}/api/tracks`);
            this.tracks = await res.json();
            this.renderPlaylist();
        } catch (e) {
            console.error('加载曲目失败:', e);
            this.playlist.innerHTML = '<li class="empty-playlist">加载失败，请刷新页面</li>';
        }
    }
    
    // 上传文件
    async handleUpload(e) {
        const files = e.target.files;
        if (!files.length) return;
        
        const formData = new FormData();
        for (let file of files) {
            formData.append('audio', file);
        }
        
        this.uploadProgress.style.display = 'block';
        this.uploadFill.style.width = '30%';
        this.uploadText.textContent = '上传中...';
        
        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData
            });
            
            this.uploadFill.style.width = '100%';
            const result = await res.json();
            
            if (result.success) {
                this.uploadText.textContent = `上传成功！${result.files.length} 个文件`;
                setTimeout(() => {
                    this.uploadProgress.style.display = 'none';
                }, 1500);
                
                await this.loadTracks();
                
                // 如果当前没有播放，自动播放第一个新上传的
                if (this.currentIndex === -1 && this.tracks.length > 0) {
                    this.playTrack(0);
                }
            }
        } catch (e) {
            console.error('上传失败:', e);
            this.uploadText.textContent = '上传失败，请重试';
        }
        
        this.uploadInput.value = '';
    }
    
    // 渲染播放列表
    renderPlaylist() {
        if (this.tracks.length === 0) {
            this.playlist.innerHTML = '<li class="empty-playlist">暂无曲目，请上传音频文件</li>';
            return;
        }
        
        this.playlist.innerHTML = this.tracks.map((track, index) => `
            <li class="${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="track-info">
                    <div class="track-name">${this.formatTrackName(track.name)}</div>
                    <div class="track-progress">${this.formatTime(track.currentTime)} / ${this.formatTime(track.duration)}</div>
                </div>
                <button class="delete-btn" data-track-id="${track.id}" title="删除">🗑</button>
            </li>
        `).join('');
        
        // 绑定点击事件
        this.playlist.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    const index = parseInt(li.dataset.index);
                    this.playTrack(index);
                }
            });
        });
        
        // 绑定删除事件
        this.playlist.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackId = btn.dataset.trackId;
                this.deleteTrack(trackId);
            });
        });
    }
    
    // 播放指定曲目
    playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentIndex = index;
        const track = this.tracks[index];
        
        this.audio.src = track.url;
        this.trackName.textContent = this.formatTrackName(track.name);
        this.trackStatus.textContent = '准备播放';
        
        this.audio.load();
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.playIcon.textContent = '⏸';
            this.trackStatus.textContent = '播放中';
        }).catch(e => {
            console.error('播放失败:', e);
            this.trackStatus.textContent = '播放失败';
        });
        
        this.renderPlaylist();
    }
    
    // 切换播放/暂停
    togglePlay() {
        if (this.currentIndex === -1) {
            if (this.tracks.length > 0) {
                this.playTrack(0);
            }
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.playIcon.textContent = '▶';
            this.trackStatus.textContent = '已暂停';
        } else {
            this.audio.play();
            this.isPlaying = true;
            this.playIcon.textContent = '⏸';
            this.trackStatus.textContent = '播放中';
        }
    }
    
    // 上一首
    playPrev() {
        if (this.currentIndex > 0) {
            this.playTrack(this.currentIndex - 1);
        } else if (this.tracks.length > 0) {
            this.playTrack(this.tracks.length - 1);
        }
    }
    
    // 下一首
    playNext() {
        if (this.currentIndex < this.tracks.length - 1) {
            this.playTrack(this.currentIndex + 1);
        } else if (this.tracks.length > 0) {
            this.playTrack(0);
        }
    }
    
    // 停止
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.playIcon.textContent = '▶';
        this.trackStatus.textContent = '已停止';
        this.progress.style.width = '0%';
        this.currentTimeEl.textContent = '00:00';
    }
    
    // 进度条跳转
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
    }
    
    // 更新进度
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        
        // 定期保存进度
        if (this.currentIndex >= 0) {
            this.saveProgress();
        }
    }
    
    // 保存进度
    async saveProgress() {
        if (!this.tracks[this.currentIndex]) return;
        
        const trackId = this.tracks[this.currentIndex].id;
        try {
            await fetch(`${API_BASE}/api/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId,
                    currentTime: this.audio.currentTime,
                    duration: this.audio.duration
                })
            });
        } catch (e) {
            console.error('保存进度失败:', e);
        }
    }
    
    // 加载元数据
    onLoadedMetadata() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
        this.trackStatus.textContent = '播放中';
        
        // 恢复上次的播放进度
        if (this.currentIndex >= 0 && this.tracks[this.currentIndex].currentTime > 0) {
            const lastTime = this.tracks[this.currentIndex].currentTime;
            this.audio.currentTime = lastTime;
            this.trackStatus.textContent = `从 ${this.formatTime(lastTime)} 继续播放`;
        }
    }
    
    // 播放结束
    onEnded() {
        this.isPlaying = false;
        this.playIcon.textContent = '▶';
        this.trackStatus.textContent = '播放完毕';
        this.playNext();
    }
    
    // 错误处理
    onError(e) {
        console.error('播放错误:', e);
        this.trackStatus.textContent = '播放错误';
    }
    
    // 设置音量
    setVolume(e) {
        const volume = e.target.value / 100;
        this.audio.volume = volume;
        
        if (volume === 0) {
            this.volumeIcon.textContent = '🔇';
        } else if (volume < 0.5) {
            this.volumeIcon.textContent = '🔉';
        } else {
            this.volumeIcon.textContent = '🔊';
        }
    }
    
    // 删除曲目
    async deleteTrack(trackId) {
        if (!confirm('确定要删除这首曲目吗？')) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/tracks/${trackId}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                await this.loadTracks();
                
                // 如果删除的是当前播放的曲目
                if (this.tracks[this.currentIndex]?.id === trackId) {
                    this.stop();
                    this.currentIndex = -1;
                    this.trackName.textContent = '未选择曲目';
                }
            }
        } catch (e) {
            console.error('删除失败:', e);
            alert('删除失败，请重试');
        }
    }
    
    // 清空所有
    async clearAll() {
        if (!confirm('确定要清空所有曲目吗？')) return;
        
        // 逐个删除
        for (const track of this.tracks) {
            try {
                await fetch(`${API_BASE}/api/tracks/${track.id}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.error('删除失败:', e);
            }
        }
        
        await this.loadTracks();
        this.stop();
        this.currentIndex = -1;
    }
    
    // 格式化时间
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 格式化曲名
    formatTrackName(name) {
        return name || '未知曲目';
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.player = new AudioPlayer();
});
