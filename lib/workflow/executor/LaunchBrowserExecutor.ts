import puppeteer, { type Browser } from "puppeteer";
import { type Browser as BrowserCore } from "puppeteer-core";
import { ExecutionEnvironment } from "@/types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");
    let browser: Browser | BrowserCore;
    console.log("Launching browser with local puppeteer...");
    const localExecutablePath =
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath: localExecutablePath,
    });

    environment.log.info("Browser launched successfully.");
    environment.setBrowser(browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(websiteUrl, { waitUntil: "domcontentloaded" });
    environment.setPage(page);
    environment.log.info(`Opened the website successfully. URL:${websiteUrl}`);

    return true;
  } catch (e: any) {
    environment.log.error(`Failed to launch browser: ${e.message}`);
    console.error("Error while launching puppeteer:", e);
    return false;
  }
}
