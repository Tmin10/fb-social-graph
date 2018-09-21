const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('https://mbasic.facebook.com/');

    await page.type('input[name="email"]', credentials.email);
    await page.type('input[name="pass"]', credentials.password);
    
    const navigationPromise = page.waitForNavigation();
    await page.click('input[name="login"]');
    await navigationPromise;
    
    //Skip save device page
    if (page.url().indexOf('save-device')) {
        const navigationPromise = page.waitForNavigation();
        await page.click('input[value="OK"]');
        await navigationPromise;
    }

    await page.goto('https://mbasic.facebook.com/friends/center/friends/');

    let hasNext = true;
    const friends = [];

    while (hasNext) {
        console.log(page.url());

        const friendsLinks = await page.$$('a[href^="/friends/hovercard/"]');
        for (const link of friendsLinks) {
            const fName = await page.evaluate(el => el.innerText, link);
            const fLink = await page.evaluate(el => el.getAttribute('href'), link);
            friends.push({
                name: fName,
                link: fLink,
                uid: fLink.match(/uid=([0-9]*)/)[1]
            });
        }

        const linkHandlers = await page.$x("//span[contains(text(), 'See More')]");
        if (linkHandlers.length > 0) {
            const navigationPromise = page.waitForNavigation();
            await linkHandlers[0].click();
            await navigationPromise;
        } else {
            hasNext = false;
        }
    }

    console.log(friends);

    //await browser.close();
})();