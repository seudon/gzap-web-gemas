// ========================================
// スターマス - ゲームロジック
// ========================================

// 🛠️ 開発モード（デバッグログとデバッグパネルの表示制御）
// 本番環境では false、開発時は true に変更してください
const DEBUG_MODE = false;

// ========================================
// ゲーム定数（マジックナンバーの定義）
// ========================================

// レベル・経験値システム
const GAME_CONSTANTS = {
    // レベル設定
    MAX_LEVEL: 20,
    LEVEL_THRESHOLD_EASY: 10,        // Lv1-10
    LEVEL_THRESHOLD_HARD: 20,        // Lv11-20

    // 経験値計算
    INITIAL_EXP_REQUIRED: 6,         // 初期レベルアップに必要な経験値
    EXP_LEVEL_MULTIPLIER: 0.8,       // レベルごとの経験値増加率

    // コンボ別経験値ボーナス
    EXP_GAIN_COMBO_1: 1,
    EXP_GAIN_COMBO_2_3: 2,
    EXP_GAIN_COMBO_4_5: 3,
    EXP_GAIN_COMBO_6_8: 4,
    EXP_GAIN_COMBO_9_12: 5,
    EXP_GAIN_COMBO_13_16: 6,
    EXP_GAIN_COMBO_17_20: 7,
    EXP_GAIN_COMBO_21_PLUS: 8,

    // 問題生成
    NUMBER_RANGE_EASY: 10,           // Lv1-10の数値範囲
    NUMBER_RANGE_HARD: 20,           // Lv11-20の数値範囲
    ANSWER_BUTTON_COUNT: 4,          // 回答ボタンの総数
    DUMMY_ANSWER_COUNT: 3,           // ダミー回答の数
    DUMMY_OFFSET_MIN: -5,            // ダミー回答のオフセット最小値
    DUMMY_OFFSET_MAX: 5,             // ダミー回答のオフセット最大値
    DUMMY_OFFSET_RANGE: 10,          // ダミー回答のオフセット範囲

    // タイミング設定（ミリ秒）
    DELAY_NEXT_QUESTION: 1200,       // 正解後、次の問題までの遅延
    DELAY_WRONG_ANSWER: 600,         // 不正解後の遅延
    DELAY_BUTTON_ENTRY: 800,         // ボタン出現アニメーション開始までの遅延
    DELAY_LEVELUP_RESET: 800,        // レベルアップ後の経験値リセット遅延
    DELAY_LEVELUP_ANIMATION: 2000,   // レベルアップエフェクト後のボタン更新遅延

    // タイマーシステム
    TIMER_DURATION_EASY: 10000,      // Lv1-10の制限時間（10秒）
    TIMER_DURATION_HARD: 8000,       // Lv11-20の制限時間（8秒）

    // 必殺技ゲージ
    GAUGE_MAX: 100,                  // 最大ゲージ量
    GAUGE_CHARGE_BASE: 5,            // 基本チャージ量
    GAUGE_CHARGE_COMBO_MULTIPLIER: 2,// コンボボーナス倍率
    GAUGE_CHARGE_MAX: 20,            // 1回のチャージ上限

    // 必殺技コスト
    SPECIAL_COST_TIME_STOP: 20,      // 時間停止のゲージコスト
    SPECIAL_COST_SLOW_MOTION: 15,    // スローモーションのゲージコスト
    SPECIAL_COST_HINT: 5,            // ヒントのゲージコスト

    // 必殺技持続時間（ミリ秒）
    SPECIAL_DURATION_TIME_STOP: 10000,   // 時間停止の持続時間（10秒）
    SPECIAL_DURATION_SLOW_MOTION: 8000,  // スローモーションの持続時間（8秒）
    SPECIAL_DURATION_HINT: 0,            // ヒントは即座に消費
    SPECIAL_HINT_RESET_DELAY: 100,       // ヒントリセット遅延

    // スローモーション設定
    SLOW_MOTION_TIME_SCALE: 0.3,     // スローモーション時のタイムスケール（0.3倍速）

    // サウンド設定
    COMBO_SOUND_THRESHOLD_1: 5,      // コンボ音レベル1の閾値
    COMBO_SOUND_THRESHOLD_2: 10,     // コンボ音レベル2の閾値
    COMBO_SOUND_THRESHOLD_3: 15,     // コンボ音レベル3の閾値

    // ドラム機能
    DRUM_CLICK_THRESHOLD: 10,        // ドラムボタンを何回叩いたら知識表示するか

    // 演算子設定
    OPERATORS: {
        ADDITION: '+',
        SUBTRACTION: '-',
        MULTIPLICATION: '*'
    },

    // 掛け算の数値範囲（九九固定）
    MULTIPLICATION_NUMBER_MAX: 9
};

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
    timeLimitEnabled: false,  // 時間制限モードON/OFF
    specialMoveButtonsInitialized: false,  // 必殺技ボタン初期化済みフラグ
    selectedOperators: {      // 演算子選択状態
        addition: true,       // 足し算（デフォルトON）
        subtraction: false,   // 引き算
        multiplication: false // 掛け算
    }
};

// ゲーム設定
const gameConfig = {
    maxLevel: GAME_CONSTANTS.MAX_LEVEL,    // 最大レベル
    expPerCorrect: 1,                       // 正解時の経験値（コンボで変動）
    scorePerCorrect: 10                     // 正解時のスコア
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
    gauge: 0,                                           // 必殺技ゲージ（0-100）
    maxGauge: GAME_CONSTANTS.GAUGE_MAX,                // 最大ゲージ
    active: {                                           // 各必殺技の発動状態
        timeStop: false,
        slowMotion: false,
        hint: false
    },
    cooldown: {                                         // クールダウン時間（ミリ秒）
        timeStop: GAME_CONSTANTS.SPECIAL_DURATION_TIME_STOP,
        slowMotion: GAME_CONSTANTS.SPECIAL_DURATION_SLOW_MOTION,
        hint: GAME_CONSTANTS.SPECIAL_DURATION_HINT
    },
    cooldownTimers: {                                   // クールダウンタイマーID
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
    gameState.maxExp = GAME_CONSTANTS.INITIAL_EXP_REQUIRED;

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

    // 必殺技ボタンの初期化（初回のみ）
    if (!gameState.specialMoveButtonsInitialized) {
        initSpecialMoveButtons();
        gameState.specialMoveButtonsInitialized = true;
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
    // 🔧 次の問題に移る際、すべての発動中の必殺技を強制リセット
    // （正解時に必殺技が発動中の場合の対策）
    ['hint', 'timeStop', 'slowMotion'].forEach(moveType => {
        if (specialMoveState.active[moveType]) {
            if (DEBUG_MODE) console.log(`🔄 次問題生成時: ${moveType}を強制リセット`);
            resetSpecialMove(moveType);
        }
    });

    // 🔧 ボタンアニメーションを停止し、位置をリセット
    stopAllButtonAnimations();

    // 🔧 選択肢が揃うまで必殺技ボタンを無効化
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.disabled = true;
    });

    // レベルに応じた数値範囲を決定
    let maxNumber = GAME_CONSTANTS.NUMBER_RANGE_EASY;
    if (gameState.level >= GAME_CONSTANTS.LEVEL_THRESHOLD_EASY + 1) {
        maxNumber = GAME_CONSTANTS.NUMBER_RANGE_HARD;
    }

    // 有効な演算子からランダムに選択
    const enabledOperators = [];
    if (gameState.selectedOperators.addition) enabledOperators.push(GAME_CONSTANTS.OPERATORS.ADDITION);
    if (gameState.selectedOperators.subtraction) enabledOperators.push(GAME_CONSTANTS.OPERATORS.SUBTRACTION);
    if (gameState.selectedOperators.multiplication) enabledOperators.push(GAME_CONSTANTS.OPERATORS.MULTIPLICATION);

    // フォールバック: 何も選択されていない場合は足し算
    if (enabledOperators.length === 0) {
        enabledOperators.push(GAME_CONSTANTS.OPERATORS.ADDITION);
    }

    const operator = enabledOperators[Math.floor(Math.random() * enabledOperators.length)];

    let num1, num2, answer;

    switch (operator) {
        case GAME_CONSTANTS.OPERATORS.ADDITION:
            // 足し算（既存ロジック）
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * maxNumber) + 1;
            answer = num1 + num2;
            break;

        case GAME_CONSTANTS.OPERATORS.SUBTRACTION:
            // 引き算（答えがマイナスにならないよう num1 >= num2）
            const tempA = Math.floor(Math.random() * maxNumber) + 1;
            const tempB = Math.floor(Math.random() * maxNumber) + 1;
            num1 = Math.max(tempA, tempB);
            num2 = Math.min(tempA, tempB);
            answer = num1 - num2;
            break;

        case GAME_CONSTANTS.OPERATORS.MULTIPLICATION:
            // 掛け算（九九の範囲 1-9 固定）
            num1 = Math.floor(Math.random() * GAME_CONSTANTS.MULTIPLICATION_NUMBER_MAX) + 1;
            num2 = Math.floor(Math.random() * GAME_CONSTANTS.MULTIPLICATION_NUMBER_MAX) + 1;
            answer = num1 * num2;
            break;
    }

    gameState.currentQuestion = { num1, num2, answer, operator };

    const displayOp = operator === GAME_CONSTANTS.OPERATORS.MULTIPLICATION ? 'x' : operator;
    if (DEBUG_MODE) console.log('❓ 新しい問題生成:', num1 + ' ' + displayOp + ' ' + num2 + ' = ?', '(答え: ' + answer + ')');

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

        // 選択肢が揃ったので必殺技ボタンを有効化
        updateSpecialButtons();
    }, GAME_CONSTANTS.DELAY_BUTTON_ENTRY);
}

/**
 * 問題を画面に表示
 */
function displayQuestion() {
    const { num1, num2, operator } = gameState.currentQuestion;
    document.getElementById('num1').textContent = num1;
    document.getElementById('num2').textContent = num2;

    // 演算子を表示（掛け算は x 記号で表示）
    const displayOperator = operator === GAME_CONSTANTS.OPERATORS.MULTIPLICATION ? 'x' : operator;
    document.getElementById('operator').textContent = displayOperator;
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

    // ダミーの選択肢を生成
    while (options.length < GAME_CONSTANTS.ANSWER_BUTTON_COUNT) {
        // 正解の近くの数値をダミーとして生成
        const offset = Math.floor(Math.random() * GAME_CONSTANTS.DUMMY_OFFSET_RANGE) + GAME_CONSTANTS.DUMMY_OFFSET_MIN;
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

    // 必殺技ゲージ増加（コンボに応じて）
    chargeSpecialGauge(gameState.combo);

    // エフェクト再生
    playCorrectEffect(button, gameState.combo);

    // UI更新
    updateUI();

    // レベルアップチェック
    if (gameState.exp >= gameState.maxExp) {
        levelUp();
    }

    // 次の問題へ
    setTimeout(() => {
        gameState.isAnswering = false;

        // ゲームクリアチェック
        if (gameState.level > gameConfig.maxLevel) {
            gameComplete();
        } else {
            generateQuestion();
        }
    }, GAME_CONSTANTS.DELAY_NEXT_QUESTION);
}

/**
 * コンボ数に応じた経験値を計算
 * @param {number} combo - 現在のコンボ数
 * @returns {number} - 獲得経験値
 */
function calculateExpGain(combo) {
    if (combo === 1) return GAME_CONSTANTS.EXP_GAIN_COMBO_1;
    if (combo <= 3) return GAME_CONSTANTS.EXP_GAIN_COMBO_2_3;
    if (combo <= 5) return GAME_CONSTANTS.EXP_GAIN_COMBO_4_5;
    if (combo <= 8) return GAME_CONSTANTS.EXP_GAIN_COMBO_6_8;
    if (combo <= 12) return GAME_CONSTANTS.EXP_GAIN_COMBO_9_12;
    if (combo <= 16) return GAME_CONSTANTS.EXP_GAIN_COMBO_13_16;
    if (combo <= 20) return GAME_CONSTANTS.EXP_GAIN_COMBO_17_20;
    return GAME_CONSTANTS.EXP_GAIN_COMBO_21_PLUS;
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
    }, GAME_CONSTANTS.DELAY_WRONG_ANSWER);
}

/**
 * レベルアップ処理
 */
function levelUp() {
    if (DEBUG_MODE) console.log('🎉 レベルアップ！ Lv' + gameState.level + ' → Lv' + (gameState.level + 1));

    // レベル増加
    gameState.level++;

    // 次のレベルに必要な経験値を計算
    gameState.maxExp = Math.floor(GAME_CONSTANTS.INITIAL_EXP_REQUIRED + gameState.level * GAME_CONSTANTS.EXP_LEVEL_MULTIPLIER);
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
    }, GAME_CONSTANTS.DELAY_LEVELUP_RESET);

    // 🔧 重要: レベルアップ直後にボタンアニメーションを更新
    if (DEBUG_MODE) console.log('🔄 ボタンアニメーションを新しいレベルに更新: Lv' + gameState.level);
    setTimeout(() => {
        animateButtonsByLevel(gameState.level);
    }, GAME_CONSTANTS.DELAY_LEVELUP_ANIMATION);
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
            gameState.maxExp = Math.floor(GAME_CONSTANTS.INITIAL_EXP_REQUIRED + gameState.level * GAME_CONSTANTS.EXP_LEVEL_MULTIPLIER);

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

    // レベルに応じた制限時間を設定
    timerState.maxTime = gameState.level <= GAME_CONSTANTS.LEVEL_THRESHOLD_EASY ?
        GAME_CONSTANTS.TIMER_DURATION_EASY :
        GAME_CONSTANTS.TIMER_DURATION_HARD;
    timerState.currentTime = timerState.maxTime;
    timerState.startTimestamp = performance.now();
    timerState.isRunning = true;
    timerState.isPaused = false;
    timerState.pausedTime = 0; // 前の問題のpausedTimeをリセット

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
    let elapsed = now - timerState.startTimestamp;

    // スローモーション中は時間の進み方を遅くする
    if (specialMoveState.active.slowMotion) {
        elapsed *= GAME_CONSTANTS.SLOW_MOTION_TIME_SCALE;
    }

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

// ========================================
// 必殺技システム
// ========================================

/**
 * 必殺技ゲージをチャージ
 * @param {number} combo - 現在のコンボ数
 */
function chargeSpecialGauge(combo) {
    // コンボに応じてゲージ増加（コンボが高いほど多く増える）
    const chargeAmount = Math.min(
        GAME_CONSTANTS.GAUGE_CHARGE_BASE + combo * GAME_CONSTANTS.GAUGE_CHARGE_COMBO_MULTIPLIER,
        GAME_CONSTANTS.GAUGE_CHARGE_MAX
    );
    specialMoveState.gauge = Math.min(specialMoveState.gauge + chargeAmount, specialMoveState.maxGauge);

    if (DEBUG_MODE) console.log('⚡ ゲージ +' + chargeAmount + ' (' + specialMoveState.gauge + '/' + specialMoveState.maxGauge + ')');

    updateSpecialGaugeUI();

    // ゲージが溜まった時のエフェクト
    if (specialMoveState.gauge === specialMoveState.maxGauge) {
        playGaugeFullEffect();
    }
}

/**
 * 必殺技ゲージUI更新
 */
function updateSpecialGaugeUI() {
    const gaugeFill = document.querySelector('.special-gauge-fill');
    const gaugeText = document.getElementById('specialGaugeText');

    if (gaugeFill) {
        gaugeFill.style.width = specialMoveState.gauge + '%';
    }
    if (gaugeText) {
        gaugeText.textContent = Math.floor(specialMoveState.gauge) + '%';
    }

    // ボタンの有効/無効を更新
    updateSpecialButtons();
}

/**
 * 必殺技ボタンの有効/無効を更新
 */
function updateSpecialButtons() {
    const timeStopBtn = document.getElementById('timeStopBtn');
    const slowMotionBtn = document.getElementById('slowMotionBtn');
    const hintBtn = document.getElementById('hintBtn');

    // 時間停止: 必要なゲージ量以上で使用可能
    if (timeStopBtn) {
        timeStopBtn.disabled = specialMoveState.gauge < GAME_CONSTANTS.SPECIAL_COST_TIME_STOP || specialMoveState.active.timeStop;
    }

    // スローモーション: 必要なゲージ量以上で使用可能
    if (slowMotionBtn) {
        slowMotionBtn.disabled = specialMoveState.gauge < GAME_CONSTANTS.SPECIAL_COST_SLOW_MOTION || specialMoveState.active.slowMotion;
    }

    // ヒント: 必要なゲージ量以上で使用可能
    if (hintBtn) {
        hintBtn.disabled = specialMoveState.gauge < GAME_CONSTANTS.SPECIAL_COST_HINT || specialMoveState.active.hint;
    }
}

/**
 * ゲージ満タン時のエフェクト
 */
function playGaugeFullEffect() {
    const gaugeContainer = document.querySelector('.special-gauge-container');

    // 画面フラッシュ
    gsap.to('.game-main', {
        backgroundColor: 'rgba(255, 217, 61, 0.3)',
        duration: 0.15,
        yoyo: true,
        repeat: 3
    });

    // ゲージコンテナを強調
    gsap.timeline()
        .to(gaugeContainer, {
            scale: 1.1,
            duration: 0.2,
            ease: 'back.out(2)'
        })
        .to(gaugeContainer, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
        });

    if (DEBUG_MODE) console.log('⚡⚡⚡ ゲージMAX！必殺技使用可能！');
}

/**
 * 必殺技名を画面いっぱいに表示
 * @param {string} moveName - 必殺技名
 * @param {string} color - テキストカラー
 */
function showSpecialMoveName(moveName, color) {
    // 背景オーバーレイを作成（コントラスト向上）
    const overlay = document.createElement('div');
    overlay.className = 'special-move-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        pointer-events: none;
    `;
    document.body.appendChild(overlay);

    // 必殺技名のテキスト表示
    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'special-move-name-display';
    nameDisplay.textContent = moveName;
    nameDisplay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: clamp(2.5rem, 11vw, 8rem);
        font-weight: bold;
        color: ${color};
        text-shadow: 0 0 40px ${color}, 0 0 80px ${color}, 0 0 120px ${color};
        -webkit-text-stroke: 3px rgba(0, 0, 0, 0.8);
        z-index: 10000;
        text-align: center;
        pointer-events: none;
        white-space: nowrap;
        letter-spacing: clamp(0.1rem, 0.3vw, 0.5rem);
        max-width: 95vw;
    `;
    document.body.appendChild(nameDisplay);

    // 背景のフェードイン
    gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );

    // 派手な登場アニメーション
    gsap.fromTo(nameDisplay,
        { scale: 0, rotation: -10, opacity: 0 },
        {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'back.out(2)'
        }
    );

    // 1秒後にフェードアウト
    gsap.to(nameDisplay, {
        scale: 1.2,
        opacity: 0,
        duration: 0.5,
        delay: 1,
        ease: 'power2.in',
        onComplete: () => nameDisplay.remove()
    });

    // 背景も同時にフェードアウト
    gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        delay: 1,
        ease: 'power2.in',
        onComplete: () => overlay.remove()
    });
}

/**
 * 必殺技発動の共通処理
 * @param {string} moveType - 必殺技タイプ ('timeStop', 'slowMotion', 'hint')
 * @param {number} cost - 消費ゲージ
 * @param {Function} activateFunc - 発動処理関数
 */
function activateSpecialMove(moveType, cost, activateFunc) {
    // ゲージが足りない場合は発動しない
    if (specialMoveState.gauge < cost) {
        if (DEBUG_MODE) console.log('⚠️ ゲージ不足:', specialMoveState.gauge + '/' + cost);
        return;
    }

    // 既に発動中の場合は発動しない
    if (specialMoveState.active[moveType]) {
        if (DEBUG_MODE) console.log('⚠️ 既に発動中:', moveType);
        return;
    }

    // ゲージ消費
    specialMoveState.gauge -= cost;
    updateSpecialGaugeUI();

    // 発動状態にする
    specialMoveState.active[moveType] = true;

    // ボタンにactiveクラスを追加
    const button = document.querySelector(`[data-move="${moveType}"]`);
    if (button) {
        button.classList.add('active');
    }

    if (DEBUG_MODE) console.log('🌟 必殺技発動!', moveType, '消費:', cost);

    // 発動処理実行
    activateFunc();
}

/**
 * 必殺技発動後の状態リセット（共通処理）
 * @param {string} moveType - 必殺技タイプ ('timeStop', 'slowMotion', 'hint')
 */
function resetSpecialMove(moveType) {
    if (DEBUG_MODE) console.log('🔄 必殺技リセット開始:', moveType);
    if (DEBUG_MODE) console.log('  - 現在のactive状態:', specialMoveState.active[moveType]);
    if (DEBUG_MODE) console.log('  - 現在のゲージ:', specialMoveState.gauge);

    // 1. cooldownタイマーをクリア（重要：10秒タイマーなどを停止）
    if (specialMoveState.cooldownTimers[moveType]) {
        clearTimeout(specialMoveState.cooldownTimers[moveType]);
        specialMoveState.cooldownTimers[moveType] = null;
        if (DEBUG_MODE) console.log('  - cooldownタイマークリア完了');
    }

    // 2. 発動状態をfalseに
    specialMoveState.active[moveType] = false;
    if (DEBUG_MODE) console.log('  - active状態をfalseに設定');

    // 3. ボタンのactiveクラスを削除
    const button = document.querySelector(`[data-move="${moveType}"]`);
    if (button) {
        button.classList.remove('active');
        if (DEBUG_MODE) console.log('  - activeクラス削除完了');
    }

    // 4. ボタンの有効/無効を更新
    updateSpecialButtons();
    if (DEBUG_MODE) console.log('  - updateSpecialButtons()実行完了');

    // 5. 必殺技固有のリセット処理
    switch (moveType) {
        case 'timeStop':
            // タイマーとボタンアニメーションを再開
            resumeTimer();
            resumeButtonAnimations();
            // BGMを停止位置から再開
            resumeCurrentBGM();
            break;

        case 'slowMotion':
            // タイムスケールを戻す
            gsap.globalTimeline.timeScale(1);
            // スローモーションBGMを停止して通常BGMに戻す
            stopSlowMotionBGM();
            restoreBGM();
            break;

        case 'hint':
            // ヒントは特別なリセット処理なし
            break;
    }

    if (DEBUG_MODE) console.log('✅ 必殺技リセット完了:', moveType);
    if (DEBUG_MODE) console.log('  - リセット後のactive状態:', specialMoveState.active[moveType]);

    // リセット後のボタン状態を確認
    if (DEBUG_MODE && button) {
        console.log('  - リセット後のボタンdisabled:', button.disabled);
        console.log('  - リセット後のボタンactiveクラス:', button.classList.contains('active'));
    }
}

/**
 * BGMを適切な状態に復元
 */
function restoreBGM() {
    // 他の必殺技が発動中でない場合のみBGMを再開
    if (!specialMoveState.active.timeStop && !specialMoveState.active.slowMotion) {
        // レベルに応じたBGMを再生
        if (gameState.level <= GAME_CONSTANTS.LEVEL_THRESHOLD_EASY) {
            // Lv1-10の場合、opening BGMを再生
            const openingBGM = audioCache.bgm.opening;
            if (openingBGM && openingBGM.paused) {
                playBGM('opening');
                if (DEBUG_MODE) console.log('🎵 BGM再開 (opening)');
            }
        } else if (gameState.level <= GAME_CONSTANTS.LEVEL_THRESHOLD_HARD) {
            // Lv11-20の場合、Lv11-20 BGMを再生
            const lv11_20BGMs = audioCache.bgm.lv11_20;
            const isAnyBGMPlaying = lv11_20BGMs.some(bgm => !bgm.paused);

            if (!isAnyBGMPlaying) {
                playLv11_20BGM();
                if (DEBUG_MODE) console.log('🎵 BGM再開 (Lv11-20)');
            }
        }
    }
}

/**
 * ⏸️ 時間停止 発動
 */
function activateTimeStop() {
    activateSpecialMove('timeStop', GAME_CONSTANTS.SPECIAL_COST_TIME_STOP, () => {
        // ド派手な発動エフェクト
        const gameMain = document.querySelector('.game-main');

        // 画面全体に青白いフラッシュ
        gsap.timeline()
            .to(gameMain, {
                backgroundColor: 'rgba(100, 200, 255, 0.8)',
                duration: 0.1
            })
            .to(gameMain, {
                backgroundColor: 'rgba(100, 200, 255, 0.2)',
                duration: 0.3
            });

        // 必殺技名を画面いっぱいに表示（1秒で消える）
        showSpecialMoveName('ザ・ワールド！！', '#00d4ff');

        // サウンド再生
        playTimeStopSound();

        // タイマーとボタンアニメーションを一時停止
        pauseTimer();
        pauseButtonAnimations();

        // BGMを一時停止（再生位置を保持）
        pauseCurrentBGM();

        // 持続時間後に解除
        specialMoveState.cooldownTimers.timeStop = setTimeout(() => {
            resetSpecialMove('timeStop');
        }, GAME_CONSTANTS.SPECIAL_DURATION_TIME_STOP);
    });
}

/**
 * 🐌 スローモーション 発動
 */
function activateSlowMotion() {
    activateSpecialMove('slowMotion', GAME_CONSTANTS.SPECIAL_COST_SLOW_MOTION, () => {
        // ド派手な発動エフェクト
        const gameMain = document.querySelector('.game-main');

        // 画面全体に紫のフラッシュ
        gsap.timeline()
            .to(gameMain, {
                backgroundColor: 'rgba(150, 100, 255, 0.6)',
                duration: 0.1
            })
            .to(gameMain, {
                backgroundColor: 'rgba(150, 100, 255, 0.15)',
                duration: 0.3
            });

        // 必殺技名を画面いっぱいに表示（1秒で消える）
        showSpecialMoveName('時の加速', '#9b59b6');

        // サウンド再生
        playSlowMotionSound();

        // 通常BGMを停止してスローモーション用BGMに切り替え
        stopAllBGM();
        playSlowMotionBGM();

        // GSAPのグローバルタイムスケールを遅くする
        gsap.globalTimeline.timeScale(GAME_CONSTANTS.SLOW_MOTION_TIME_SCALE);

        // 持続時間後に解除
        specialMoveState.cooldownTimers.slowMotion = setTimeout(() => {
            resetSpecialMove('slowMotion');
        }, GAME_CONSTANTS.SPECIAL_DURATION_SLOW_MOTION);
    });
}

/**
 * 💡 ヒント 発動
 */
function activateHint() {
    activateSpecialMove('hint', GAME_CONSTANTS.SPECIAL_COST_HINT, () => {
        // ド派手な発動エフェクト
        const gameMain = document.querySelector('.game-main');

        // 画面全体に黄色いフラッシュ
        gsap.timeline()
            .to(gameMain, {
                backgroundColor: 'rgba(255, 215, 0, 0.6)',
                duration: 0.1
            })
            .to(gameMain, {
                backgroundColor: 'transparent',
                duration: 0.3
            });

        // 必殺技名を画面いっぱいに表示（1秒で消える）
        showSpecialMoveName('星の啓示', '#ffd700');

        // サウンド再生
        playHintSound();

        // 正解ボタンを探す
        const correctAnswer = gameState.currentQuestion.answer;
        const answerButtons = document.querySelectorAll('.answer-button');
        let correctButton = null;

        answerButtons.forEach(button => {
            const buttonAnswer = parseInt(button.dataset.answer);
            if (buttonAnswer === correctAnswer) {
                correctButton = button;
            }
        });

        if (correctButton) {
            // 正解ボタンをキラキラさせる
            correctButton.style.position = 'relative';
            correctButton.style.zIndex = '1000';

            // グロー効果
            gsap.timeline()
                .to(correctButton, {
                    boxShadow: '0 0 30px 10px rgba(255, 215, 0, 1), 0 0 60px 20px rgba(255, 215, 0, 0.8)',
                    scale: 1.15,
                    duration: 0.3,
                    ease: 'back.out(2)'
                })
                .to(correctButton, {
                    boxShadow: '0 0 20px 5px rgba(255, 215, 0, 0.8), 0 0 40px 10px rgba(255, 215, 0, 0.6)',
                    duration: 0.5,
                    yoyo: true,
                    repeat: 5
                })
                .to(correctButton, {
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    scale: 1,
                    duration: 0.3
                });

            // キラキラパーティクル
            for (let i = 0; i < 20; i++) {
                const buttonRect = correctButton.getBoundingClientRect();
                const centerX = buttonRect.left + buttonRect.width / 2;
                const centerY = buttonRect.top + buttonRect.height / 2;
                createParticle(centerX, centerY, '#ffd700');
            }
        }

        // ヒントは即座にリセット（エフェクトは続くが、次のヒントを使えるように）
        // エフェクトとactive状態は独立して管理
        setTimeout(() => {
            resetSpecialMove('hint');
            if (DEBUG_MODE) console.log('💡 ヒントリセット完了');
        }, GAME_CONSTANTS.SPECIAL_HINT_RESET_DELAY);
    });
}

/**
 * 必殺技ボタンの初期化
 */
function initSpecialMoveButtons() {
    const timeStopBtn = document.getElementById('timeStopBtn');
    const slowMotionBtn = document.getElementById('slowMotionBtn');
    const hintBtn = document.getElementById('hintBtn');

    if (timeStopBtn) {
        timeStopBtn.addEventListener('click', () => {
            activateTimeStop();
        });
    }

    if (slowMotionBtn) {
        slowMotionBtn.addEventListener('click', () => {
            activateSlowMotion();
        });
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            activateHint();
        });
    }

    if (DEBUG_MODE) console.log('⚡ 必殺技ボタン初期化完了');
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

    // 演算子チェックボックスの初期化
    const additionCheckbox = document.getElementById('additionEnabled');
    const subtractionCheckbox = document.getElementById('subtractionEnabled');
    const multiplicationCheckbox = document.getElementById('multiplicationEnabled');

    // 初期状態を設定
    if (additionCheckbox) additionCheckbox.checked = gameState.selectedOperators.addition;
    if (subtractionCheckbox) subtractionCheckbox.checked = gameState.selectedOperators.subtraction;
    if (multiplicationCheckbox) multiplicationCheckbox.checked = gameState.selectedOperators.multiplication;

    // 最低1つは選択されていることを保証するヘルパー関数
    const ensureAtLeastOneSelected = () => {
        const anySelected = gameState.selectedOperators.addition ||
                           gameState.selectedOperators.subtraction ||
                           gameState.selectedOperators.multiplication;
        if (!anySelected) {
            // 何も選択されていない場合は足し算を強制的にON
            gameState.selectedOperators.addition = true;
            if (additionCheckbox) additionCheckbox.checked = true;
            if (DEBUG_MODE) console.log('⚠️ 最低1つの演算子が必要です。足し算を自動選択しました。');
        }
    };

    // 足し算チェックボックス
    if (additionCheckbox) {
        additionCheckbox.addEventListener('change', (e) => {
            gameState.selectedOperators.addition = e.target.checked;
            ensureAtLeastOneSelected();
            if (DEBUG_MODE) console.log('足し算:', gameState.selectedOperators.addition ? 'ON' : 'OFF');
        });
    }

    // 引き算チェックボックス
    if (subtractionCheckbox) {
        subtractionCheckbox.addEventListener('change', (e) => {
            gameState.selectedOperators.subtraction = e.target.checked;
            ensureAtLeastOneSelected();
            if (DEBUG_MODE) console.log('引き算:', gameState.selectedOperators.subtraction ? 'ON' : 'OFF');
        });
    }

    // 掛け算チェックボックス
    if (multiplicationCheckbox) {
        multiplicationCheckbox.addEventListener('change', (e) => {
            gameState.selectedOperators.multiplication = e.target.checked;
            ensureAtLeastOneSelected();
            if (DEBUG_MODE) console.log('掛け算:', gameState.selectedOperators.multiplication ? 'ON' : 'OFF');
        });
    }
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

            // 規定回数以上叩いたら知識を表示
            if (gameState.drumClickCount >= GAME_CONSTANTS.DRUM_CLICK_THRESHOLD) {
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
