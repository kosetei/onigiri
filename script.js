document.addEventListener('DOMContentLoaded', () => {
    // ゲームの状態を管理するオブジェクト
    const gameState = {
        secretOnigiri: [], // 親が選んだおむすび
        currentSelection: ['', '', '', ''], // 現在の選択
        attempts: 0, // 試行回数
        maxAttempts: 7, // 最大試行回数
        gameOver: false, // ゲーム終了フラグ
        history: [] // 過去の予想と結果
    };

    // おむすびの種類
    const onigiriTypes = ['しお', 'うめ', 'さけ', 'こんぶ', 'たらこ', 'ふりかけ', 'かつおぶし'];

    // DOM要素の取得
    const onigiriSlots = document.querySelectorAll('.onigiri-slot');
    const onigiriOptions = document.querySelectorAll('.onigiri-type');
    const submitButton = document.getElementById('submit-guess');
    const clearButton = document.getElementById('clear-selection');
    const newGameButton = document.getElementById('new-game');
    const playAgainButton = document.getElementById('play-again');
    const historyContainer = document.getElementById('history-container');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const currentAttemptElement = document.getElementById('current-attempt');
    const gameResultElement = document.getElementById('game-result');
    const gameResultTopElement = document.getElementById('game-result-top');
    const resultMessageElement = document.getElementById('result-message');
    const resultMessageTopElement = document.getElementById('result-message-top');
    const secretRevealElement = document.getElementById('secret-onigiri-reveal');
    const secretOnigiriDisplay = document.getElementById('secret-onigiri-display');
    const ochaCountElement = document.getElementById('ocha-count');
    const oshinkoCountElement = document.getElementById('oshinko-count');

    // ゲームの初期化
    function initGame() {
        // 親のおむすびをランダムに選ぶ
        gameState.secretOnigiri = selectRandomOnigiri();
        console.log('Secret Onigiri:', gameState.secretOnigiri); // デバッグ用

        // ゲーム状態のリセット
        gameState.currentSelection = ['', '', '', ''];
        gameState.attempts = 0;
        gameState.gameOver = false;
        gameState.history = [];

        // UI更新
        updateUI();
        clearSelection();
        historyContainer.innerHTML = '';
        gameResultElement.classList.add('hidden');
        gameResultTopElement.classList.add('hidden');
        
        // 試行回数表示の更新
        attemptsLeftElement.textContent = gameState.maxAttempts;
        currentAttemptElement.textContent = '1';
        
        // 親のおむすびを隠す
        resetSecretDisplay();
    }

    // 親のおむすび表示をリセット
    function resetSecretDisplay() {
        secretOnigiriDisplay.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'onigiri-placeholder';
            placeholder.innerHTML = '';
            secretOnigiriDisplay.appendChild(placeholder);
        }
    }

    // ランダムにおむすびを4つ選ぶ
    function selectRandomOnigiri() {
        const shuffled = [...onigiriTypes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }

    // UIの更新
    function updateUI() {
        // 現在の選択を表示
        onigiriSlots.forEach((slot, index) => {
            const type = gameState.currentSelection[index];
            slot.setAttribute('data-type', type);
            
            if (type) {
                slot.classList.add('selected');
                
                // おむすびの種類に応じたスタイルを適用
                const typeElement = document.querySelector(`.onigiri-type[data-type="${type}"]`);
                if (typeElement) {
                    const borderBottomColor = window.getComputedStyle(typeElement).borderBottomColor;
                    slot.style.borderBottomColor = borderBottomColor;
                }
            } else {
                slot.classList.remove('selected');
                slot.style.borderBottomColor = '#fff8e1';
            }
        });

        // 送信ボタンの有効/無効切り替え
        submitButton.disabled = gameState.currentSelection.includes('') || gameState.gameOver;
    }

    // 選択をクリア
    function clearSelection() {
        gameState.currentSelection = ['', '', '', ''];
        updateUI();
        
        // お茶とおしんこのカウントをリセット
        ochaCountElement.textContent = '0';
        oshinkoCountElement.textContent = '0';
    }

    // 予想を評価
    function evaluateGuess() {
        const guess = [...gameState.currentSelection];
        const secret = [...gameState.secretOnigiri];
        
        let oshinkoCount = 0; // 種類と位置が一致
        let ochaCount = 0;    // 種類のみ一致
        
        // おしんこ（完全一致）のカウント
        for (let i = 0; i < 4; i++) {
            if (guess[i] === secret[i]) {
                oshinkoCount++;
                // 一致したものにマークをつける（後の計算で除外するため）
                guess[i] = null;
                secret[i] = null;
            }
        }
        
        // お茶（種類のみ一致）のカウント
        for (let i = 0; i < 4; i++) {
            if (guess[i] !== null) {
                const secretIndex = secret.indexOf(guess[i]);
                if (secretIndex !== -1) {
                    ochaCount++;
                    secret[secretIndex] = null; // 既にカウントしたものを除外
                }
            }
        }
        
        return { ochaCount, oshinkoCount };
    }

    // 予想を履歴に追加
    function addToHistory(guess, feedback) {
        gameState.history.push({
            guess: [...guess],
            feedback: { ...feedback }
        });
        
        // 履歴表示を更新
        const historyRow = document.createElement('div');
        historyRow.className = 'history-row';
        
        const historyNumber = document.createElement('div');
        historyNumber.className = 'history-number';
        historyNumber.textContent = gameState.attempts;
        
        const historyOnigiri = document.createElement('div');
        historyOnigiri.className = 'history-onigiri';
        
        guess.forEach(type => {
            const onigiriItem = document.createElement('div');
            onigiriItem.className = 'history-onigiri-item';
            onigiriItem.setAttribute('data-type', type);
            
            // おむすびの種類に応じたスタイルを適用
            const typeElement = document.querySelector(`.onigiri-type[data-type="${type}"]`);
            if (typeElement) {
                const borderBottomColor = window.getComputedStyle(typeElement).borderBottomColor;
                onigiriItem.style.borderBottomColor = borderBottomColor;
            }
            
            historyOnigiri.appendChild(onigiriItem);
        });
        
        const historyFeedback = document.createElement('div');
        historyFeedback.className = 'history-feedback';
        
        const ochaFeedback = document.createElement('div');
        ochaFeedback.className = 'feedback-count';
        const ochaIcon = document.createElement('div');
        ochaIcon.className = 'feedback-icon ocha';
        ochaIcon.textContent = feedback.ochaCount;
        ochaFeedback.appendChild(ochaIcon);
        
        const oshinkoFeedback = document.createElement('div');
        oshinkoFeedback.className = 'feedback-count';
        const oshinkoIcon = document.createElement('div');
        oshinkoIcon.className = 'feedback-icon oshinko';
        oshinkoIcon.textContent = feedback.oshinkoCount;
        oshinkoFeedback.appendChild(oshinkoIcon);
        
        historyFeedback.appendChild(ochaFeedback);
        historyFeedback.appendChild(oshinkoFeedback);
        
        historyRow.appendChild(historyNumber);
        historyRow.appendChild(historyOnigiri);
        historyRow.appendChild(historyFeedback);
        
        historyContainer.appendChild(historyRow);
        
        // 自動スクロール
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    // 予想を送信
    function submitGuess() {
        if (gameState.currentSelection.includes('') || gameState.gameOver) {
            return;
        }
        
        gameState.attempts++;
        
        // 試行回数表示の更新
        attemptsLeftElement.textContent = gameState.maxAttempts - gameState.attempts;
        currentAttemptElement.textContent = Math.min(gameState.attempts + 1, gameState.maxAttempts);
        
        // 予想を評価
        const feedback = evaluateGuess();
        
        // フィードバック表示の更新
        ochaCountElement.textContent = feedback.ochaCount;
        oshinkoCountElement.textContent = feedback.oshinkoCount;
        
        // 履歴に追加
        addToHistory(gameState.currentSelection, feedback);
        
        // 勝敗判定
        if (feedback.oshinkoCount === 4) {
            endGame(true);
        } else if (gameState.attempts >= gameState.maxAttempts) {
            endGame(false);
        }
        
        // 選択をクリア
        clearSelection();
    }

    // 親のおむすびを表示
    function revealSecretOnigiri() {
        secretOnigiriDisplay.innerHTML = '';
        
        gameState.secretOnigiri.forEach(type => {
            const secretOnigiri = document.createElement('div');
            secretOnigiri.className = 'secret-onigiri';
            secretOnigiri.setAttribute('data-type', type);
            
            // おむすびの種類に応じたスタイルを適用
            const typeElement = document.querySelector(`.onigiri-type[data-type="${type}"]`);
            if (typeElement) {
                const borderBottomColor = window.getComputedStyle(typeElement).borderBottomColor;
                secretOnigiri.style.borderBottomColor = borderBottomColor;
            }
            
            secretOnigiriDisplay.appendChild(secretOnigiri);
        });
    }
    // ゲーム終了処理
    function endGame(isWin) {
        gameState.gameOver = true;
        
        // 結果メッセージの設定
        let resultMessage = '';
        if (isWin) {
            resultMessage = `おめでとうございます！${gameState.attempts}回目で正解しました！`;
            resultMessageElement.style.color = '#4caf50';
            resultMessageTopElement.style.color = '#4caf50';
        } else {
            resultMessage = '残念！正解を見つけられませんでした。';
            resultMessageElement.style.color = '#f44336';
            resultMessageTopElement.style.color = '#f44336';
        }
        
        resultMessageElement.textContent = resultMessage;
        resultMessageTopElement.textContent = resultMessage;
        
        // 上部の結果表示を表示
        gameResultTopElement.classList.remove('hidden');
        
        // 親のおむすびを表示
        revealSecretOnigiri();
        
        // 結果画面の親のおむすびも表示
        const secretRow = secretRevealElement.querySelector('.secret-row');
        secretRow.innerHTML = '';
        
        gameState.secretOnigiri.forEach(type => {
            const secretOnigiri = document.createElement('div');
            secretOnigiri.className = 'secret-onigiri';
            secretOnigiri.setAttribute('data-type', type);
            
            // おむすびの種類に応じたスタイルを適用
            const typeElement = document.querySelector(`.onigiri-type[data-type="${type}"]`);
            if (typeElement) {
                const borderBottomColor = window.getComputedStyle(typeElement).borderBottomColor;
                secretOnigiri.style.borderBottomColor = borderBottomColor;
            }
            
            secretRow.appendChild(secretOnigiri);
        });
        
        // 結果表示
        gameResultElement.classList.remove('hidden');
    }

    // おむすびスロットのクリックイベント
    onigiriSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (gameState.gameOver) return;
            
            const index = parseInt(slot.dataset.index);
            // 選択されているおむすびをクリア
            gameState.currentSelection[index] = '';
            updateUI();
        });
    });

    // おむすびオプションのクリックイベント
    onigiriOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (gameState.gameOver) return;
            
            const type = option.dataset.type;
            
            // 空いているスロットを探す
            const emptyIndex = gameState.currentSelection.indexOf('');
            if (emptyIndex !== -1) {
                gameState.currentSelection[emptyIndex] = type;
                updateUI();
            }
        });
    });

    // 予想送信ボタンのクリックイベント
    submitButton.addEventListener('click', submitGuess);

    // クリアボタンのクリックイベント
    clearButton.addEventListener('click', clearSelection);

    // 新しいゲームボタンのクリックイベント
    newGameButton.addEventListener('click', initGame);

    // もう一度遊ぶボタンのクリックイベント
    playAgainButton.addEventListener('click', initGame);

    // ゲーム開始
    initGame();
});
