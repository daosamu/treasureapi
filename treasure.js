const statusDiv = document.getElementById('status');
const nextButton = document.getElementById('nextButton');
const restartButton = document.getElementById('restartButton');
const treasureChestImage = document.getElementById('treasureChestImage');
const bgMusic = document.getElementById('bgMusic');

// 从本地存储获取玩家信息，如果不存在则初始化空对象
let playerInfo = JSON.parse(localStorage.getItem('playerInfo')) || {
  playerId: '',
  nickname: '',
  gameHistory: []
};

let step = 0;
let templeSearchAttempts = 0;

const steps = [
  "获取初始线索",
  "解码古代文字",
  "搜索神庙",
  "解密宝箱机关",
  "打开宝箱"
];

const mapData = [
  '图书馆',
  '图书馆',
  '神庙入口',
  '神庙里',
  '神庙出口',
];

// 更新状态文本
function updateStatusText(text) {
  statusDiv.textContent = text;
}

// 更新按钮文本
function updateButtonLabel() {
  if (step < steps.length) {
    nextButton.textContent = steps[step];
  } else {
    nextButton.textContent = "完成";
  }
}

// 模拟宝藏地图API
class TreasureMap {
  static getInitialClue() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("在古老的图书馆里找到了第一个线索...");
      }, 1000);
    });
  }

  static decodeAncientScript(clue) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!clue) {
          reject("没有线索可以解码!");
        }
        resolve("解码成功!宝藏在一座古老的神庙中...");
      }, 1500);
    });
  }

  static searchTemple(location) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const random = Math.random();
        if (random < 0.6) { // 60% 的概率逃入神庙走廊
          resolve("找到了一个神秘的箱子...");
        } else { // 40% 的概率被抓住
          reject("糟糕!遇到了神庙守卫!");
        }
      }, 2000);
    });
  }

  static decipherMechanism() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("解密机关成功，宝箱的锁被打开了！");
      }, 2000);
    });
  }

  static openTreasureBox() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("恭喜!你找到了传说中的宝藏!");
      }, 1000);
    });
  }
}

treasureChestImage.addEventListener('click', () => {
  alert(`当前位置: ${mapData[step]}`);
});

document.addEventListener('DOMContentLoaded', async () => {
  // 加载背景音乐
  bgMusic.muted = true;
  bgMusic.play();
  bgMusic.muted = false;
  statusDiv.classList.add('visible');
  nextButton.textContent = '开始';

  // 恢复游戏历史相关信息
  if (playerInfo.gameHistory.length > 0) {
    step = playerInfo.gameHistory[playerInfo.gameHistory.length - 1].step;
    templeSearchAttempts = playerInfo.gameHistory[playerInfo.gameHistory.length - 1].templeSearchAttempts;
    updateStatusText(playerInfo.gameHistory[playerInfo.gameHistory.length - 1].statusText);
    updateButtonLabel();
    if (step < steps.length) {
      nextButton.disabled = false;
    }
  }

  // 加载图书馆信息
  try {
    const response = await fetch('library_info.txt');
    const data = await response.text();
    const libraryInfoDiv = document.getElementById('libraryInfo');
    if (libraryInfoDiv) {
      libraryInfoDiv.textContent = data;
    }
  } catch (error) {
    console.error('加载图书馆信息出错:', error);
  }

  // 加载神庙信息
  try {
    const response = await fetch('temple_info.txt');
    const data = await response.text();
    const templeInfoDiv = document.getElementById('templeInfo');
    if (templeInfoDiv) {
      templeInfoDiv.textContent = data;
    }
  } catch (error) {
    console.error('加载神庙信息出错:', error);
  }

  // 加载守卫信息
  try {
    const response = await fetch('guard_info.txt');
    const data = await response.text();
    const guardInfoDiv = document.getElementById('guardInfo');
    if (guardInfoDiv) {
      guardInfoDiv.textContent = data;
    }
  } catch (error) {
    console.error('加载守卫信息出错:', error);
  }

  TreasureMap.getInitialClue().then(clue => {
    updateStatusText(clue);
    updateButtonLabel();
    nextButton.disabled = false;
  });
});

async function nextStep() {
  try {
    switch (step) {
      case 0:
        updateStatusText(statusDiv.textContent);
        break;
      case 1:
        const clue = statusDiv.textContent;
        updateStatusText("正在解码古代文字...");
        statusDiv.textContent = await TreasureMap.decodeAncientScript(clue);
        break;
      case 2:
        updateStatusText("正在搜索神庙...");
        const location = statusDiv.textContent;
        statusDiv.textContent = await TreasureMap.searchTemple(location);
        templeSearchAttempts = 0; // 重置搜索尝试次数
        break;
      case 3:
        const lock = statusDiv.textContent;
        updateStatusText("正在解密宝箱机关...");
        statusDiv.textContent = await TreasureMap.decipherMechanism();
        break;
      case 4:
        const box = statusDiv.textContent;
        updateStatusText("正在打开宝箱...");
        statusDiv.textContent = await TreasureMap.openTreasureBox();
        nextButton.disabled = true;
      default:
        return;
    }
    // 更新玩家信息中的游戏历史
    playerInfo.gameHistory.push({
      step: step,
      templeSearchAttempts: templeSearchAttempts,
      statusText: statusDiv.textContent
    });
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
    step++;
    updateButtonLabel();
  } catch (error) {
    if (step === 2) { // 特定于搜索神庙的步骤
      templeSearchAttempts++;
      if (templeSearchAttempts >= 3) {
        updateStatusText("多次尝试后，仍然未能避开守卫。寻宝失败。");
        nextButton.disabled = true;
      } else {
        updateStatusText(`糟糕！遇到了神庙守卫！成功逃入神庙走廊！第${templeSearchAttempts + 1}次尝试...`);
        nextButton.textContent = "再次尝试";
        // 保持 step 不变，以便用户可以再次尝试
      }
    } else {
      updateStatusText(`任务失败: ${error}`);
      nextButton.disabled = true;
    }
    // 更新玩家信息中的游戏历史（即使失败也要记录）
    playerInfo.gameHistory.push({
      step: step,
      templeSearchAttempts: templeSearchAttempts,
      statusText: statusDiv.textContent
    });
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
  }
}

nextButton.addEventListener('click', nextStep);

restartButton.addEventListener('click', () => {
  // 重置游戏相关变量和本地存储的玩家信息
  step = 0;
  templeSearchAttempts = 0;
  playerInfo = {
    playerId: '',
    nickname: '',
    gameHistory: []
  };
  localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
  updateStatusText('');
  updateButtonLabel();
  nextButton.disabled = true;
  statusDiv.classList.add('visible');
  TreasureMap.getInitialClue().then(clue => {
    updateStatusText(clue);
    updateButtonLabel();
    nextButton.disabled = false;
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var bgMusic = document.getElementById('bgMusic');
  var playMusicButton = document.getElementById('playMusicButton');
  playMusicButton.addEventListener('click', function () {
    bgMusic.play();
  });
});