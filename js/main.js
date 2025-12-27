// ========================================
// スターマス - ゲームロジック
// ========================================

// 🛠️ 開発モード（デバッグログとデバッグパネルの表示制御）
// 本番環境では false、開発時は true に変更してください
const DEBUG_MODE = true;

// ゲーム状態管理
const gameState = {
    level: 1,           // 現在のレベル
    score: 0,           // スコア
    combo: 0,           // 連続正解数
    exp: 0,             // 現在の経験値
    maxExp: 10,         // レベルアップに必要な経験値
    currentQuestion: null,  // 現在の問題 { num1, num2, answer }
    isAnswering: false,  // 回答中フラグ
    soundInitialized: false,  // サウンドシステム初期化済みフラグ
    settingsPanelInitialized: false,  // 設定パネル初期化済みフラグ
    drumButtonsInitialized: false,  // ドラムボタン初期化済みフラグ
    drumClickCount: 0,   // ドラムボタンクリック回数
    currentFormulaIndex: 0,  // 現在表示中の公式インデックス
    timeLimitEnabled: false  // 時間制限モードON/OFF
};

// ゲーム設定
const gameConfig = {
    maxLevel: 20,       // 最大レベル
    expPerCorrect: 1,   // 正解時の経験値
    scorePerCorrect: 10 // 正解時のスコア
};

// タイマー状態管理（必殺技の時間停止機能に対応）
const timerState = {
    isRunning: false,   // タイマーが動作中か
    isPaused: false,    // 一時停止中か（必殺技用）
    currentTime: 0,     // 残り時間（ミリ秒）
    maxTime: 10000,     // 制限時間（ミリ秒）
    startTimestamp: 0,  // 開始時刻
    pausedTime: 0,      // 一時停止時の残り時間
    animationId: null   // requestAnimationFrameのID
};

// 必殺技状態管理
const specialMoveState = {
    gauge: 0,           // 必殺技ゲージ（0-100）
    maxGauge: 100,      // 最大ゲージ
    active: {           // 各必殺技の発動状態
        timeStop: false,
        slowMotion: false,
        hint: false
    },
    cooldown: {         // クールダウン時間（ミリ秒）
        timeStop: 5000,     // 時間停止は5秒間
        slowMotion: 8000,   // スローモーションは8秒間
        hint: 0             // ヒントは即座に消費
    },
    cooldownTimers: {   // クールダウンタイマーID
        timeStop: null,
        slowMotion: null,
        hint: null
    }
};

/**
 * ゲーム初期化
 */
function initGame() {
    if (DEBUG_MODE) console.log('🎮 ゲーム初期化中...');

    // 状態をリセット
    gameState.level = 1;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.exp = 0;
    gameState.maxExp = 6; // Phase 3: 初期値を調整 (10 → 6)

    // 必殺技エリアを表示（ゲーム再開時）
    const specialMovesContainer = document.querySelector('.special-moves-container');
    if (specialMovesContainer) {
        specialMovesContainer.style.display = 'flex';
    }

    // UI更新
    updateUI();

    // 最初の問題を生成
    generateQuestion();

    // リスタートボタンのイベントリスナー
    document.getElementById('restartButton').addEventListener('click', () => {
        document.getElementById('gameCompleteEffect').classList.add('hidden');
        initGame();
    });

    // サウンドシステムの初期化（初回のみ）
    if (!gameState.soundInitialized) {
        initSoundSystem();
        gameState.soundInitialized = true;
    }

    // 設定パネルの初期化（初回のみ）
    if (!gameState.settingsPanelInitialized) {
        initSettingsPanel();
        gameState.settingsPanelInitialized = true;
    }

    // デバッグパネルの初期化と表示制御
    initDebugPanel();

    // DEBUG_MODEに応じてデバッグパネルの表示を制御
    const debugPanel = document.getElementById('debugPanel');
    const debugIconBtn = document.getElementById('openDebug');
    if (debugPanel && debugIconBtn) {
        if (DEBUG_MODE) {
            // DEBUG_MODE有効: パネルは非表示、アイコンボタンを表示
            debugPanel.classList.add('hidden');
            debugIconBtn.style.display = 'flex';
        } else {
            // DEBUG_MODE無効: 両方非表示
            debugPanel.style.display = 'none';
            debugIconBtn.style.display = 'none';
        }
    }

    if (DEBUG_MODE) console.log('✅ ゲーム開始！');
}

/**
 * 問題を生成
 */
function generateQuestion() {
    // レベルに応じた数値範囲を決定
    let maxNumber = 10;
    if (gameState.level >= 11) {
        maxNumber = 20;
    }

    // ランダムな足し算問題を生成
    const num1 = Math.floor(Math.random() * maxNumber) + 1;
    const num2 = Math.floor(Math.random() * maxNumber) + 1;
    const answer = num1 + num2;

    gameState.currentQuestion = { num1, num2, answer };

    if (DEBUG_MODE) console.log('❓ 新しい問題生成:', num1 + ' + ' + num2 + ' = ?', '(答え: ' + answer + ')');

    // 問題を画面に表示
    displayQuestion();

    // 回答ボタンを生成
    generateAnswerButtons();

    // 問題表示のアニメーション
    animateQuestionEntry();

    // 回答ボタンの出現アニメーション
    setTimeout(() => {
        animateButtonsEntry();
        // レベルに応じたボタンアニメーション開始
        if (DEBUG_MODE) console.log('🎬 ボタンアニメーション開始: Lv' + gameState.level);
        animateButtonsByLevel(gameState.level);

        // タイマー開始（時間制限モード有効時）
        startTimer();
    }, 800);
}

/**
 * 問題を画面に表示
 */
function displayQuestion() {
    const { num1, num2 } = gameState.currentQuestion;
    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;
}

/**
 * 回答ボタンを生成
 */
function generateAnswerButtons() {
    const container = document.getElementById('answerButtons');
    container.innerHTML = ''; // 既存のボタンをクリア

    const correctAnswer = gameState.currentQuestion.answer;
    const answers = generateAnswerOptions(correctAnswer);

    answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = `answer-button color-${(index % 6) + 1}`;
        button.textContent = answer;
        button.dataset.answer = answer;

        // クリックイベント
        button.addEventListener('click', () => handleAnswer(answer, button));

        container.appendChild(button);
    });
}

/**
 * 回答選択肢を生成（正解 + ダミー3つ）
 * @param {number} correctAnswer - 正解
 * @returns {Array<number>} - シャッフルされた選択肢
 */
function generateAnswerOptions(correctAnswer) {
    const options = [correctAnswer];
    const used = new Set([correctAnswer]);

    // ダミーの選択肢を3つ生成
    while (options.length < 4) {
        // 正解の近くの数値をダミーとして生成
        const offset = Math.floor(Math.random() * 10) - 5; // -5 ~ +5
        let dummy = correctAnswer + offset;

        // 0以下や重複は避ける
        if (dummy > 0 && !used.has(dummy)) {
            options.push(dummy);
            used.add(dummy);
        }
    }

    // シャッフル
    return shuffleArray(options);
}

/**
 * 配列をシャッフル
 * @param {Array} array
 * @returns {Array}
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 回答処理
 * @param {number} answer - 選択された答え
 * @param {HTMLElement} button - クリックされたボタン
 */
function handleAnswer(answer, button) {
    // 回答中は処理しない（連打防止）
    if (gameState.isAnswering) return;
    gameState.isAnswering = true;

    // タイマー停止
    stopTimer();

    // ボタンクリック音を再生
    playButtonSound();

    const correctAnswer = gameState.currentQuestion.answer;

    if (answer === correctAnswer) {
        // 正解
        handleCorrectAnswer(button);
    } else {
        // 不正解
        handleWrongAnswer(button);
    }
}

/**
 * 正解時の処理
 * @param {HTMLElement} button
 */
function handleCorrectAnswer(button) {
    if (DEBUG_MODE) console.log('✅ 正解！ コンボ: ' + gameState.combo + ' → ' + (gameState.combo + 1));

    // Phase 3: 正解したらすぐにボタンの動きを停止
    if (DEBUG_MODE) console.log('📍 handleCorrectAnswer: stopAllButtonAnimations を呼び出します');
    stopAllButtonAnimations();
    if (DEBUG_MODE) console.log('📍 handleCorrectAnswer: stopAllButtonAnimations 呼び出し完了');

    // コンボ増加
    gameState.combo++;

    // 正解音を再生（コンボ数に応じて変化）
    playCorrectSound(gameState.combo);

    // コンボ達成音を再生（5, 10, 15コンボ時）
    playComboSound(gameState.combo);

    // スコア増加
    const scoreGain = gameConfig.scorePerCorrect * gameState.combo;
    gameState.score += scoreGain;
    if (DEBUG_MODE) console.log('💰 スコア +' + scoreGain + ' (合計: ' + gameState.score + ')');

    // 経験値増加（Phase 3: コンボボーナス追加）
    const expGain = calculateExpGain(gameState.combo);
    gameState.exp += expGain;
    if (DEBUG_MODE) console.log('⭐ 経験値 +' + expGain + ' (コンボ' + gameState.combo + 'ボーナス) (' + gameState.exp + '/' + gameState.maxExp + ')');

    // エフェクト再生
    playCorrectEffect(button, gameState.combo);

    // UI更新
    updateUI();

    // レベルアップチェック
    if (gameState.exp >= gameState.maxExp) {
        levelUp();
    }

    // 次の問題へ（Phase 3: テンポアップ 1500ms → 1200ms）
    setTimeout(() => {
        gameState.isAnswering = false;

        // ゲームクリアチェック
        if (gameState.level > gameConfig.maxLevel) {
            gameComplete();
        } else {
            generateQuestion();
        }
    }, 1200);
}

/**
 * コンボ数に応じた経験値を計算（Phase 3新規）
 * @param {number} combo - 現在のコンボ数
 * @returns {number} - 獲得経験値
 */
function calculateExpGain(combo) {
    if (combo === 1) return 1;
    if (combo <= 3) return 2;
    if (combo <= 5) return 3;
    if (combo <= 8) return 4;
    if (combo <= 12) return 5;
    if (combo <= 16) return 6;
    if (combo <= 20) return 7;
    return 8; // コンボ21+
}

/**
 * 不正解時の処理
 * @param {HTMLElement} button
 */
function handleWrongAnswer(button) {
    if (DEBUG_MODE) console.log('❌ 不正解... コンボリセット！');

    // Phase 3: 不正解でもボタンの動きを停止
    if (DEBUG_MODE) console.log('📍 handleWrongAnswer: stopAllButtonAnimations を呼び出します');
    stopAllButtonAnimations();
    if (DEBUG_MODE) console.log('📍 handleWrongAnswer: stopAllButtonAnimations 呼び出し完了');

    // 不正解音を再生
    playWrongSound();

    // コンボリセット
    const oldCombo = gameState.combo;
    gameState.combo = 0;
    if (DEBUG_MODE) console.log('🔄 コンボ: ' + oldCombo + ' → 0');

    // エフェクト再生
    playWrongEffect(button);

    // UI更新
    updateUI();

    // 少し待ってから再び回答可能にする
    setTimeout(() => {
        gameState.isAnswering = false;
    }, 600);
}

/**
 * レベルアップ処理
 */
function levelUp() {
    if (DEBUG_MODE) console.log('🎉 レベルアップ！ Lv' + gameState.level + ' → Lv' + (gameState.level + 1));

    // レベル増加
    gameState.level++;

    // 次のレベルに必要な経験値を計算（Phase 3: 大幅削減）
    gameState.maxExp = Math.floor(6 + gameState.level * 0.8);
    if (DEBUG_MODE) console.log('📊 次のレベルアップまで: ' + gameState.maxExp + '経験値');

    // 🎯 経験値バーを100%まで満たすアニメーション
    animateExpBar(100);

    // レベルアップエフェクト
    playLevelUpEffect();

    // レベルアップ音を再生
    playLevelUpSound();

    // BGM切り替え（Lv10→Lv11の時）
    onLevelUpBGM(gameState.level);

    // UI更新（レベル、スコア、コンボのみ）
    animateNumber('level', gameState.level);
    animateNumber('score', gameState.score);
    animateNumber('combo', gameState.combo);

    // 経験値の最大値テキストを更新
    document.getElementById('maxExp').textContent = gameState.maxExp;

    // ヒントメッセージ更新
    updateTipMessage();

    // デバッグパネルの更新
    updateDebugPanel();

    // 🎯 少し待ってから経験値を0に瞬時リセット（溢れた→リセットの流れ）
    setTimeout(() => {
        gameState.exp = 0;
        document.getElementById('currentExp').textContent = 0;
        // 経験値バーを瞬時に0%にリセット（アニメーションなし）
        const bar = document.querySelector('.exp-bar-fill');
        gsap.set(bar, { width: '0%' });
    }, 800); // レベルアップエフェクトの表示時間に合わせる

    // 🔧 重要: レベルアップ直後にボタンアニメーションを更新
    if (DEBUG_MODE) console.log('🔄 ボタンアニメーションを新しいレベルに更新: Lv' + gameState.level);
    setTimeout(() => {
        animateButtonsByLevel(gameState.level);
    }, 2000); // レベルアップエフェクト後に更新
}

/**
 * ゲームクリア処理
 */
function gameComplete() {
    if (DEBUG_MODE) console.log('ゲームクリア！');

    // クリア音を再生
    playClearSound();

    // エンディングBGMに切り替え
    onGameClearBGM();

    // 最終スコアを表示
    document.getElementById('finalScore').textContent = gameState.score;

    // ドラムクリックカウントと公式インデックスをリセット
    gameState.drumClickCount = 0;
    gameState.currentFormulaIndex = 0;

    // ドラムボタンのイベントリスナー設定（初回のみ）
    if (!gameState.drumButtonsInitialized) {
        initDrumButtons();
        gameState.drumButtonsInitialized = true;
    }

    // 必殺技エリアを非表示（クリア画面をすっきりさせる）
    const specialMovesContainer = document.querySelector('.special-moves-container');
    if (specialMovesContainer) {
        specialMovesContainer.style.display = 'none';
    }

    // クリアエフェクト再生
    playGameCompleteEffect();
}

/**
 * UI更新
 */
function updateUI() {
    if (DEBUG_MODE) {
        console.log('📊 UI更新:', {
            level: gameState.level,
            score: gameState.score,
            combo: gameState.combo,
            exp: gameState.exp + '/' + gameState.maxExp
        });
    }

    // レベル
    animateNumber('level', gameState.level);

    // スコア
    animateNumber('score', gameState.score);

    // コンボ
    animateNumber('combo', gameState.combo);

    // 経験値
    document.getElementById('currentExp').textContent = gameState.exp;
    document.getElementById('maxExp').textContent = gameState.maxExp;

    // 経験値バー
    const expPercent = (gameState.exp / gameState.maxExp) * 100;
    animateExpBar(expPercent);

    // デバッグパネルの更新
    updateDebugPanel();
}

/**
 * ヒントメッセージ更新
 */
function updateTipMessage() {
    const tipElement = document.getElementById('gameTip');
    const tips = [
        '正解すると星が増えるよ！',
        '連続正解でコンボボーナス！',
        'レベルが上がると難しくなるよ！',
        'がんばって全ての星座をマスターしよう！',
        'エフェクトがどんどん派手になるよ！',
        '動くボタンをクリックできるかな？'
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipElement.textContent = randomTip;

    // フェードインアニメーション
    gsap.fromTo(tipElement,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 }
    );
}

/**
 * デバッグパネル初期化
 */
function initDebugPanel() {
    if (DEBUG_MODE) console.log('🛠️ デバッグパネル初期化');

    // 開閉ボタンのイベントリスナー
    const openButton = document.getElementById('openDebug');
    const closeButton = document.getElementById('closeDebug');
    const debugPanel = document.getElementById('debugPanel');

    openButton.addEventListener('click', () => {
        debugPanel.classList.remove('hidden');
        openButton.style.display = 'none';
        if (DEBUG_MODE) console.log('デバッグパネル: 表示');
    });

    closeButton.addEventListener('click', () => {
        debugPanel.classList.add('hidden');
        openButton.style.display = 'flex';
        if (DEBUG_MODE) console.log('デバッグパネル: 非表示');
    });

    // レベル選択ボタンのイベントリスナー
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetLevel = parseInt(button.dataset.level);
            if (DEBUG_MODE) console.log('🔧 デバッグ: レベルを ' + targetLevel + ' に変更');

            // レベルを即座に変更
            gameState.level = targetLevel;
            gameState.maxExp = Math.floor(6 + gameState.level * 0.8); // Phase 3: 計算式を統一

            // UI更新
            updateUI();

            // アクティブボタンの表示更新
            levelButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // ボタンアニメーションを即座に更新
            if (DEBUG_MODE) console.log('🎬 ボタンアニメーション即座更新: Lv' + targetLevel);
            animateButtonsByLevel(targetLevel);
        });
    });

    // 初期のアクティブボタン設定
    levelButtons[0].classList.add('active');
}

/**
 * デバッグパネルの情報更新
 */
function updateDebugPanel() {
    document.getElementById('debugLevel').textContent = gameState.level;
    document.getElementById('debugCombo').textContent = gameState.combo;
    document.getElementById('debugExp').textContent = gameState.exp;
    document.getElementById('debugMaxExp').textContent = gameState.maxExp;

    // アクティブなレベルボタンを更新
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(button => {
        const level = parseInt(button.dataset.level);
        if (level === gameState.level) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// ========================================
// タイマー管理システム（必殺技の時間停止に対応）
// ========================================

/**
 * タイマーを開始
 */
function startTimer() {
    if (!gameState.timeLimitEnabled) return;

    // レベルに応じた制限時間を設定（Lv1-10: 10秒, Lv11-20: 8秒）
    timerState.maxTime = gameState.level <= 10 ? 10000 : 8000;
    timerState.currentTime = timerState.maxTime;
    timerState.startTimestamp = performance.now();
    timerState.isRunning = true;
    timerState.isPaused = false;

    if (DEBUG_MODE) console.log('⏱️ タイマー開始:', timerState.maxTime / 1000 + '秒');

    updateTimer();
}

/**
 * タイマーを一時停止（必殺技用）
 */
function pauseTimer() {
    if (!timerState.isRunning || timerState.isPaused) return;

    timerState.isPaused = true;
    timerState.pausedTime = timerState.currentTime;

    if (timerState.animationId) {
        cancelAnimationFrame(timerState.animationId);
        timerState.animationId = null;
    }

    if (DEBUG_MODE) console.log('⏸️ タイマー一時停止:', timerState.currentTime / 1000 + '秒残り');
}

/**
 * タイマーを再開（必殺技解除時）
 */
function resumeTimer() {
    if (!timerState.isRunning || !timerState.isPaused) return;

    timerState.isPaused = false;
    timerState.startTimestamp = performance.now();
    timerState.currentTime = timerState.pausedTime;

    if (DEBUG_MODE) console.log('▶️ タイマー再開:', timerState.currentTime / 1000 + '秒残り');

    updateTimer();
}

/**
 * タイマーを停止
 */
function stopTimer() {
    timerState.isRunning = false;
    timerState.isPaused = false;

    if (timerState.animationId) {
        cancelAnimationFrame(timerState.animationId);
        timerState.animationId = null;
    }

    if (DEBUG_MODE) console.log('⏹️ タイマー停止');
}

/**
 * タイマーをリセット
 */
function resetTimer() {
    stopTimer();
    timerState.currentTime = 0;
    updateTimerUI();
}

/**
 * タイマー更新（requestAnimationFrame）
 */
function updateTimer() {
    if (!timerState.isRunning || timerState.isPaused) return;

    const now = performance.now();
    const elapsed = now - timerState.startTimestamp;
    timerState.currentTime = Math.max(0, timerState.pausedTime > 0 ? timerState.pausedTime - elapsed : timerState.maxTime - elapsed);

    // UI更新
    updateTimerUI();

    // 時間切れチェック
    if (timerState.currentTime <= 0) {
        onTimeUp();
        return;
    }

    // 次フレーム
    timerState.animationId = requestAnimationFrame(updateTimer);
}

/**
 * タイマーUI更新
 */
function updateTimerUI() {
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');

    if (!timerBar || !timerText) return;

    const percentage = (timerState.currentTime / timerState.maxTime) * 100;
    const seconds = (timerState.currentTime / 1000).toFixed(1);

    timerBar.style.width = percentage + '%';
    timerText.textContent = seconds + 's';

    // 残り時間に応じて色変化
    timerBar.classList.remove('timer-low', 'timer-critical');
    if (percentage <= 20) {
        timerBar.classList.add('timer-critical');
    } else if (percentage <= 50) {
        timerBar.classList.add('timer-low');
    }
}

/**
 * 時間切れ時の処理
 */
function onTimeUp() {
    if (DEBUG_MODE) console.log('⏰ 時間切れ！');

    stopTimer();

    // 不正解と同じ処理
    gameState.combo = 0;
    playIncorrectSound();

    // フラッシュエフェクト
    gsap.to('.game-main', {
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            gsap.set('.game-main', { backgroundColor: 'transparent' });
        }
    });

    // 次の問題へ
    setTimeout(() => {
        generateQuestion();
    }, 800);
}

/**
 * 設定パネル初期化
 */
function initSettingsPanel() {
    if (DEBUG_MODE) console.log('🔊 設定パネル初期化');

    const openButton = document.getElementById('openSettings');
    const closeButton = document.getElementById('closeSettings');
    const settingsPanel = document.getElementById('settingsPanel');

    // 開くボタン
    openButton.addEventListener('click', () => {
        settingsPanel.classList.remove('hidden');
        openButton.style.display = 'none';
        if (DEBUG_MODE) console.log('設定パネル: 表示');
    });

    // 閉じるボタン
    closeButton.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
        openButton.style.display = 'flex';
        if (DEBUG_MODE) console.log('設定パネル: 非表示');
    });

    // サウンドON/OFFボタン
    const soundToggleBtn = document.getElementById('soundEnabled');
    soundToggleBtn.addEventListener('click', () => {
        const newState = !soundConfig.enabled;
        toggleSound(newState);
        soundToggleBtn.textContent = newState ? 'ON' : 'OFF';
        soundToggleBtn.classList.toggle('active', newState);
        if (DEBUG_MODE) console.log('サウンド:', newState ? 'ON' : 'OFF');
    });

    // BGM音量スライダー
    const bgmVolumeSlider = document.getElementById('bgmVolume');
    const bgmVolumeValue = document.getElementById('bgmVolumeValue');
    bgmVolumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        setBGMVolume(volume);
        bgmVolumeValue.textContent = e.target.value + '%';
    });

    // 効果音音量スライダー
    const effectVolumeSlider = document.getElementById('effectVolume');
    const effectVolumeValue = document.getElementById('effectVolumeValue');
    effectVolumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value) / 100;
        setEffectVolume(volume);
        effectVolumeValue.textContent = e.target.value + '%';
    });

    // 時間制限ON/OFFボタン
    const timeLimitToggleBtn = document.getElementById('timeLimitEnabled');
    timeLimitToggleBtn.addEventListener('click', () => {
        gameState.timeLimitEnabled = !gameState.timeLimitEnabled;
        timeLimitToggleBtn.textContent = gameState.timeLimitEnabled ? 'ON' : 'OFF';
        timeLimitToggleBtn.classList.toggle('active', gameState.timeLimitEnabled);

        // タイマーコンテナの表示/非表示
        const timerContainer = document.getElementById('timerContainer');
        if (timerContainer) {
            timerContainer.style.display = gameState.timeLimitEnabled ? 'flex' : 'none';
        }

        if (DEBUG_MODE) console.log('時間制限:', gameState.timeLimitEnabled ? 'ON' : 'OFF');

        // 現在タイマーが動作中ならリセット
        if (!gameState.timeLimitEnabled && timerState.isRunning) {
            resetTimer();
        }
    });
}

/**
 * 知識を表示する（ドラム10回以上で発動）
 */
function displayFormula() {
    // 知識リストが存在しない場合は何もしない
    if (typeof knowledgeItems === 'undefined' || knowledgeItems.length === 0) {
        if (DEBUG_MODE) console.warn('⚠️ 知識データが見つかりません');
        return;
    }

    // 現在の知識を取得
    const item = knowledgeItems[gameState.currentFormulaIndex];

    // メッセージとスコア表示を知識に置き換え
    const messageElement = document.querySelector('.complete-message');
    const scoreElement = document.querySelector('.complete-score');

    if (messageElement && scoreElement) {
        // カテゴリー + タイトルを表示
        messageElement.innerHTML = `<span style="font-size: 0.7em; color: #ffd93d;">[${item.category}]</span><br>${item.title}`;
        scoreElement.innerHTML = item.content;

        // アニメーション効果
        gsap.fromTo(messageElement,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
        gsap.fromTo(scoreElement,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)', delay: 0.1 }
        );

        if (DEBUG_MODE) console.log(`📚 知識表示 [${gameState.currentFormulaIndex + 1}/${knowledgeItems.length}] [${item.category}]:`, item.title);
    }

    // 次の知識へ進む（最後まで行ったら最初に戻る）
    gameState.currentFormulaIndex = (gameState.currentFormulaIndex + 1) % knowledgeItems.length;
}

/**
 * エンディングドラムボタン初期化
 */
function initDrumButtons() {
    if (DEBUG_MODE) console.log('🥁 ドラムボタン初期化');

    const drumButtons = document.querySelectorAll('.drum-btn');

    drumButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ボタン番号を取得（1～4）
            const buttonNumber = parseInt(button.dataset.drum);

            // ドラムクリック回数をカウント
            gameState.drumClickCount++;

            // ドラムサウンドを再生（ボタンごとに異なるグループ）
            playDrumSound(buttonNumber);

            // 10回以上叩いたら公式を表示
            if (gameState.drumClickCount >= 10) {
                displayFormula();
            }

            // Lv1相当のエフェクト（軽めのパーティクル）
            const buttonRect = button.getBoundingClientRect();
            const centerX = buttonRect.left + buttonRect.width / 2;
            const centerY = buttonRect.top + buttonRect.height / 2;

            // パーティクル生成（10個程度）
            for (let i = 0; i < 10; i++) {
                createParticle(centerX, centerY, '#ffd93d');
            }

            // ボタンフラッシュエフェクト
            gsap.timeline()
                .to(button, {
                    scale: 0.9,
                    duration: 0.1,
                    ease: 'power2.out'
                })
                .to(button, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'elastic.out(1, 0.3)'
                });
        });
    });
}

/**
 * DOMロード完了時にゲーム初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    if (DEBUG_MODE) console.log('🚀 DOMロード完了');
    initGame();
});
