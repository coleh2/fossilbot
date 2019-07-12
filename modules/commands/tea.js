module.exports = function(evt,args,_cfg,bot) {
    bot.sendMessage({
        to: evt.d.channel_id,
        message: 'https://www.dunkindonuts.com/en/food-drinks/hot-drinks/tea'
    });
}