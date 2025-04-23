const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');

// 启用 Stealth 插件
puppeteer.use(StealthPlugin());

class Browser {
  constructor({ userAgent, proxyServer, dataPath, headless = true } = {}) {
    this.userAgent = userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
    this.proxyServer = proxyServer;
    this.dataPath = dataPath;
    this.headless = headless;
  }

  async launch() {
    const args = [
      '--no-first-run',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--password-store=basic',
      '--use-mock-keychain',
      '--export-tagged-pdf',
      '--no-default-browser-check',
      '--disable-background-mode',
      '--enable-features=NetworkService,NetworkServiceInProcess,LoadCryptoTokenExtension,PermuteTLSExtensions',
      '--disable-features=FlashDeprecationWarning,EnablePasswordsAccountStorage',
      '--deny-permission-prompts',
      '--disable-gpu',
      '--accept-lang=en-US',
      '--window-size=1920,1080'
    ];

    if (os.platform() === 'linux') {
      args.push('--no-sandbox');
      args.push('--disable-setuid-sandbox');
      if (this.headless) {
        args.push('--headless=new');
      }
    }

    if (this.proxyServer) {
      args.push(`--proxy-server=${this.proxyServer}`);
    }

    const launchOptions = {
      headless: this.headless ? 'new' : false,
      args,
    };

    if (this.dataPath) {
      launchOptions.userDataDir = this.dataPath;
    }

    this.browser = await puppeteer.launch(launchOptions);
    this.page = await this.browser.newPage();

    // 设置 User-Agent
    await this.page.setUserAgent(this.userAgent);

    // 设置 Headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    // 手动伪装
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    return this;
  }

  async getPage() {
    return this.page;
  }

  async quit() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = Browser;
