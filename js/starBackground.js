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

	warpEffect(canvas);
}

function warpEffect(canvas){
	const numStars = 30;
	
	var stars = [];
	for(var i = 0; i < numStars; i++)
	{
		stars.push({
			x: Math.random()*canvas.width,
			y: Math.random()*canvas.height,
			weight: Math.random()
		})
	}

	var ctx = canvas.getContext("2d");
	
	function drawStars()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < numStars; i++)
		{
			var cookie = stars[i];
			// The size of the emoji is set with the font
			ctx.font = '50px serif'
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#616161";
			ctx.fillText('-', cookie.x, cookie.y)
		}
		updateCookiePosition();
		window.requestAnimationFrame(drawStars);
	}
	
	function updateCookiePosition()
	{
		for(var i = 0; i < numStars; i++)
		{
			var p = stars[i];
			p.x += Math.cos(p.weight) + 0.1;
			if(p.x > canvas.width + 20)
			{
				stars[i] = {x: -10, y: Math.random()*canvas.height, weight: p.weight};
			}
		}
	}
	
	window.requestAnimationFrame(drawStars);
}