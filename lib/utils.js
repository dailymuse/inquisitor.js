function indent(str, amount) {
    var b = [];
    var tabbing = "";
    var lines = str.split("\n");

    for(var i=0; i<amount; i++) {
        tabbing += " ";
    }

    lines.forEach(function(line, i) {
        b.push(tabbing);
        b.push(line);

        if(i < lines.length - 1) {
            b.push("\n");
        }
    });

    return b.join("");
}

module.exports = {
    indent: indent
};
