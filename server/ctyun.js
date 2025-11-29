const Browser = require('./Browser');
const path = require('path');
const qrterminal = require('qrcode-terminal');
const axios = require('axios');
const dataPath = path.join(__dirname, 'data');
let runSubmit = false;

function getTimestamp() {
  const now = new Date();
  return now.toLocaleString('zh-CN', { hour12: false });
}

function logger(...args) {
  console.log(`[${getTimestamp()}]`, ...args);
}

async function loginSubmit(page) {
  if (runSubmit) return;
  runSubmit = true;
  logger('尝试检查是否进入主界面');
  await page.waitForSelector('div.desktopcom-enter', { visible: true });
  logger('厉害了铁子, 进入了主界面');
  await page.click('div.desktopcom-enter');
  logger('点击了 "进入" 按钮');
  runSubmit = false;
}

async function waitForQrExpireVisible(page) {
  await new Promise(resolve => setTimeout(resolve, 10 * 1000 + 5 * 60 * 1000));
  logger(`二维码超时,重新加载`);
  await page.goto('https://pc.ctyun.cn/', { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function handleApiResponse(page, response) { 
  try {
    const url = response.url();
    const method = response.request().method();
    if (!['GET', 'POST'].includes(method)) return;
    if (url === 'https://desk.ctyun.cn:8810/api/auth/client/qrCode/genData') {
      await page.waitForSelector('div.self-qr', { visible: true });
      const qrUrl = await page.$eval('div.self-qr', el => el.getAttribute('title'));
      if (qrUrl) {
        console.log(`打开链接: https://www.olzz.com/qr/?text=${encodeURIComponent(qrUrl)}  或扫码`);
        qrterminal.generate(qrUrl, { small: true });
      } else { 
        logger(`二维码异常,重新加载`);
      }
      waitForQrExpireVisible(page);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/pageDesktop') {
      await loginSubmit(page);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/connect') {
      const resp = await response.json();
      let status = resp?.data?.desktopInfo?.status || '登录未知';
      logger(`设备登陆状态: ${status}`);
      notifyWebhook(status)
    } else if (url === 'https://desk.ctyun.cn:8810/api/auth/client/logout') {
      logger(`当前设备被挤下线了`);
      notifyWebhook('挤下线');
    }
  } catch (error) {
    console.log('onResponse error', error);
  }
}

async function notifyWebhook(status) {
  try {
    if (process.env.WEBHOOK_URL) {
      await axios.post(process.env.WEBHOOK_URL, { title: '天冀云电脑', content: `设备:${status}` }, { headers: { 'x-requested-id': '66fa52b9-3b8c-43bb-8660-88dc87a0' } });
    }
  } catch (error) {
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
  logger('程序启动完成');
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('登录失败', error);
  }
})();
