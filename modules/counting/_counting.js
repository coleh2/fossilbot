var countingId = "632192195633348617";



module.exports = function(evt, bot) {
    setTimeout(x=>{
    let numb = parseInt(evt.d.content);

    //don't respond to non-numbers
    if(isNaN(numb)) return false;

    //don't respond to odd numbers
    if(numb % 2) return false;

    //don't respond to messages out of the channel
    if(evt.d.channel_id != countingId) return false;

    //don't respond to self
    if(evt.d.author.id == bot.id) return false;

    bot.sendMessage({to: evt.d.channel_id, message: numb+1});
    }, 100);
};
