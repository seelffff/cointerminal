const { Telegraf, Markup } = require('telegraf');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { resolve } = require('path');
const bot = new Telegraf('8121503881:AAEitEqE3XtEJPy-oCkpV3nX2Ey5ryczVN4');

// KEYBOARD 
function getKeyboard() {
    return Markup.keyboard([
            ['🔄 PARSE'],
            ['🌐 OPEN SITE', '📊 FULL REPORT']
        ])
        .resize()
        .oneTime();
}

// BOT HANDLERS
bot.hears('📊 FULL REPORT', async(ctx) => {
    try {
        // const salesData = await parseData();
        // const projectData = await fullReport();

        const idodetails = await getIdoDetailsViaHttp();
        const message = [
            'FULL REPORT',
            idodetails.saleType,
            idodetails.net,
            idodetails.invest
        ].join("\n")
        ctx.replyWithHTML(
            message
            //`\n𝙵𝚄𝙻𝙻 𝚁𝙴𝙿𝙾𝚁𝚃\n\n` +
            // `🔷 SALES DETAILS\n` +
            // `${salesData.name}\n${salesData.rise}\n${salesData.reg}\n\n` +
            // `🔷 PROJECT DETAILS\n` +
            // `${projectData.block}\n${projectData.sup}\n${projectData.hcup}\n` +
            // `${projectData.prise}\n${projectData.pval}\n${projectData.mcap}\n\n` +
            // `🔷 IDO DETAIL\n` +
            //`${idodetails.saleType}\n${idodetails.net}\n${idodetails.invest}\n`
            // `${idodetails.totwin}\n${idodetails.invamoun}\n${idodetails.totpart}`
        );
    } catch (error) {
        console.error('Error in FULL REPORT:', error);
        ctx.reply('❌ Error generating full report');
    }
});

bot.hears('🔄 PARSE', async(ctx) => {
    try {
        const data = await parseData();
        ctx.replyWithHTML(
            '\nACTUAL SALES\n' +
            `\n${data.name}\n${data.rise}\n${data.reg}`,
            getKeyboard()
        );
    } catch (error) {
        ctx.reply('❌ ERROR', getKeyboard());
    }
});

bot.hears('🌐 OPEN SITE', (ctx) => {
    ctx.reply('https://www.cointerminal.com/app');
});

bot.start((ctx) => {
    ctx.reply('Hi this bot parses current information from the Coin Terminal website, use the buttons below to get started, take /start',
        getKeyboard()
    );
});

// PARSING FUNCTIONS
async function idoddetails() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)...');
        await page.goto('https://www.cointerminal.com/project/zesh_ai_layer#ido-details', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const html = await page.content();
        const $ = cheerio.load(html);

        return {
            lprice: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(0).text().trim() || 'ℹ️Not info',
            frais: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(2).text().trim() || 'ℹ️Not info',
            totiss: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(3).text().trim() || 'ℹ️Not info',
            totwin: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(4).text().trim() || 'ℹ️Not info',
            invamoun: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(5).text().trim() || 'ℹ️Not info',
            totpart: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').text().trim() || 'ℹ️Not info'
        };
    } finally {
        await browser.close();
    }
}


async function fullReport() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.cointerminal.com/project/zesh_ai_layer', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const html = await page.content();
        const $ = cheerio.load(html);

        return {
            block: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(0).text().trim() || 'ℹ️Not info',
            sup: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(1).text().trim() || 'ℹ️Not info',
            hcup: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(2).text().trim() || 'ℹ️Not info',
            prise: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(3).text().trim() || 'ℹ️Not info',
            pval: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(4).text().trim() || 'ℹ️Not info',
            mcap: $('.MuiTypography-root.MuiTypography-body1.css-sifjsn').eq(5).text().trim() || 'ℹ️Not info'
        };
    } finally {
        await browser.close();
    }
}

async function parseData() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.cointerminal.com/app', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const html = await page.content();
        const $ = cheerio.load(html);

        return {
            name: $('.MuiTypography-root.MuiTypography-body1.css-o76i7d').first().text().trim() || 'ℹ️ Not info',
            rise: $('.MuiTypography-root.MuiTypography-body1.css-1yvxl1q').first().text().trim() || 'ℹ️ Not info',
            reg: $('[style*="linear-gradient(90.22deg, rgb(255, 119, 34)"]').text().trim() || 'ℹ️ Not info'
        };
    } finally {
        await browser.close();
    }
}

// LAUNCH
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));



fetch("https://api-ng.apeterminal.io/api/project/ido?projectId=67a2193d2fe0a04def2844dd&idoNumber=0", {
    "headers": {
        "accept": "*/*",
        "accept-language": "ru,ru-RU;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN5Y2gudmFub0BnbWFpbC5jb20iLCJnb29nbGVJZCI6IjExNDU3ODIwNTk2NzcwMzI4NzI3OSIsImxvZ2luTWV0aG9kIjoiZW1haWwiLCJpYXQiOjE3NDEyNzk5MjIsImV4cCI6MTc0Mzg3MTkyMn0.d3AgAU5jsP3FaLKNXhAKEut4q_JNh8FqaZz0ugsv3o0",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://www.cointerminal.com/project/zesh_ai_layer",
        "Referrer-Policy": "no-referrer-when-downgrade"
    },
    "body": null,
    "method": "GET"
});


async function getIdoDetailsViaHttp() {

    try {

        const response = await fetch("https://api-ng.apeterminal.io/api/project/ido?projectId=67a2193d2fe0a04def2844dd&idoNumber=0", {
            "headers": {
                "accept": "*/*",
                "accept-language": "ru,ru-RU;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN5Y2gudmFub0BnbWFpbC5jb20iLCJnb29nbGVJZCI6IjExNDU3ODIwNTk2NzcwMzI4NzI3OSIsImxvZ2luTWV0aG9kIjoiZW1haWwiLCJpYXQiOjE3NDEyNzk5MjIsImV4cCI6MTc0Mzg3MTkyMn0.d3AgAU5jsP3FaLKNXhAKEut4q_JNh8FqaZz0ugsv3o0",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://www.cointerminal.com/project/zesh_ai_layer",
                "Referrer-Policy": "no-referrer-when-downgrade"
            },
            "body": null,
            "method": "GET"
        });

        const idodata = await response.json();
        return {
            "saleType": idodata.saleType,
            "net": idodata.claimNetwork,
            "invest": idodata.investmentNetwork,

        };


    } catch (error) {

        console.error(error, " ошибка 404 zov ");
        return null;

    }
}