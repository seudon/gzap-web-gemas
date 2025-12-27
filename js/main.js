// ========================================
// スターマス - ゲームロジック
// ========================================

// 🛠️ 開発モード（デバッグログとデバッグパネルの表示制御）
// 本番環境では false、開発時は true に変更してください
const DEBUG_MODE = false;

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
    settingsPanelInitialized: false  // 設定パネル初期化済みフラグ
};

// ゲーム設定
const gameConfig = {
    maxLevel: 20,       // 最大レベル
    expPerCorrect: 1,   // 正解時の経験値
    scorePerCorrect: 10 // 正解時のスコア
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

    // 本番環境ではデバッグパネルを非表示
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        debugPanel.style.display = DEBUG_MODE ? 'block' : 'none';
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

    // 表示/非表示トグル
    const toggleButton = document.getElementById('toggleDebug');
    const debugContent = document.querySelector('.debug-content');
    let isVisible = true;

    toggleButton.addEventListener('click', () => {
        isVisible = !isVisible;
        debugContent.classList.toggle('hidden');
        if (DEBUG_MODE) console.log('デバッグパネル:', isVisible ? '表示' : '非表示');
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
}

/**
 * DOMロード完了時にゲーム初期化
 */
document.addEventListener('DOMContentLoaded', () => {
    if (DEBUG_MODE) console.log('🚀 DOMロード完了');
    initGame();
});
