const Browser = require('./Browser');
const QRCode = require('qrcode');

async function loginSubmit(page) {
  console.log('尝试检查是否进入主界面');
  await page.waitForSelector('div.desktop-main-entry', { visible: true });
  console.log('厉害了铁子, 进入了主界面');
  await page.click('div.desktop-main-entry');
  console.log('点击了 "进入" 按钮');
}

async function handleApiResponse(page, response) { 
  try {
    const url = response.url();
    const method = response.request().method();
    if (!['GET', 'POST'].includes(method)) return;
    if (url === 'https://desk.ctyun.cn:8810/api/auth/client/qrCode/genData') {
      console.log(`发现需要扫码登陆`);
      const resp = await response.json()
      let qrCodeId = resp?.data?.qrCodeId;
      let qrUrl = `https://desk.ctyun.cn:443/selforder/#/login-confirm?qrCodeId=${qrCodeId}&loginMode=1`
      let code = await QRCode.toString(qrUrl, { type: 'terminal',  errorCorrectionLevel: 'L'});
      console.log(code);
      console.log(`若二维码显示异常请打开以下地址进行扫码:\n https://www.olzz.com/qr/?text=${qrUrl}`);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/list') {
      await loginSubmit(page);
    } else if (url === 'https://desk.ctyun.cn:8810/api/desktop/client/connect') {
      const resp = await response.json();
      console.log(`设备登陆状态: ${resp?.data?.desktopInfo?.status}`);
    } else if (url === 'https://desk.ctyun.cn:8810/api/auth/client/logout') {
      console.log(`当前设备被挤下线了`);
    }
  } catch (error) {
    console.log('onResponse error', error);
  }
}

async function main() {
  const browser = new Browser({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    headless: true
  });
  await browser.launch();
  const page = await browser.getPage();
  page.on('response', (response) => handleApiResponse(page, response));;
  await page.goto('https://pc.ctyun.cn/', {waitUntil: 'domcontentloaded', timeout: 60000 });
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('登录失败', error);
  }
})();
