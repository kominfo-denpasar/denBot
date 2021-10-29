const tBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const nodeCron = require("node-cron");
const dotenv = require('dotenv').config();

console.log(process.env.TOKEN);

const token = process.env.TOKEN;
let usernya = process.env.USER;
let passnya = process.env.PASS;

const bot = new tBot(token, {polling: true});


console.log('running...');

const absensi = async function(user, pass) {
  try {
  const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
	timeout: 0,
  });
  const page = await browser.newPage();

  // override permission location	
  const context = browser.defaultBrowserContext()
  await context.overridePermissions("https://ekinerja.denpasarkota.go.id/login/index.php", ['geolocation'])
  await page.setGeolocation({latitude: parseFloat(-8.654291), longitude: parseFloat(115.227906)})

  await page.goto('https://ekinerja.denpasarkota.go.id/login/index.php');
  await page.waitForSelector('input[name=userid]');

  await page.$eval('input[name=userid]', el => el.value = user);
  await page.$eval('input[name=passwd]', el => el.value = pass);
  await page.click('.btn.btn-primary');

  // absen
  await page.waitForSelector('.btnku', {"waitUntil" : "networkidle2"});
  //await page.click('.btnku');
  await page.waitFor(500);

  await page.screenshot({ path: 'example.png', fullPage: true });

  await browser.close();
  // await bot.sendMessage('-1001242131071', 'Absensi sudah dilakukan!');
  // Sending the photo
  bot.sendPhoto('-1001242131071', "example.png"); 

  console.log("selesai absensi!");
  } catch (err) {
     console.log('error launching brwoser => ', err)
  }
}

// Schedule a job to run every two minutes
const job = nodeCron.schedule("*/2 * * * *", () => absensi(usernya, passnya));
