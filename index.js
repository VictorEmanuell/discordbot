const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
require('dotenv').config();

const config = {
    prefix: process.env.DS_PREFIX,
    token: process.env.DS_TOKEN
}

client.login(config.token);

client.on("ready", () => {
    console.log('Online!');
    client.user.setActivity('twitch.tv/velloso', { url: 'https://www.twitch.tv/velloso', type: 'STREAMING' });
});

client.on('message', async message => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLocaleLowerCase();

    var response;
    var status;

    if (comando === "pontos" || comando === "points" || comando === "ponto" || comando === "point") {
        if (message.channel.type != 'dm') {
            (await message.delete());
            (await message.reply("```Vamos fazer isso pelo privado. Acabei de te mandar uma mensagem lá!```")).delete({ timeout: 10000 });
        }

        message.author.send("```Me manda seu ID ou Username da BooYah.```").then(function () {
            message.author.dmChannel.awaitMessages(response => message.content, {
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .then(async (collected) => {
                    await axios.get(`https://streamvip.app/dashboard/api.php?acao=getRank&channel=54924097&filter=${collected.first().content}`)
                        .then((res) => {
                            response = res.data
                            status = res.status
                        })
                        .catch((error) => {
                            if (error.response) {
                                status = error.response.status
                            }
                        })

                    if (status === 200) {
                        if (response.result === 0) {
                            (await message.author.dmChannel.send("```Talvez você tenha digitado seu ID/Username errado, não te encontrei.\nDigite !pontos para tentar novamente.```")).delete({ timeout: 10000 })
                        } else {

                            let watchtime_number = Number(response.data[0].watchtime)
                            let watchtime = (watchtime_number / 60).toFixed(0)

                            let embedPontos = new Discord.MessageEmbed()
                                .setColor('#FEB34D')
                                .setAuthor(message.author.tag)
                                .setTitle(`Você tem ${response.data[0].points} VELLOSOpoints`)
                                .setDescription(`Username: **${response.data[0].user}**\nID: **${response.data[0].user_id}**\nWatchTime: **${watchtime}** horas\n\n**OBS.:** É importante que você digite seu Username corretamente, sem ignorar letras maiúsculas/minúsculas, e os espaços! Caso esteja em dúvida sobre os pontos, confira se seu ID BooYah corresponde com o apresentado nesta mensagem.\n\n**- Você também pode ver seus VellosoPoints digitando !points no chat da live ;)**`)
                                .setThumbnail('https://cdn.discordapp.com/icons/515558123998674944/9ad65964373770f0c86299f8ff4c600d.png?size=256', { dynamic: true, format: "png", size: 1024 })
                                .setTimestamp();

                            await message.author.send(embedPontos)
                        }
                    }

                    if (status === 404) {
                        (await message.author.dmChannel.send("```Talvez você tenha digitado seu ID errado, não te encontrei.\nDigite !pontos para tentar novamente.```")).delete({ timeout: 10000 })
                    }

                    if (status === 500 || status === 503) {
                        (await message.author.dmChannel.send("```Estamos com problemas de conexção :( Tente mais tarde.```")).delete({ timeout: 10000 })
                    }
                }).catch(() => {
                    message.author.send("```Você demorou para responder :(\nDigite !pontos para tentar novamente.```")
                })
        })
    }
})