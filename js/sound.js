// ========================================
// サウンド管理システム
// ========================================

// サウンド設定
const soundConfig = {
    enabled: false,          // サウンドON/OFF（初期値: OFF）
    bgmVolume: 0.3,          // BGM音量 (0.0 - 1.0)
    effectVolume: 0.5,       // 効果音音量 (0.0 - 1.0)
    fadeTime: 1.5,           // フェード時間（秒）
    currentBGM: null,        // 現在再生中のBGM
    nextBGM: null            // 次に再生するBGM
};

// 音声ファイルのパス
const soundPaths = {
    // BGM
    bgm: {
        opening: 'sounds/bgm/opening-Lv10.mp3',
        lv11_20: [
            'sounds/bgm/Lv11-Lv20_001.mp3',
            'sounds/bgm/Lv11-Lv20_002.mp3',
            'sounds/bgm/Lv11-Lv20_003.mp3'
        ],
        ending: 'sounds/bgm/ending.mp3'
    },
    // 効果音
    effect: {
        button: [], // 動的に読み込み
        correct: [
            'sounds/effect/correct-001.mp3',
            'sounds/effect/correct-002.mp3',
            'sounds/effect/correct-003.mp3'
        ],
        wrong: 'sounds/effect/wrong-001.mp3',
        levelup: 'sounds/effect/levelup-001.mp3',
        combo: [
            'sounds/effect/combo-001.mp3',
            'sounds/effect/combo-002.mp3',
            'sounds/effect/combo-003.mp3'
        ],
        lifeLost: 'sounds/effect/life-lost-001.mp3',
        gameover: 'sounds/effect/gameover-001.mp3',
        warning: 'sounds/effect/warning-001.mp3',
        clear: 'sounds/effect/clear-001.mp3'
    }
};

// button-*.mp3 ファイルを動的に登録（8個）
for (let i = 1; i <= 8; i++) {
    const filename = `sounds/effect/button-${String(i).padStart(3, '0')}.mp3`;
    soundPaths.effect.button.push(filename);
}

// Audio オブジェクトのキャッシュ
const audioCache = {
    bgm: {},
    effect: {}
};

/**
 * サウンドシステムの初期化
 */
function initSoundSystem() {
    if (DEBUG_MODE) console.log('🔊 サウンドシステム初期化');

    // BGMのプリロード
    preloadBGM();

    // 効果音のプリロード
    preloadEffects();

    if (DEBUG_MODE) console.log('✅ サウンドシステム初期化完了');
}

/**
 * BGMをプリロード
 */
function preloadBGM() {
    // opening BGM
    audioCache.bgm.opening = createAudio(soundPaths.bgm.opening, soundConfig.bgmVolume, true);

    // Lv11-20 BGM
    audioCache.bgm.lv11_20 = soundPaths.bgm.lv11_20.map(path =>
        createAudio(path, soundConfig.bgmVolume, true)
    );

    // ending BGM
    audioCache.bgm.ending = createAudio(soundPaths.bgm.ending, soundConfig.bgmVolume, true);

    if (DEBUG_MODE) console.log('📀 BGMプリロード完了');
}

/**
 * 効果音をプリロード
 */
function preloadEffects() {
    // ボタン音
    audioCache.effect.button = soundPaths.effect.button.map(path =>
        createAudio(path, soundConfig.effectVolume, false)
    );

    // 正解音
    audioCache.effect.correct = soundPaths.effect.correct.map(path =>
        createAudio(path, soundConfig.effectVolume, false)
    );

    // コンボ音
    audioCache.effect.combo = soundPaths.effect.combo.map(path =>
        createAudio(path, soundConfig.effectVolume, false)
    );

    // その他の効果音
    audioCache.effect.wrong = createAudio(soundPaths.effect.wrong, soundConfig.effectVolume, false);
    audioCache.effect.levelup = createAudio(soundPaths.effect.levelup, soundConfig.effectVolume, false);
    audioCache.effect.lifeLost = createAudio(soundPaths.effect.lifeLost, soundConfig.effectVolume, false);
    audioCache.effect.gameover = createAudio(soundPaths.effect.gameover, soundConfig.effectVolume, false);
    audioCache.effect.warning = createAudio(soundPaths.effect.warning, soundConfig.effectVolume, false);
    audioCache.effect.clear = createAudio(soundPaths.effect.clear, soundConfig.effectVolume, false);

    if (DEBUG_MODE) console.log('🔔 効果音プリロード完了');
}

/**
 * Audioオブジェクトを作成
 * @param {string} path - 音声ファイルのパス
 * @param {number} volume - 音量 (0.0 - 1.0)
 * @param {boolean} loop - ループ再生するか
 * @returns {Audio} Audioオブジェクト
 */
function createAudio(path, volume, loop) {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.loop = loop;
    audio.preload = 'auto';
    return audio;
}

/**
 * サウンドON/OFF切り替え
 * @param {boolean} enabled - true: ON, false: OFF
 */
function toggleSound(enabled) {
    soundConfig.enabled = enabled;

    if (enabled) {
        if (DEBUG_MODE) console.log('🔊 サウンドON');
        // サウンドONにした時、BGMを開始
        startBGM();
    } else {
        if (DEBUG_MODE) console.log('🔇 サウンドOFF');
        // サウンドOFFにした時、BGMを停止
        stopAllBGM();
    }
}

/**
 * BGMを開始（レベルに応じて自動選択）
 */
function startBGM() {
    if (!soundConfig.enabled) return;

    const level = gameState.level;

    if (level <= 10) {
        playBGM('opening');
    } else if (level <= 20) {
        playRandomLv11_20BGM();
    } else {
        playBGM('ending');
    }
}

/**
 * 指定したBGMを再生
 * @param {string} bgmName - 'opening', 'ending'
 */
function playBGM(bgmName) {
    if (!soundConfig.enabled) return;

    const bgm = audioCache.bgm[bgmName];
    if (!bgm) {
        console.error('BGMが見つかりません:', bgmName);
        return;
    }

    // 既存のBGMをフェードアウト
    if (soundConfig.currentBGM && soundConfig.currentBGM !== bgm) {
        fadeOutBGM(soundConfig.currentBGM);
    }

    // 新しいBGMをフェードイン
    fadeInBGM(bgm);
    soundConfig.currentBGM = bgm;

    if (DEBUG_MODE) console.log('🎵 BGM再生:', bgmName);
}

/**
 * Lv11-20のBGMをランダムに選択して再生
 */
function playRandomLv11_20BGM() {
    if (!soundConfig.enabled) return;

    const bgmList = audioCache.bgm.lv11_20;
    const randomIndex = Math.floor(Math.random() * bgmList.length);
    const bgm = bgmList[randomIndex];

    // 既存のBGMをフェードアウト
    if (soundConfig.currentBGM && soundConfig.currentBGM !== bgm) {
        fadeOutBGM(soundConfig.currentBGM);
    }

    // 新しいBGMをフェードイン
    fadeInBGM(bgm);
    soundConfig.currentBGM = bgm;

    if (DEBUG_MODE) console.log('🎵 Lv11-20 BGM再生:', randomIndex + 1);
}

/**
 * BGMをフェードイン
 * @param {Audio} audio - Audioオブジェクト
 */
function fadeInBGM(audio) {
    audio.volume = 0;
    audio.currentTime = 0;
    audio.play().catch(err => {
        console.warn('BGM再生エラー（ユーザー操作前）:', err);
    });

    // GSAPでフェードイン
    gsap.to(audio, {
        volume: soundConfig.bgmVolume,
        duration: soundConfig.fadeTime,
        ease: 'power2.inOut'
    });
}

/**
 * BGMをフェードアウト
 * @param {Audio} audio - Audioオブジェクト
 */
function fadeOutBGM(audio) {
    gsap.to(audio, {
        volume: 0,
        duration: soundConfig.fadeTime,
        ease: 'power2.inOut',
        onComplete: () => {
            audio.pause();
            audio.currentTime = 0;
        }
    });
}

/**
 * 全てのBGMを停止
 */
function stopAllBGM() {
    // opening BGM
    if (audioCache.bgm.opening) {
        audioCache.bgm.opening.pause();
        audioCache.bgm.opening.currentTime = 0;
    }

    // Lv11-20 BGM
    audioCache.bgm.lv11_20.forEach(bgm => {
        bgm.pause();
        bgm.currentTime = 0;
    });

    // ending BGM
    if (audioCache.bgm.ending) {
        audioCache.bgm.ending.pause();
        audioCache.bgm.ending.currentTime = 0;
    }

    soundConfig.currentBGM = null;
}

/**
 * レベルアップ時のBGM切り替え
 * @param {number} newLevel - 新しいレベル
 */
function onLevelUpBGM(newLevel) {
    if (!soundConfig.enabled) return;

    // Lv10 → Lv11 の切り替え
    if (newLevel === 11) {
        playRandomLv11_20BGM();
    }
}

/**
 * ゲームクリア時のBGM切り替え
 */
function onGameClearBGM() {
    if (!soundConfig.enabled) return;
    playBGM('ending');
}

/**
 * ボタン押下音を再生（ランダム）
 */
function playButtonSound() {
    if (!soundConfig.enabled) return;

    const buttonSounds = audioCache.effect.button;
    const randomIndex = Math.floor(Math.random() * buttonSounds.length);
    playEffect(buttonSounds[randomIndex]);
}

/**
 * エンディングドラムボタン音を再生（ボタンごとに異なるグループ）
 * @param {number} buttonNumber - ボタン番号（1～4）
 */
function playDrumSound(buttonNumber) {
    if (!soundConfig.enabled) return;

    const buttonSounds = audioCache.effect.button;
    let soundGroup = [];

    switch(buttonNumber) {
        case 1:
            // button-001, 002, 003
            soundGroup = [0, 1, 2];
            break;
        case 2:
            // button-004, 005
            soundGroup = [3, 4];
            break;
        case 3:
            // button-006, 007, 008
            soundGroup = [5, 6, 7];
            break;
        case 4:
            // button-001 ~ 008 (all)
            soundGroup = [0, 1, 2, 3, 4, 5, 6, 7];
            break;
        default:
            soundGroup = [0, 1, 2, 3, 4, 5, 6, 7];
    }

    const randomIndex = soundGroup[Math.floor(Math.random() * soundGroup.length)];
    playEffect(buttonSounds[randomIndex]);

    if (DEBUG_MODE) console.log(`🥁 ドラムボタン${buttonNumber}: button-${String(randomIndex + 1).padStart(3, '0')}.mp3`);
}

/**
 * 正解音を再生（コンボ数に応じて変化）
 * @param {number} combo - コンボ数
 */
function playCorrectSound(combo) {
    if (!soundConfig.enabled) return;

    const correctSounds = audioCache.effect.correct;
    let soundIndex = 0;

    if (combo <= 5) {
        soundIndex = 0; // correct-001
    } else if (combo <= 10) {
        soundIndex = 1; // correct-002
    } else {
        soundIndex = 2; // correct-003
    }

    playEffect(correctSounds[soundIndex]);
}

/**
 * コンボ達成音を再生
 * @param {number} combo - コンボ数
 */
function playComboSound(combo) {
    if (!soundConfig.enabled) return;

    const comboSounds = audioCache.effect.combo;
    let soundIndex = 0;

    if (combo === 5) {
        soundIndex = 0; // combo-001
    } else if (combo === 10) {
        soundIndex = 1; // combo-002
    } else if (combo === 15) {
        soundIndex = 2; // combo-003
    } else {
        return; // コンボ音なし
    }

    playEffect(comboSounds[soundIndex]);
}

/**
 * 不正解音を再生
 */
function playWrongSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.wrong);
}

/**
 * レベルアップ音を再生
 */
function playLevelUpSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.levelup);
}

/**
 * ライフ減少音を再生
 */
function playLifeLostSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.lifeLost);
}

/**
 * ゲームオーバー音を再生
 */
function playGameOverSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.gameover);
}

/**
 * 時間警告音を再生
 */
function playWarningSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.warning);
}

/**
 * クリア音を再生
 */
function playClearSound() {
    if (!soundConfig.enabled) return;
    playEffect(audioCache.effect.clear);
}

/**
 * 効果音を再生
 * @param {Audio} audio - Audioオブジェクト
 */
function playEffect(audio) {
    if (!audio) return;

    // 再生位置をリセットして再生
    audio.currentTime = 0;
    audio.play().catch(err => {
        console.warn('効果音再生エラー:', err);
    });
}

/**
 * BGM音量を変更
 * @param {number} volume - 音量 (0.0 - 1.0)
 */
function setBGMVolume(volume) {
    soundConfig.bgmVolume = Math.max(0, Math.min(1, volume));

    // 全てのBGMの音量を更新
    if (audioCache.bgm.opening) audioCache.bgm.opening.volume = soundConfig.bgmVolume;
    audioCache.bgm.lv11_20.forEach(bgm => bgm.volume = soundConfig.bgmVolume);
    if (audioCache.bgm.ending) audioCache.bgm.ending.volume = soundConfig.bgmVolume;

    if (DEBUG_MODE) console.log('🎵 BGM音量:', soundConfig.bgmVolume);
}

/**
 * 効果音音量を変更
 * @param {number} volume - 音量 (0.0 - 1.0)
 */
function setEffectVolume(volume) {
    soundConfig.effectVolume = Math.max(0, Math.min(1, volume));

    // 全ての効果音の音量を更新
    audioCache.effect.button.forEach(sfx => sfx.volume = soundConfig.effectVolume);
    audioCache.effect.correct.forEach(sfx => sfx.volume = soundConfig.effectVolume);
    audioCache.effect.combo.forEach(sfx => sfx.volume = soundConfig.effectVolume);
    if (audioCache.effect.wrong) audioCache.effect.wrong.volume = soundConfig.effectVolume;
    if (audioCache.effect.levelup) audioCache.effect.levelup.volume = soundConfig.effectVolume;
    if (audioCache.effect.lifeLost) audioCache.effect.lifeLost.volume = soundConfig.effectVolume;
    if (audioCache.effect.gameover) audioCache.effect.gameover.volume = soundConfig.effectVolume;
    if (audioCache.effect.warning) audioCache.effect.warning.volume = soundConfig.effectVolume;
    if (audioCache.effect.clear) audioCache.effect.clear.volume = soundConfig.effectVolume;

    if (DEBUG_MODE) console.log('🔔 効果音音量:', soundConfig.effectVolume);
}
