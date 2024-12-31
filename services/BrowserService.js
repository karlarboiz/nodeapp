const puppeteer = require("puppeteer");//require puppeteer;

//create class for BrowserService
class BrowserService{
    //generate text context
    static async generateTextContext(url_name) {
       try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url_name);

        const extractedText = await page.$eval('*',(el)=>el.innerText)
     
        await browser.close();

        return {
            isSuccess: true,
            extractedText:extractedText
        };
       }catch(e){
        throw new Error(e.message);
       }
    }
}

module.exports= BrowserService;