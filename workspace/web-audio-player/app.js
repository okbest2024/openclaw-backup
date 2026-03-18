// Web 音频播放器 - 主逻辑

class AudioPlayer {
    constructor() {
        // DOM 元素
        this.audio = document.getElementById('audio-player');
        this.audioUpload = document.getElementById('audio-upload');
        this.trackName = document.getElementById('track-name');
        this.trackStatus = document.getElementById('track-status');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progress-handle');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.getElementById('play-icon');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeIcon = document.getElementById('volume-icon');
        this.playlistEl = document.getElementById('playlist');
        this.clearPlaylistBtn = document.getElementById('clear-playlist');

        // 状态
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;

        // 初始化
        this.init();
    }

    init() {
        // 绑定事件
        this.audioUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());

        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());

        // 从 localStorage 恢复
        this.restoreState();

        // 设置初始音量
        this.audio.volume = this.volumeSlider.value / 100;
    }

    // 处理文件上传
    handleFileUpload(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                const track = {
                    id: Date.now() + Math.random(),
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    url: url,
                    file: file,
                    duration: 0
                };
                this.playlist.push(track);
            }
        });

        this.renderPlaylist();
        this.saveState();

        // 如果是第一次添加，自动播放第一首
        if (this.playlist.length === files.length) {
            this.loadTrack(0);
        }

        // 清空 input 以便重复选择相同文件
        this.audioUpload.value = '';
    }

    // 加载曲目
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];

        this.audio.src = track.url;
        this.trackName.textContent = track.name;
        this.trackStatus.textContent = '已加载';

        // 从 localStorage 恢复进度
        const savedProgress = localStorage.getItem(`progress_${track.id}`);
        if (savedProgress) {
            this.audio.currentTime = parseFloat(savedProgress);
        }

        this.updatePlaylistActive();
        this.saveState();

        // 自动播放
        this.play();
    }

    // 播放
    play() {
        if (!this.audio.src) {
            if (this.playlist.length > 0) {
                this.loadTrack(0);
            }
            return;
        }

        this.audio.play();
    }

    // 暂停
    pause() {
        this.audio.pause();
    }

    // 切换播放/暂停
    togglePlay() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    // 停止
    stop() {
        this.pause();
        this.audio.currentTime = 0;
        this.trackStatus.textContent = '已停止';
    }

    // 上一首
    playPrevious() {
        if (this.currentIndex > 0) {
            this.loadTrack(this.currentIndex - 1);
        } else if (this.playlist.length > 0) {
            // 循环到最后一首
            this.loadTrack(this.playlist.length - 1);
        }
    }

    // 下一首
    playNext() {
        if (this.currentIndex < this.playlist.length - 1) {
            this.loadTrack(this.currentIndex + 1);
        } else if (this.playlist.length > 0) {
            // 循环到第一首
            this.loadTrack(0);
        }
    }

    // 曲目结束处理
    onTrackEnd() {
        this.playNext();
    }

    // 播放事件
    onPlay() {
        this.isPlaying = true;
        this.playIcon.textContent = '⏸';
        this.trackStatus.textContent = '播放中';
        this.saveState();
    }

    // 暂停事件
    onPause() {
        this.isPlaying = false;
        this.playIcon.textContent = '▶';
        this.trackStatus.textContent = '已暂停';
        this.saveState();
    }

    // 更新进度条
    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.progressHandle.style.left = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);

        // 保存进度到 localStorage
        if (this.playlist[this.currentIndex]) {
            localStorage.setItem(
                `progress_${this.playlist[this.currentIndex].id}`,
                this.audio.currentTime
            );
        }
    }

    // 更新时长
    updateDuration() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);

        // 更新播放列表中的时长
        if (this.playlist[this.currentIndex]) {
            this.playlist[this.currentIndex].duration = this.audio.duration;
            this.renderPlaylist();
        }
    }

    // 跳转
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    }

    // 设置音量
    setVolume(e) {
        const volume = e.target.value / 100;
        this.audio.volume = volume;

        // 更新音量图标
        if (volume === 0) {
            this.volumeIcon.textContent = '🔇';
        } else if (volume < 0.5) {
            this.volumeIcon.textContent = '🔉';
        } else {
            this.volumeIcon.textContent = '🔊';
        }
    }

    // 格式化时间
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 渲染播放列表
    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.playlistEl.innerHTML = '<li class="empty-playlist">暂无曲目，请上传音频文件</li>';
            return;
        }

        this.playlistEl.innerHTML = this.playlist.map((track, index) => `
            <li data-index="${index}" class="${index === this.currentIndex ? 'active' : ''}">
                <span class="track-number">${index + 1}</span>
                <span class="track-title">${track.name}</span>
                <span class="track-duration">${this.formatTime(track.duration)}</span>
            </li>
        `).join('');

        // 绑定点击事件
        this.playlistEl.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const index = parseInt(li.dataset.index);
                this.loadTrack(index);
            });
        });
    }

    // 更新播放列表激活状态
    updatePlaylistActive() {
        this.playlistEl.querySelectorAll('li').forEach((li, index) => {
            li.classList.toggle('active', index === this.currentIndex);
        });
    }

    // 清空播放列表
    clearPlaylist() {
        if (this.playlist.length === 0) return;

        if (!confirm('确定要清空播放列表吗？')) return;

        this.stop();

        // 释放内存
        this.playlist.forEach(track => {
            URL.revokeObjectURL(track.url);
            // 清除进度记录
            localStorage.removeItem(`progress_${track.id}`);
        });

        this.playlist = [];
        this.currentIndex = 0;
        this.trackName.textContent = '未选择曲目';
        this.trackStatus.textContent = '就绪';
        this.audio.src = '';
        this.progress.style.width = '0%';
        this.progressHandle.style.left = '0%';
        this.currentTimeEl.textContent = '00:00';
        this.durationEl.textContent = '00:00';

        this.renderPlaylist();
        this.saveState();
    }

    // 保存到 localStorage
    saveState() {
        const state = {
            playlist: this.playlist.map(t => ({
                id: t.id,
                name: t.name,
                // 不保存 file 对象和 url，因为它们是临时的
            })),
            currentIndex: this.currentIndex,
            volume: this.volumeSlider.value
        };
        localStorage.setItem('audioPlayerState', JSON.stringify(state));
    }

    // 从 localStorage 恢复
    restoreState() {
        const savedState = localStorage.getItem('audioPlayerState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.currentIndex = state.currentIndex || 0;
                this.volumeSlider.value = state.volume || 80;

                // 注意：由于安全限制，无法恢复文件引用
                // 只能恢复播放列表元数据，用户需要重新上传文件
                if (state.playlist && state.playlist.length > 0) {
                    console.log('发现保存的播放列表，请重新上传音频文件以继续播放');
                }
            } catch (e) {
                console.error('恢复状态失败:', e);
            }
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});

// 页面关闭前清理
window.addEventListener('beforeunload', () => {
    // 可以在这里添加清理逻辑
});
