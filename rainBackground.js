function newCanvasElement(zIndex) {
    var canvas = document.createElement('canvas');

    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.zIndex = zIndex;

    return canvas;
}

function setCanvasSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
}

function draw() {
    // zIndex is set to -1 so the canvas is behind all of the page content
    var zIndex = -1;

    // create, correctly size and append the canvas to the page
    var canvas = newCanvasElement(zIndex);
    setCanvasSize(canvas);
    document.body.appendChild(canvas);

    // resize the canvas on the window onresize event
    window.onresize = function () {
        setCanvasSize(canvas);
    };

    emojiRain(canvas);
}

function emojiRain(canvas){
	const numEmoji = 30;
    const emojiToUse = ['⛰️', '🃏', '👺']
	
	var emojis = [];
	for(var i = 0; i < numEmoji; i++)
	{
        emojis.push({
            x: Math.random()*canvas.width,
			y: Math.random()*canvas.height,
			weight: Math.random()
		})
    }
    
    var ctx = canvas.getContext("2d");
	
	function drawEmoji()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < numEmoji; i++)
		{
			var emoji = emojis[i];
			// The size of the emoji is set with the font
			ctx.font = '50px serif'
			ctx.textAlign = "center"; 
			ctx.textBaseline = "middle";
            var emojiChar = emojiToUse[Math.floor(i%emojiToUse.length)];
			ctx.fillText(emojiChar, emoji.x, emoji.y)
		}
        updateCookiePosition();
        window.requestAnimationFrame(drawEmoji);
	}
	
	function updateCookiePosition()
	{
		for(var i = 0; i < numEmoji; i++)
		{
			var p = emojis[i];
			p.y += Math.cos(p.weight) + 0.1;
			if(p.y > canvas.height + 20)
			{
                emojis[i] = {x: Math.random()*canvas.width, y: -20, weight: p.weight};
			}
		}
	}
	
    window.requestAnimationFrame(drawEmoji);
}