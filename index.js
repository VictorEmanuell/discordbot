const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');
require('dotenv').config();

const config = {
    prefix: process.env.DS_PREFIX,
    token: process.env.DS_TOKEN,
    message: process.env.MESSAGE_ID,
    channel: process.env.CHANNEL_ID,
    dev_id: process.env.DEV_ID
}

client.login(config.token);

client.on("ready", () => {
    console.log('Online!');
    client.user.setActivity('booyah.live/velloso', { url: 'https://booyah.live/velloso', type: 'STREAMING' });
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

        message.author.send("```Me manda seu ID da BooYah (ex.: 12345678).```").then(function () {
            message.author.dmChannel.awaitMessages(response => message.content, {
                max: 1,
                time: 30000,
                errors: ['time'],
            })
                .then(async (collected) => {
                    await axios.get(`https://api.velloso.live/users/${collected.first().content}`)
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
                            (await message.author.dmChannel.send("```Talvez você tenha digitado seu ID errado, não te encontrei.\nDigite !pontos para tentar novamente.```")).delete({ timeout: 10000 })
                        } else {

                            let watchtime_number = Number(response.timeWatched)
                            let watchtime = (watchtime_number / 60).toFixed(0)

                            let horasCheck

                            if(watchtime < 2){
                                horasCheck = "hora"
                            } else {
                                horasCheck = "horas"
                            }

                            let embedPontos = new Discord.MessageEmbed()
                                .setColor('#FEB34D')
                                .setAuthor(message.author.tag)
                                .setTitle(`Você tem ${response.points} VELLOSOpoints`)
                                .setDescription(`Username: **${response.nickname}**\nID: **${response.uid}**\nWatchTime: **${watchtime}** ${horasCheck}\n\n`)
                                .setThumbnail(`${response.avatarUrl}`, { dynamic: true, format: "avatar", size: 1024 })
                                .setTimestamp();

                            await message.author.send(embedPontos)
                        }
                    }

                    if (status === 404) {
                        (await message.author.dmChannel.send("```Talvez você tenha digitado seu ID errado, não te encontrei.\n**Digite !pontos para tentar novamente.**```")).delete({ timeout: 10000 })
                    }

                    if (status === 500 || status === 503) {
                        (await message.author.dmChannel.send("```Estamos com problemas de conexção :( Tente mais tarde.```")).delete({ timeout: 10000 })
                    }
                }).catch(() => {
                    message.author.send("```Você demorou para responder :(\nDigite !pontos para tentar novamente.```")
                })
        })
    }
});

client.on('message', async message => {
    if(message.content === '!clear' && message.channel.id != config.channel){
        (await message.delete())
    }

    if (message.content === '!clear' && message.channel.id === config.channel) {
        (await message.delete())
        if (message.member.hasPermission('MANAGE_MESSAGES') || message.author.id === config.dev_id) {
            message.channel.messages.fetch({ limit: 100 }).then(messages => {
                messages.delete(config.message)
                message.channel.bulkDelete(messages, true)
            })
        } else {
            (await message.reply('Você não tem permissão para limpar o chat :(')).delete({timeout: 5000})
        }
    }
});