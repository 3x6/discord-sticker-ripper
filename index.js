const fetch = require('node-fetch'),
    fs = require('fs'),
    {exec} = require('child_process'),
    render = require('puppeteer-lottie');

const downloadFile = (async (url, path, lottie, info, fsStream) => {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", ()=>{
            fsStream.write(url+"\n");
            if (lottie = "no") return resolve();
            if (!lottie) {
                exec(`apng2gif "${path}" "${path.replace("png", "gif")}"`, (err, stdo, stderr) => {
                    if (stdo) fs.unlinkSync(path)
                    console.log("Converted "+info)
                })
            }
            resolve()
        });
      });
  });

function createFolderIfNotExist(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        });
        console.log(`Created ${folder.slice(9)}!`)
    }
}
//https://stackoverflow.com/a/51302466

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetch('https://discord.com/api/v8/sticker-packs/directory-v2/758482250722574376')
    .then(r => r.json())
    .then(json => {
        json.sticker_packs.forEach(async (pack, index) => {
                createFolderIfNotExist(`stickers/${(pack.stickers[0].format_type == 2 || pack.stickers[0].format_type == 1) ? "PNG" : "LOTTIE"} - ${pack.name.replace(':', '')}`);
                let folder = `${__dirname}/stickers/${(pack.stickers[0].format_type == 2 || pack.stickers[0].format_type == 1) ? "PNG" : "LOTTIE"} - ${pack.name.replace(':', '')}/`,
                stream = fs.createWriteStream(folder + pack.name.replace(':', "") + ".txt", {
                    flags: 'a'
                });
                stream.write(pack.name + ' Sticker Collection\n\n');
                await sleep(3000 * index)
                pack.stickers.forEach(sticker=>{
                    console.log(`Downloading ${pack.name} - ${sticker.name}`);
                    if (sticker.format_type == 2) {
                        downloadFile(`https://media.discordapp.net/stickers/${sticker.id}/${sticker.asset}.png`, folder + sticker.name + ".png", false, `${pack.name} - ${sticker.name}`, stream)
                    } else if (sticker.format_type == 1) {
                        downloadFile(`https://discord.com/stickers/${sticker.id}/${sticker.asset}.png`, folder + sticker.name + ".png", "no",  `${pack.name} - ${sticker.name}`, stream)
                    } else {
                        downloadFile(`https://discord.com/stickers/${sticker.id}/${sticker.asset}.json`, folder + sticker.name + ".json", true,  `${pack.name} - ${sticker.name}`, stream)
                    }
                })
            });
        });