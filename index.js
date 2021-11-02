var express = require('express');
var request = require('request');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const tBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');

var http = require('http');
var https = require('https');

// def settings
var app = express();
const token = process.env.TOKEN;
const bot = new tBot(token, {polling: true});


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post('/incoming', (req, res) => {
    var msg = `*Hey 👋*
    Halo! Ini adalah bot untuk mengecek website!`;
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(msg);
});

app.get('/test', (req, res) => {
    try {
        // console.log('running...');
        bot.sendMessage('-1001242131071', 'test kirim pesan!');
        var msg = `Pesan terkirim!`;
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(msg);
        // Sending the photo
        // bot.sendPhoto('-1001242131071', "example.png"); 
    
    } catch (err) {
        var msg = `Error!`;
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(msg);
        // console.log('error launching! => ', err)
    }
});

var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);

    // intro
    bot.onText(/\/intro/, (msg) => {
        // listens for "/start" and responds with the greeting below.
        bot.sendMessage(msg.chat.id,
        "Halo, ini adalah DenBot. Silahkan kunjungi https://zeneight.xyz untuk informasi lebih lanjut.");
    });

    bot.onText(/\/start/, (msg) => {

        bot.sendMessage(msg.chat.id, "Halo, selamat datang! Apa yang ingin Anda lakukan?", {
            reply_markup: {
                keyboard: [[
                    {
                        text: '/cekweb',
                        callback_data: '/cekweb'
                    }, {
                        text: '/cekabsen',
                        callback_data: '/cekabsen'
                    }, {
                        text: '/cekupdown',
                        callback_data: '/cekupdown'
                    }, {
                        text: '/intro',
                        callback_data: '/intro'
                    }
                ]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    });

    bot.onText(/\/cekabsen/, (msg) => {
        bot.sendMessage(msg.chat.id, "Mengecek...");
        absensi(msg.chat.id);
    });

    bot.onText(/\/cekweb/, (msg, match) => {
        const chatId = msg.chat.id;
        const url = match.input.split(' ')[1];
        
        if (url === undefined) {
            bot.sendMessage(
                chatId,
                'Untuk mengecek tampilan website, silahkan ketik format seperti contoh: /cekweb https://website.com',
            );
            return;
        } else {
            bot.sendMessage(msg.chat.id, "Mengecek...");
            cekWeb(msg.chat.id, url);
        }
    });

    bot.onText(/\/cekupdown/, (msg) => {
        const array = [
            "https://divos.denpasarkota.go.id/",
            "https://sipapa.denpasarkota.go.id",
            "https://pusatdata.denpasarkota.go.id",
            "https://sidok.denpasarkota.go.id",
            "https://bankdata.denpasarkota.go.id",
            "https://ppid.denpasarkota.go.id",
            "https://simonev.denpasarkota.go.id",
            "https://smartcity.denpasarkota.go.id",
            "https://diaspora.denpasarkota.go.id",
            "https://perpustakaan.denpasarkota.go.id/",
            "http://rujukanonline.denpasarkota.go.id/",
        ]

        bot.sendMessage(msg.chat.id, "Mengecek " + array.length + " Website...");
        cekUpDown(msg.chat.id, array);
    });

    // ------------------------------------------------
    // fungsi-fungsi

    // function checkWebsite(url) {
    const checkWebsite = async url => await new Promise((resolve, reject) => {
        request(url, function(error, response, body) {
            // resolve({site: url, status: (!error && response.statusCode == 200) ? "UP": "DOWN: " + error.message});
            resolve({site: url, status: (!error && response.statusCode == 200) ? "[Normal \u{1F197}]": "[Down \u{26D4}]\n\u{2139} " + error.message});
        });
    });

    const cekUpDown = async (msg, urlWeb) => {
        let i = 0
        var data = "" 

        while (i < urlWeb.length) {
            data += await checkWebsite(urlWeb[i]).then(function(result) {
                return result.site+"\n"+result.status+ "\n\n"
                // bot.sendMessage(msg, result.site+" -> "+result.status);
            });
            i++
        }

        bot.sendMessage(msg, data);
        // bot.sendMessage(msg, urlWeb.length + " Website telah dicek");

    }

    // fungsi cw
    const cekWeb = async function(msg, web) {
        try {
            const browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
                timeout: 10000,
            });
            const page = await browser.newPage();
        
            // override permission location	
            const context = browser.defaultBrowserContext()
            await context.overridePermissions(web, ['geolocation'])
            await page.setGeolocation({latitude: parseFloat(-8.654291), longitude: parseFloat(115.227906)})
        
            await page.goto(web);
            await page.waitForSelector('body', {"waitUntil" : "networkidle2"});

            await page.waitFor(500);
            await page.screenshot({ path: 'example.png', fullPage: true });
        
            await browser.close();
            // await bot.sendMessage('-1001242131071', 'Absensi sudah dilakukan!');
            // Sending the photo
            bot.sendPhoto(msg, "example.png"); 
        } catch (err) {
            // error
            bot.sendPhoto(msg, "Web tidak dapat diakses.");
            // console.log(err)
        }
    }

    const absensi = async function(msg) {
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
        
            await page.$eval('input[name=userid]', el => el.value = '0308011996225');
            await page.$eval('input[name=passwd]', el => el.value = 'dps12345');
            await page.click('.btn.btn-primary');
        
            // absen
            await page.waitForSelector('.btnku', {"waitUntil" : "networkidle2"});
            //await page.click('.btnku');
            await page.waitFor(500);
        
            await page.screenshot({ path: 'example.png', fullPage: true });
        
            await browser.close();
            // await bot.sendMessage('-1001242131071', 'Absensi sudah dilakukan!');
            // Sending the photo
            bot.sendPhoto(msg, "example.png"); 
        } catch (err) {
            // error
        }
    }
});