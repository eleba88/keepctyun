const Browser = require('./Browser');
const path = require('path');
const QRCode = require('qrcode');
const dataPath = path.join(__dirname, 'data');

function getTimestamp() {
  const now = new Date();
  return now.toLocaleString('zh-CN', { hour12: false });
}

function logger(...args) {
  console.log(`[${getTimestamp()}]`, ...args);
}

async function loginSubmit(page) {
  logger('尝试检查是否进入主界面');
  await page.waitForSelector('div.desktop-main-entry', { visible: true });
  logger('厉害了铁子, 进入了主界面');
  await page.click('div.desktop-main-entry');
  logger('点击了 "进入" 按钮');
}

async function reloadQrCode(page) {
  const buttons = await page.$$('button.el-button.el-button--primary.el-button--small');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const isParentVisible = await page.evaluate(button => {
      const parent = button.closest('div');
      const style = window.getComputedStyle(parent);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity > 0;
    }, button);
    if (isParentVisible) {
      const isButtonVisible = await page.evaluate(button => {
        const style = window.getComputedStyle(button);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity > 0;
      }, button);

      if (isButtonVisible) {
        await button.click();
        console.log('按钮已点击');
        break;
      }
    }
  }
}

async function waitForQrExpireVisible(page) {
  await new Promise(resolve => setTimeout(resolve, 10 * 1000 + 5 * 60 * 1000));
  logger(`二维码超时,重新加载`);
  await reloadQrCode(page);
}

async function handleApiResponse(page, response) { 
  try {
    const url = response.url();
    const method = response.request().method();
    if (!['GET', 'POST'].includes(method)) return;
    if (url === 'https://desk.ctyun.cn:8810/api/auth/client/qrCode/genData') {
      await page.waitForSelector('div.self-qr', { visible: true });
      const qrUrl = await page.$eval('div.self-qr', el => el.getAttribute('title'));
      let code = await QRCode.toString(qrUrl, { type: 'terminal', errorCorrectionLevel: 'L' });
      console.log(`请扫码\n${code}\n或打开以下链接:\n https://www.olzz.com/qr/?text=${encodeURIComponent(qrUrl)}`);
      waitForQrExpireVisible(page);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/list') {
      await loginSubmit(page);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/connect') {
      const resp = await response.json();
      logger(`设备登陆状态: ${resp?.data?.desktopInfo?.status}`);
    } else if (url === 'https://desk.ctyun.cn:8810/api/auth/client/logout') {
      logger(`当前设备被挤下线了`);
    }
  } catch (error) {
    console.log('onResponse error', error);
  }
}

async function main() {
  const browser = new Browser({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    dataPath,
    headless: true
  });
  await browser.launch();
  const page = await browser.getPage();
  page.on('response', (response) => handleApiResponse(page, response));
  await page.goto('https://pc.ctyun.cn/', { waitUntil: 'domcontentloaded', timeout: 60000 });
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('登录失败', error);
  }
})();
