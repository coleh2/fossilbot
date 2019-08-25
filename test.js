var tests = [];
var assert = {
    equals: function(val, equals, desc) {
        tests.push({
            pass: val === equals,
            description: desc 
        });
    },
    fail: function(desc) {
        tests.push({
            pass: false,
            description: desc
        })
    }
};

try {
    var bot = new Discord.Client({
        token: require(__dirname + '/.data/auth.json')
    });
    bot.connect();
    setTimeout(() => {
        assert.equals(bot.connected, true, "Bot connects to Discord");
    }, 30000);
} catch(e) {
    tests.fail("Error in connection tests");
}

