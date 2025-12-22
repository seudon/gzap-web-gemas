// ========================================
// GSAPアニメーション定義
// ========================================

// 🔧 現在のアニメーションレベルを管理（グローバル変数）
let currentAnimationLevel = null;

/**
 * 問題表示のタイムラインアニメーション
 * 数字と記号が順番に表示される
 */
function animateQuestionEntry() {
    const tl = gsap.timeline();

    // 全要素を初期状態に
    tl.set('.question-display > *', {
        opacity: 0,
        scale: 0,
        y: -50
    });

    // 順番に表示
    tl.to('#num1', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(1.7)'
    })
    .to('#operator', {
        opacity: 1,
        scale: 1,
        y: 0,
        rotation: 360,
        duration: 0.3,
        ease: 'back.out(1.7)'
    }, '-=0.1')
    .to('#num2', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(1.7)'
    }, '-=0.1')
    .to('#equals', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.7)'
    }, '-=0.1')
    .to('.question-mark', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
    }, '-=0.1');

    return tl;
}

/**
 * 回答ボタンの出現アニメーション
 */
function animateButtonsEntry() {
    const buttons = document.querySelectorAll('.answer-button');
    const tl = gsap.timeline();

    buttons.forEach((button, index) => {
        tl.from(button, {
            opacity: 0,
            scale: 0,
            y: 50,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, index * 0.1);
    });

    return tl;
}

/**
 * レベル別のボタンアニメーション（大幅改善版）
 * 各ボタンが独立した動きをする
 * @param {number} level - 現在のレベル
 */
function animateButtonsByLevel(level) {
    const buttons = document.querySelectorAll('.answer-button');

    console.log('🔄 animateButtonsByLevel 開始: Lv' + level);
    console.log('  対象ボタン数:', buttons.length);

    // 🔧 重要: 現在のレベルを設定（これでアニメーションを制御）
    currentAnimationLevel = level;
    console.log('  現在のアニメーションレベルを設定:', currentAnimationLevel);

    // 🔧 STEP 1: 全てのボタンに対するアニメーションを強制停止
    console.log('  STEP 1: 既存アニメーションを停止中...');

    // 📌 停止前のアニメーション数を記録
    buttons.forEach((button, index) => {
        const tweensCount = gsap.getTweensOf(button).length;
        console.log('    ボタン' + (index + 1) + ' のアニメーション数（停止前）:', tweensCount);
    });

    // 🚨 重要: 全てのプロパティを個別に指定してkill
    buttons.forEach((button, index) => {
        // 全プロパティを明示的に指定してkill（これが最も確実）
        gsap.killTweensOf(button, 'x,y,rotation,scale,opacity');
        console.log('    ボタン' + (index + 1) + ' の全プロパティtweenをkill');
    });

    // グローバルタイムラインから全てのtimelineとtweenを検索して停止
    const allChildren = gsap.globalTimeline.getChildren(true, true, true);
    console.log('  グローバルタイムライン内の全要素数:', allChildren.length);

    let killedTimelinesCount = 0;
    let killedTweensCount = 0;

    allChildren.forEach(child => {
        // Timelineの場合
        if (child.constructor.name === 'Timeline' || child._targets === undefined) {
            // このtimelineがボタンに関連しているか確認
            const timelineTweens = child.getChildren();
            let hasButton = false;

            timelineTweens.forEach(tween => {
                if (tween.targets) {
                    const targets = tween.targets();
                    if (targets.some(target => Array.from(buttons).includes(target))) {
                        hasButton = true;
                    }
                }
            });

            if (hasButton) {
                child.kill();
                killedTimelinesCount++;
                console.log('    Timeline停止:', child);
            }
        }
        // Tweenの場合
        else if (child.targets) {
            const targets = child.targets();
            if (targets.some(target => Array.from(buttons).includes(target))) {
                child.kill();
                killedTweensCount++;
            }
        }
    });

    console.log('  停止したTimeline数:', killedTimelinesCount);
    console.log('  停止したTween数:', killedTweensCount);

    // さらに念のため、もう一度killTweensOf
    gsap.killTweensOf(buttons);

    // 🔧 STEP 2: 初期状態に強制リセット
    console.log('  STEP 2: ボタンを初期状態にリセット中...');
    buttons.forEach((button, index) => {
        gsap.set(button, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1
        });
        console.log('    ボタン' + (index + 1) + ' リセット完了');
    });

    // clearPropsで全てクリア
    gsap.set(buttons, { clearProps: 'all' });

    // 📌 停止後のアニメーション数を確認
    buttons.forEach((button, index) => {
        const tweensCount = gsap.getTweensOf(button).length;
        console.log('    ボタン' + (index + 1) + ' のアニメーション数（停止後）:', tweensCount);
        if (tweensCount > 0) {
            console.warn('    ⚠️ ボタン' + (index + 1) + ' にまだアニメーションが残っています！');
        }
    });

    console.log('  ✅ 全アニメーション停止・リセット完了');

    if (level === 1) {
        // Lv1: 完全に静止（動かない）
        // 何もしない
        console.log('Level 1: ボタンは静止');

    } else if (level === 2) {
        // Lv2: ボタンごとに異なる方向に微妙な脈動 + 小さな左右移動
        buttons.forEach((button, index) => {
            const patterns = [
                { scale: 1.08, x: 5, duration: 1.0 },   // ボタン1
                { scale: 1.05, x: -5, duration: 1.3 },  // ボタン2
                { scale: 1.06, x: 6, duration: 0.8 },   // ボタン3
                { scale: 1.07, x: -6, duration: 1.1 }   // ボタン4
            ];
            const pattern = patterns[index % 4];

            gsap.to(button, {
                scale: pattern.scale,
                x: pattern.x,
                duration: pattern.duration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.2
            });
        });

    } else if (level === 3) {
        // Lv3: 移動距離 ±30px（少し増加）
        buttons.forEach((button, index) => {
            const movements = [
                { x: 0, y: -30 },   // 上
                { x: 30, y: 0 },    // 右
                { x: 0, y: 30 },    // 下
                { x: -30, y: 0 }    // 左
            ];
            const movement = movements[index % 4];

            gsap.to(button, {
                x: movement.x,
                y: movement.y,
                duration: 1.4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.15
            });
        });

    } else if (level === 4) {
        // Lv4: 移動距離 ±40px（さらに増加）
        buttons.forEach((button, index) => {
            const movements = [
                { x: -40, y: -40 },  // 左上
                { x: 40, y: -40 },   // 右上
                { x: -40, y: 40 },   // 左下
                { x: 40, y: 40 }     // 右下
            ];
            const movement = movements[index % 4];

            gsap.to(button, {
                x: movement.x,
                y: movement.y,
                duration: 1.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: index * 0.1
            });
        });

    } else if (level === 5) {
        // Lv5: 移動距離 ±50px
        buttons.forEach((button, index) => {
            if (index === 0) {
                gsap.to(button, { y: -50, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            } else if (index === 1) {
                gsap.to(button, { x: 50, duration: 1.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            } else if (index === 2) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 35, y: 0, duration: 0.4, ease: 'none' })
                  .to(button, { x: 35, y: 35, duration: 0.4, ease: 'none' })
                  .to(button, { x: 0, y: 35, duration: 0.4, ease: 'none' })
                  .to(button, { x: 0, y: 0, duration: 0.4, ease: 'none' });
            } else {
                gsap.to(button, { x: 45, y: -25, duration: 0.9, repeat: -1, yoyo: true, ease: 'power1.inOut' });
            }
        });

    } else if (level === 6) {
        // Lv6: 移動距離 ±55px + 回転
        buttons.forEach((button, index) => {
            if (index === 0) {
                gsap.to(button, { y: -55, rotation: 20, duration: 1.0, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            } else if (index === 1) {
                gsap.to(button, { x: 50, y: -50, rotation: -20, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            } else if (index === 2) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 40, y: 0, rotation: 90, duration: 0.5, ease: 'none' })
                  .to(button, { x: 40, y: 40, rotation: 180, duration: 0.5, ease: 'none' })
                  .to(button, { x: 0, y: 40, rotation: 270, duration: 0.5, ease: 'none' })
                  .to(button, { x: 0, y: 0, rotation: 360, duration: 0.5, ease: 'none' });
            } else {
                gsap.to(button, { x: -50, rotation: 25, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            }
        });

    } else if (level === 7) {
        // Lv7: 移動距離 ±60px（複雑な軌道）
        buttons.forEach((button, index) => {
            if (index === 0) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 45, y: -30, duration: 0.5, ease: 'sine.inOut' })
                  .to(button, { x: 0, y: 0, duration: 0.5, ease: 'sine.inOut' })
                  .to(button, { x: -45, y: 30, duration: 0.5, ease: 'sine.inOut' })
                  .to(button, { x: 0, y: 0, duration: 0.5, ease: 'sine.inOut' });
            } else if (index === 1) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 60, y: 0, duration: 0.5, ease: 'none' })
                  .to(button, { x: 60, y: 30, duration: 0.4, ease: 'none' })
                  .to(button, { x: 0, y: 30, duration: 0.5, ease: 'none' })
                  .to(button, { x: 0, y: 0, duration: 0.4, ease: 'none' });
            } else if (index === 2) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 40, y: -40, duration: 0.4, ease: 'power1.inOut' })
                  .to(button, { x: -40, y: -40, duration: 0.5, ease: 'power1.inOut' })
                  .to(button, { x: 40, y: 40, duration: 0.5, ease: 'power1.inOut' })
                  .to(button, { x: 0, y: 0, duration: 0.4, ease: 'power1.inOut' });
            } else {
                const tl = gsap.timeline({ repeat: -1 });
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = 15 + i * 4;
                    tl.to(button, {
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius,
                        duration: 0.25,
                        ease: 'none'
                    });
                }
                tl.to(button, { x: 0, y: 0, duration: 0.3, ease: 'power2.in' });
            }
        });

    } else if (level === 8) {
        // Lv8: 移動距離 ±70px（ボタンが重なり始める）
        buttons.forEach((button, index) => {
            if (index === 0) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: 60, y: -50, rotation: 90, duration: 0.5, ease: 'power1.inOut' })
                  .to(button, { x: -50, y: -60, rotation: 180, duration: 0.6, ease: 'power1.inOut' })
                  .to(button, { x: -60, y: 50, rotation: 270, duration: 0.5, ease: 'power1.inOut' })
                  .to(button, { x: 0, y: 0, rotation: 360, duration: 0.6, ease: 'power1.inOut' });
            } else if (index === 1) {
                const tl = gsap.timeline({ repeat: -1 });
                const points = [
                    {x: 0, y: -55}, {x: 25, y: -20}, {x: 55, y: -20},
                    {x: 30, y: 15}, {x: 40, y: 55}, {x: 0, y: 30},
                    {x: -40, y: 55}, {x: -30, y: 15}, {x: -55, y: -20},
                    {x: -25, y: -20}, {x: 0, y: 0}
                ];
                points.forEach((point, i) => {
                    tl.to(button, {
                        x: point.x,
                        y: point.y,
                        rotation: (i / points.length) * 360,
                        duration: 0.25,
                        ease: 'none'
                    });
                });
            } else if (index === 2) {
                const tl = gsap.timeline({ repeat: -1 });
                tl.to(button, { x: -35, y: -35, rotation: 45, duration: 0.4, ease: 'sine.inOut' })
                  .to(button, { x: 0, y: -50, rotation: 90, duration: 0.3, ease: 'sine.inOut' })
                  .to(button, { x: 35, y: -35, rotation: 135, duration: 0.3, ease: 'sine.inOut' })
                  .to(button, { x: 0, y: 35, rotation: 270, duration: 0.5, ease: 'sine.inOut' })
                  .to(button, { x: 0, y: 0, rotation: 360, duration: 0.3, ease: 'sine.inOut' });
            } else {
                const targetLevel = 8;
                const randomWalk = () => {
                    if (currentAnimationLevel !== targetLevel) return;
                    gsap.to(button, {
                        x: gsap.utils.random(-60, 60),
                        y: gsap.utils.random(-60, 60),
                        rotation: gsap.utils.random(-45, 45),
                        duration: 0.7,
                        ease: 'power1.inOut',
                        onComplete: randomWalk
                    });
                };
                randomWalk();
            }
        });

    } else if (level === 9) {
        // Lv9: 移動距離 ±80px（ボタンが重なる）
        buttons.forEach((button, index) => {
            const targetLevel = 9;
            const complexMove = () => {
                if (currentAnimationLevel !== targetLevel) return;
                gsap.to(button, {
                    x: gsap.utils.random(-80, 80),
                    y: gsap.utils.random(-80, 80),
                    rotation: gsap.utils.random(-60, 60),
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onComplete: complexMove
                });
            };
            gsap.delayedCall(index * 0.1, complexMove);
        });

    } else if (level === 10) {
        // Lv10: 移動距離 ±90px（最大限に重なる）
        buttons.forEach((button, index) => {
            const targetLevel = 10;
            const wildMove = () => {
                if (currentAnimationLevel !== targetLevel) return;
                gsap.to(button, {
                    x: gsap.utils.random(-90, 90),
                    y: gsap.utils.random(-90, 90),
                    rotation: gsap.utils.random(-90, 90),
                    scale: gsap.utils.random(0.95, 1.05),
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: wildMove
                });
            };
            gsap.delayedCall(index * 0.08, wildMove);
        });

    } else if (level >= 11 && level <= 15) {
        // Lv11-15: ボタンサイズを小さく(0.97→0.85) + 移動距離 ±100px
        buttons.forEach((button, index) => {
            const targetLevel = level;
            // レベルに応じてボタンサイズを段階的に縮小
            const buttonScale = 1.0 - (level - 10) * 0.03; // Lv11: 0.97, Lv12: 0.94, ..., Lv15: 0.85
            console.log('  Lv' + level + ' ボタンサイズ: ' + buttonScale.toFixed(2));

            const complexRandomMove = () => {
                if (currentAnimationLevel !== targetLevel) return;

                const duration = gsap.utils.random(0.4, 0.7);
                const distance = gsap.utils.random(80, 100);
                const angle = gsap.utils.random(0, Math.PI * 2);

                gsap.to(button, {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    rotation: gsap.utils.random(-90, 90),
                    scale: buttonScale + gsap.utils.random(-0.05, 0.05),
                    duration: duration,
                    ease: 'power2.inOut',
                    onComplete: complexRandomMove
                });
            };

            gsap.delayedCall(index * 0.12, complexRandomMove);
        });

    } else if (level >= 16 && level <= 20) {
        // Lv16-20: ボタンサイズをさらに小さく(0.82→0.70) + 移動距離 ±120-150px（超激しい）
        buttons.forEach((button, index) => {
            const targetLevel = level;
            // レベルに応じてボタンサイズをさらに縮小
            const buttonScale = 0.85 - (level - 15) * 0.03; // Lv16: 0.82, Lv17: 0.79, ..., Lv20: 0.70
            console.log('  Lv' + level + ' ボタンサイズ: ' + buttonScale.toFixed(2));

            const hyperComplexMove = () => {
                if (currentAnimationLevel !== targetLevel) return;

                const moveTypes = [
                    // 爆速ジグザグ（超大きな移動）
                    () => {
                        const tl = gsap.timeline({ onComplete: hyperComplexMove });
                        for (let i = 0; i < 5; i++) {
                            tl.to(button, {
                                x: gsap.utils.random(-150, 150),
                                y: gsap.utils.random(-150, 150),
                                rotation: gsap.utils.random(-180, 180),
                                scale: buttonScale + gsap.utils.random(-0.08, 0.08),
                                duration: 0.25,
                                ease: 'power3.inOut'
                            });
                        }
                        tl.to(button, { x: 0, y: 0, rotation: 0, scale: buttonScale, duration: 0.2 });
                    },
                    // 超高速スパイラル（広範囲）
                    () => {
                        const tl = gsap.timeline({ onComplete: hyperComplexMove });
                        for (let i = 0; i < 12; i++) {
                            const angle = (i / 12) * Math.PI * 2;
                            const radius = 120 - i * 8;
                            tl.to(button, {
                                x: Math.cos(angle) * radius,
                                y: Math.sin(angle) * radius,
                                rotation: i * 30,
                                scale: buttonScale + gsap.utils.random(-0.05, 0.05),
                                duration: 0.12,
                                ease: 'none'
                            });
                        }
                        tl.to(button, { x: 0, y: 0, rotation: 360, scale: buttonScale, duration: 0.15 });
                    },
                    // カオス的な動き（最大範囲）
                    () => {
                        const distance = gsap.utils.random(120, 150);
                        const angle = gsap.utils.random(0, Math.PI * 2);
                        gsap.to(button, {
                            x: Math.cos(angle) * distance,
                            y: Math.sin(angle) * distance,
                            rotation: gsap.utils.random(-180, 180),
                            scale: buttonScale + gsap.utils.random(-0.08, 0.08),
                            duration: gsap.utils.random(0.3, 0.5),
                            ease: 'power4.inOut',
                            onComplete: hyperComplexMove
                        });
                    }
                ];

                const moveType = moveTypes[Math.floor(Math.random() * moveTypes.length)];
                moveType();
            };

            gsap.delayedCall(index * 0.08, hyperComplexMove);
        });
    }

    console.log('  🎬 レベル ' + level + ' のアニメーション開始完了');
}

/**
 * パーティクルエフェクト生成
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - パーティクルの数
 * @param {string} type - パーティクルのタイプ ('small', 'medium', 'large')
 */
function createParticles(x, y, count, type = 'small') {
    const container = document.getElementById('particleContainer');

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = type === 'star' ? 'particle star' : 'particle';

        // サイズの設定
        let size = 20;
        if (type === 'medium') size = 30;
        if (type === 'large') size = 40;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // ランダムな色
        const colors = ['#ffd93d', '#ff6b6b', '#6bcf7f', '#4facfe', '#f093fb'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);

        // アニメーション
        gsap.to(particle, {
            x: gsap.utils.random(-200, 200),
            y: gsap.utils.random(-200, 200),
            opacity: 0,
            scale: 0,
            duration: gsap.utils.random(0.8, 1.5),
            ease: 'power2.out',
            onComplete: () => {
                particle.remove();
            }
        });
    }
}

/**
 * 正解時のエフェクト（Phase 2強化版）
 * @param {HTMLElement} button - クリックされたボタン
 * @param {number} combo - 現在のコンボ数
 */
function playCorrectEffect(button, combo) {
    // ボタンの位置を取得
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // コンボ数に応じた段階的なエフェクト（7段階）
    if (combo === 1) {
        // コンボ1: 基本エフェクト
        gsap.to(button, {
            scale: 1.2,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out'
        });
        createParticles(x, y, 10, 'small');

    } else if (combo <= 3) {
        // コンボ2-3: パーティクル増加
        gsap.to(button, {
            scale: 1.3,
            rotation: 360,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 20, 'small');
        flashScreen(0.15);

    } else if (combo <= 5) {
        // コンボ4-5: 中サイズパーティクル + 光の輪
        gsap.to(button, {
            scale: 1.4,
            rotation: 360,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 30, 'medium');
        flashScreen(0.25);
        createRainbowRing(x, y, 1);

    } else if (combo <= 7) {
        // コンボ6-7: 大サイズ + グロー + 波紋
        gsap.to(button, {
            scale: 1.5,
            rotation: 720,
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 45, 'large');
        createSpiralParticles(x, y, 15);
        flashScreen(0.35);
        createRadialGlow(x, y);
        createRainbowRing(x, y, 2);

    } else if (combo <= 10) {
        // コンボ8-10: 超派手 + 波紋 + 画面シェイク + テキスト
        gsap.to(button, {
            scale: 1.6,
            rotation: 720,
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 70, 'large');
        createSpiralParticles(x, y, 25);
        createHeartParticles(x, y, 15);
        flashScreen(0.5);
        createRadialGlow(x, y);
        createRainbowRing(x, y, 3);
        createColorfulWaves(x, y);
        createFloatingText(x, y, combo);
        shakeScreen(6);
        pulseBackground();

    } else if (combo <= 15) {
        // コンボ11-15: 極派手 + 流れ星 + 光の柱
        gsap.to(button, {
            scale: 1.7,
            rotation: 1080,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 90, 'star');
        createSpiralParticles(x, y, 30);
        createHeartParticles(x, y, 20);
        createStarBurst(x, y, 5);
        flashScreen(0.7);
        createRadialGlow(x, y);
        createRainbowRing(x, y, 4);
        createColorfulWaves(x, y);
        createLightPillar(x, y);
        createFloatingText(x, y, combo);
        shakeScreen(10);
        pulseBackground();
        createShootingStars();

    } else if (combo <= 20) {
        // コンボ16-20: 超最高レベル + レーザー + オーロラ
        gsap.to(button, {
            scale: 1.8,
            rotation: 1440,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        createParticles(x, y, 110, 'star');
        createSpiralParticles(x, y, 35);
        createHeartParticles(x, y, 25);
        createExplosionParticles(x, y, 25);
        createStarBurst(x, y, 7);
        flashScreen(0.85);
        createRadialGlow(x, y);
        createRainbowRing(x, y, 5);
        createColorfulWaves(x, y);
        createLightPillar(x, y);
        createLaserBeams(x, y);
        createFloatingText(x, y, combo);
        shakeScreen(14);
        pulseBackground();
        zoomAndRotateScreen();
        createShootingStars();
        createFireworks();
        createAurora();

    } else {
        // コンボ21+: 究極の派手さ - 全エフェクト同時発動！(Phase 3: パフォーマンス最適化版)
        gsap.to(button, {
            scale: 2.0,
            rotation: 1800,
            duration: 0.6,
            yoyo: true,
            repeat: 1,
            ease: 'back.out(1.7)'
        });
        // パーティクル大量発生（Phase 3: 数を最適化 240→145）
        createParticles(x, y, 80, 'star');
        createSpiralParticles(x, y, 25);
        createHeartParticles(x, y, 20);
        createExplosionParticles(x, y, 20);
        createStarBurst(x, y, 8);

        // フラッシュ・グロー系
        flashScreen(0.85); // Phase 3: 強度を微調整 (0.9 → 0.85)
        createRadialGlow(x, y);
        createRainbowRing(x, y, 5); // Phase 3: リング数削減 (6 → 5)
        createColorfulWaves(x, y);

        // 光系エフェクト
        createLightPillar(x, y);
        createLaserBeams(x, y);
        createAurora();

        // テキスト・画面効果
        createFloatingText(x, y, combo);
        shakeScreen(15); // Phase 3: シェイク強度を微調整 (18 → 15)
        pulseBackground();
        zoomAndRotateScreen();

        // 特殊エフェクト
        createShootingStars();
        createFireworks();

        // 追加の光の柱を複数箇所に
        setTimeout(() => createLightPillar(x - 150, y), 200);
        setTimeout(() => createLightPillar(x + 150, y), 400);
    }
}

/**
 * 画面フラッシュエフェクト
 * @param {number} intensity - 強度 (0-1)
 */
function flashScreen(intensity) {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = `rgba(255, 255, 255, ${intensity})`;
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '150';
    document.body.appendChild(flash);

    gsap.to(flash, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => flash.remove()
    });
}

/**
 * 放射状の光エフェクト
 */
function createRadialGlow(x, y) {
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
    glow.style.width = '50px';
    glow.style.height = '50px';
    glow.style.borderRadius = '50%';
    glow.style.background = 'radial-gradient(circle, rgba(255,217,61,0.8) 0%, rgba(255,217,61,0) 70%)';
    glow.style.transform = 'translate(-50%, -50%)';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '150';
    document.body.appendChild(glow);

    gsap.to(glow, {
        scale: 20,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => glow.remove()
    });
}

/**
 * 流れ星エフェクト
 */
function createShootingStars() {
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('div');
        star.style.position = 'fixed';
        star.style.width = '3px';
        star.style.height = '100px';
        star.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)';
        star.style.top = gsap.utils.random(0, 50) + '%';
        star.style.left = '-100px';
        star.style.transform = 'rotate(-45deg)';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '150';
        document.body.appendChild(star);

        gsap.to(star, {
            x: window.innerWidth + 200,
            duration: 1.5,
            delay: i * 0.3,
            ease: 'none',
            onComplete: () => star.remove()
        });
    }
}

/**
 * 虹色リングエフェクト（Phase 2新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - リングの数
 */
function createRainbowRing(x, y, count) {
    const colors = [
        'rgba(255, 0, 0, 0.6)',    // 赤
        'rgba(255, 165, 0, 0.6)',  // オレンジ
        'rgba(255, 255, 0, 0.6)',  // 黄
        'rgba(0, 255, 0, 0.6)',    // 緑
        'rgba(0, 191, 255, 0.6)',  // 青
        'rgba(138, 43, 226, 0.6)'  // 紫
    ];

    for (let i = 0; i < count; i++) {
        const ring = document.createElement('div');
        ring.style.position = 'fixed';
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
        ring.style.width = '50px';
        ring.style.height = '50px';
        ring.style.borderRadius = '50%';
        ring.style.border = `3px solid ${colors[i % colors.length]}`;
        ring.style.transform = 'translate(-50%, -50%)';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '150';
        document.body.appendChild(ring);

        gsap.to(ring, {
            scale: 15 + i * 3,
            opacity: 0,
            duration: 1.2,
            delay: i * 0.1,
            ease: 'power2.out',
            onComplete: () => ring.remove()
        });
    }
}

/**
 * 螺旋軌道パーティクル（Phase 2新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - パーティクル数
 */
function createSpiralParticles(x, y, count) {
    const container = document.getElementById('particleContainer');
    const colors = ['#ffd93d', '#ff6b6b', '#6bcf7f', '#4facfe', '#f093fb', '#fa709a'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '15px';
        particle.style.height = '15px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = '0 0 10px currentColor';
        container.appendChild(particle);

        // 螺旋軌道のアニメーション
        const angle = (i / count) * Math.PI * 4; // 2回転
        const radius = 100 + i * 8;
        const duration = 1.2;

        gsap.to(particle, {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            opacity: 0,
            scale: 0,
            rotation: angle * 57.3, // ラジアンを度に変換
            duration: duration,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
    }
}

/**
 * カラフル波紋エフェクト（Phase 2新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function createColorfulWaves(x, y) {
    const colors = ['#ff6b6b', '#4facfe', '#6bcf7f', '#ffd93d', '#f093fb'];

    for (let i = 0; i < 5; i++) {
        const wave = document.createElement('div');
        wave.style.position = 'fixed';
        wave.style.left = x + 'px';
        wave.style.top = y + 'px';
        wave.style.width = '80px';
        wave.style.height = '80px';
        wave.style.borderRadius = '50%';
        wave.style.border = `4px solid ${colors[i]}`;
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.pointerEvents = 'none';
        wave.style.zIndex = '150';
        document.body.appendChild(wave);

        gsap.to(wave, {
            scale: 8,
            opacity: 0,
            duration: 1.5,
            delay: i * 0.15,
            ease: 'power1.out',
            onComplete: () => wave.remove()
        });
    }
}

/**
 * 画面シェイクエフェクト（Phase 2新規）
 * @param {number} intensity - シェイクの強度（ピクセル）
 */
function shakeScreen(intensity) {
    const gameArea = document.querySelector('.game-container') || document.body;

    gsap.to(gameArea, {
        x: intensity,
        duration: 0.05,
        yoyo: true,
        repeat: 7,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set(gameArea, { x: 0 });
        }
    });
}

/**
 * 爆発型パーティクル（Phase 2新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - パーティクル数
 */
function createExplosionParticles(x, y, count) {
    const container = document.getElementById('particleContainer');
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#ffffff'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '20px';
        particle.style.height = '20px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = '0 0 15px currentColor';
        particle.style.borderRadius = '50%';
        container.appendChild(particle);

        // 全方向に爆発
        const angle = (i / count) * Math.PI * 2;
        const distance = gsap.utils.random(150, 250);

        gsap.to(particle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0,
            duration: gsap.utils.random(0.8, 1.2),
            ease: 'power3.out',
            onComplete: () => particle.remove()
        });
    }
}

/**
 * 花火エフェクト（Phase 2新規、Phase 3最適化）
 */
function createFireworks() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = gsap.utils.random(window.innerWidth * 0.2, window.innerWidth * 0.8);
            const y = gsap.utils.random(window.innerHeight * 0.2, window.innerHeight * 0.6);
            createExplosionParticles(x, y, 20); // Phase 3: パーティクル数削減 (30 → 20)
        }, i * 300);
    }
}

/**
 * レーザービームエフェクト（Phase 2-B新規）
 * @param {number} x - 中心X座標
 * @param {number} y - 中心Y座標
 */
function createLaserBeams(x, y) {
    const beamCount = 8;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2;
        const startX = x + Math.cos(angle) * 800;
        const startY = y + Math.sin(angle) * 800;

        const beam = document.createElement('div');
        beam.style.position = 'fixed';
        beam.style.left = startX + 'px';
        beam.style.top = startY + 'px';
        beam.style.width = '800px';
        beam.style.height = '4px';
        beam.style.background = `linear-gradient(to right, ${colors[i % colors.length]}, transparent)`;
        beam.style.transformOrigin = 'left center';
        beam.style.transform = `rotate(${angle + Math.PI}rad)`;
        beam.style.pointerEvents = 'none';
        beam.style.zIndex = '150';
        beam.style.boxShadow = `0 0 20px ${colors[i % colors.length]}`;
        document.body.appendChild(beam);

        gsap.fromTo(beam,
            { opacity: 0, scaleX: 0 },
            {
                opacity: 1,
                scaleX: 1,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    gsap.to(beam, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => beam.remove()
                    });
                }
            }
        );
    }
}

/**
 * 浮遊テキストエフェクト（Phase 2-B新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} combo - コンボ数
 */
function createFloatingText(x, y, combo) {
    const messages = [
        { min: 5, text: 'GOOD!', color: '#4facfe', size: '40px' },
        { min: 8, text: 'GREAT!', color: '#6bcf7f', size: '50px' },
        { min: 11, text: 'EXCELLENT!', color: '#ffd93d', size: '60px' },
        { min: 14, text: 'AMAZING!', color: '#ff6b6b', size: '70px' },
        { min: 17, text: 'PERFECT!', color: '#f093fb', size: '80px' },
        { min: 20, text: 'LEGENDARY!', color: '#fa709a', size: '90px' }
    ];

    let message = messages[0];
    for (let i = messages.length - 1; i >= 0; i--) {
        if (combo >= messages[i].min) {
            message = messages[i];
            break;
        }
    }

    const text = document.createElement('div');
    text.textContent = message.text;
    text.style.position = 'fixed';
    text.style.left = x + 'px';
    text.style.top = y + 'px';
    text.style.fontSize = message.size;
    text.style.fontWeight = 'bold';
    text.style.color = message.color;
    text.style.textShadow = `0 0 20px ${message.color}, 0 0 40px ${message.color}`;
    text.style.transform = 'translate(-50%, -50%)';
    text.style.pointerEvents = 'none';
    text.style.zIndex = '200';
    text.style.fontFamily = 'Arial, sans-serif';
    text.style.webkitTextStroke = '2px white';
    document.body.appendChild(text);

    gsap.fromTo(text,
        { scale: 0, rotation: -180, opacity: 0 },
        {
            scale: 1.5,
            rotation: 0,
            opacity: 1,
            y: -100,
            duration: 0.8,
            ease: 'back.out(1.7)',
            onComplete: () => {
                gsap.to(text, {
                    opacity: 0,
                    y: -150,
                    duration: 0.5,
                    onComplete: () => text.remove()
                });
            }
        }
    );
}

/**
 * オーロラエフェクト（Phase 2-B新規）
 */
function createAurora() {
    const colors = [
        'rgba(0, 255, 127, 0.3)',
        'rgba(0, 191, 255, 0.3)',
        'rgba(138, 43, 226, 0.3)',
        'rgba(255, 20, 147, 0.3)'
    ];

    for (let i = 0; i < 4; i++) {
        const aurora = document.createElement('div');
        aurora.style.position = 'fixed';
        aurora.style.left = (i * 30 - 10) + '%';
        aurora.style.top = '-50px';
        aurora.style.width = '40%';
        aurora.style.height = '300px';
        aurora.style.background = `linear-gradient(to bottom, ${colors[i]}, transparent)`;
        aurora.style.pointerEvents = 'none';
        aurora.style.zIndex = '140';
        aurora.style.filter = 'blur(20px)';
        aurora.style.transform = 'skewX(-20deg)';
        document.body.appendChild(aurora);

        gsap.fromTo(aurora,
            { opacity: 0, y: -100 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power1.out',
                onComplete: () => {
                    gsap.to(aurora, {
                        opacity: 0,
                        y: 100,
                        duration: 1.5,
                        ease: 'power1.in',
                        onComplete: () => aurora.remove()
                    });
                }
            }
        );

        // 揺らめき効果
        gsap.to(aurora, {
            x: gsap.utils.random(-30, 30),
            skewX: gsap.utils.random(-30, -10),
            duration: 2,
            repeat: 2,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

/**
 * 光の柱エフェクト（Phase 2-B新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function createLightPillar(x, y) {
    const pillar = document.createElement('div');
    pillar.style.position = 'fixed';
    pillar.style.left = x + 'px';
    pillar.style.top = window.innerHeight + 'px';
    pillar.style.width = '100px';
    pillar.style.height = window.innerHeight + 'px';
    pillar.style.background = 'linear-gradient(to top, rgba(255, 255, 255, 0.8), rgba(255, 217, 61, 0.4), transparent)';
    pillar.style.transform = 'translateX(-50%)';
    pillar.style.pointerEvents = 'none';
    pillar.style.zIndex = '145';
    pillar.style.filter = 'blur(15px)';
    pillar.style.boxShadow = '0 0 50px rgba(255, 217, 61, 0.8)';
    document.body.appendChild(pillar);

    gsap.fromTo(pillar,
        { y: 0, opacity: 0 },
        {
            y: -window.innerHeight,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(pillar, {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => pillar.remove()
                });
            }
        }
    );
}

/**
 * 背景パルスエフェクト（Phase 2-B新規）
 */
function pulseBackground() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'radial-gradient(circle, rgba(255,217,61,0.3), rgba(79,172,254,0.3), rgba(240,147,251,0.3))';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '135';
    document.body.appendChild(overlay);

    gsap.fromTo(overlay,
        { opacity: 0, scale: 0.8 },
        {
            opacity: 1,
            scale: 1.2,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => overlay.remove()
        }
    );
}

/**
 * ハート型軌道パーティクル（Phase 2-B新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} count - パーティクル数
 */
function createHeartParticles(x, y, count) {
    const container = document.getElementById('particleContainer');
    const colors = ['#ff1744', '#f50057', '#ff4081', '#ff6b9d'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '12px';
        particle.style.height = '12px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 10px currentColor';
        container.appendChild(particle);

        // ハート型の軌道（パラメトリック方程式）
        const t = (i / count) * Math.PI * 2;
        const scale = 80;
        const heartX = scale * 16 * Math.pow(Math.sin(t), 3);
        const heartY = -scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        gsap.to(particle, {
            x: heartX,
            y: heartY,
            opacity: 0,
            scale: 0,
            duration: 1.5,
            ease: 'power1.out',
            onComplete: () => particle.remove()
        });
    }
}

/**
 * 星型爆発エフェクト（Phase 2-B新規）
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {number} points - 星の頂点数
 */
function createStarBurst(x, y, points = 5) {
    const container = document.getElementById('particleContainer');
    const colors = ['#ffd93d', '#ffeb3b', '#fff176', '#ffffff'];

    for (let i = 0; i < points * 2; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '25px';
        particle.style.height = '25px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 20px #ffd93d';
        container.appendChild(particle);

        // 星型の頂点に配置
        const angle = (i / (points * 2)) * Math.PI * 2;
        const radius = (i % 2 === 0) ? 200 : 120; // 外側と内側を交互に

        gsap.to(particle, {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            opacity: 0,
            scale: 0,
            rotation: 720,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
    }
}

/**
 * 画面ズーム＋回転エフェクト（Phase 2-B新規）
 */
function zoomAndRotateScreen() {
    const gameArea = document.querySelector('.game-container') || document.body;

    gsap.to(gameArea, {
        scale: 1.05,
        rotation: 5,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set(gameArea, { scale: 1, rotation: 0 });
        }
    });
}

/**
 * 不正解時のエフェクト
 * @param {HTMLElement} button - クリックされたボタン
 */
function playWrongEffect(button) {
    // 振動アニメーション
    gsap.to(button, {
        x: -10,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set(button, { x: 0 });
        }
    });

    // ボタンを赤く点滅
    const originalBg = button.style.background;
    button.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)';
    setTimeout(() => {
        button.style.background = originalBg;
    }, 500);
}

/**
 * レベルアップエフェクト
 */
function playLevelUpEffect() {
    const effect = document.getElementById('levelUpEffect');
    effect.classList.remove('hidden');

    // 背景をフェードイン
    gsap.fromTo(effect,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
    );

    // タイトルのアニメーション
    const title = effect.querySelector('.level-up-title');
    gsap.fromTo(title,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // 2秒後に非表示
    setTimeout(() => {
        gsap.to(effect, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                effect.classList.add('hidden');
            }
        });
    }, 2000);
}

/**
 * 経験値バーのアニメーション
 * @param {number} percent - 経験値のパーセント (0-100)
 */
function animateExpBar(percent) {
    const bar = document.querySelector('.exp-bar-fill');
    gsap.to(bar, {
        width: percent + '%',
        duration: 0.5,
        ease: 'power2.out'
    });
}

/**
 * 数値のカウントアップアニメーション
 * @param {string} elementId - 要素のID
 * @param {number} targetValue - 目標値
 */
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;

    gsap.to({ value: currentValue }, {
        value: targetValue,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: function() {
            element.textContent = Math.round(this.targets()[0].value);
        }
    });
}

/**
 * ゲームクリアエフェクト
 */
function playGameCompleteEffect() {
    const effect = document.getElementById('gameCompleteEffect');
    effect.classList.remove('hidden');

    // 背景のフェードイン
    gsap.fromTo(effect,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
    );

    // タイトルの回転拡大アニメーション
    const title = effect.querySelector('.complete-title');
    gsap.fromTo(title,
        { scale: 0, rotation: -360 },
        { scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.7)' }
    );

    // 紙吹雪エフェクト
    setTimeout(() => createConfetti(), 500);
}

/**
 * 紙吹雪エフェクト
 */
function createConfetti() {
    const colors = ['#ffd93d', '#ff6b6b', '#6bcf7f', '#4facfe', '#f093fb', '#ffffff'];
    const container = document.getElementById('particleContainer');

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = gsap.utils.random(0, window.innerWidth) + 'px';
        confetti.style.top = '-20px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '200';
        container.appendChild(confetti);

        gsap.to(confetti, {
            y: window.innerHeight + 20,
            x: gsap.utils.random(-200, 200),
            rotation: gsap.utils.random(0, 360),
            duration: gsap.utils.random(2, 4),
            ease: 'none',
            onComplete: () => confetti.remove()
        });
    }
}
