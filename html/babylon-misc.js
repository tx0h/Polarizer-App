var editIcon = new Image();
editIcon.src = "/Edit_icon_inverted.png";
var inviteIcon = new Image();
inviteIcon.src = "/chatbubble_inverted.png";
var onlineIcon = new Image();
onlineIcon.src = "/online_inverted.png";

function circleText(ctx, text, x, y, radius, angle) {
	var numRadsPerLetter = 2 * Math.PI / text.length;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);

	for(var i = 0; i < text.length; i++) {
		ctx.save();
		ctx.rotate(i * numRadsPerLetter);

		ctx.fillText(text[i], 0, -radius);
		ctx.restore();
	}
	ctx.restore();
}


function circlePoints(points, radius, center) {
	var slice = 2 * Math.PI / points;
	var nodes = [];
	var startAngle = 0;
	if(points % 2 == 0) {
		startAngle = (1/2*Math.PI) * 45;
	}
	for(var i = 0; i < points; i++) {
		var angle = slice * i + startAngle;
		var newX = center.X + radius * Math.cos(angle);
		var newY = center.Y + radius * Math.sin(angle);
		nodes.push({ x: newX, y: newY });
	}
	return (nodes);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {

	var lines = text.split("\n");
	for(var i = 0; i < lines.length; i++) {
		var words = lines[i].split(' ');
		var line = '';
		for(var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if(testWidth > maxWidth && n > 0) {
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
		y += lineHeight;
	}
};

function cropImage(ctx, canvas) {
	var w = canvas.width;
	var h = canvas.height;
	var pix = { x: [], y: [] };
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var x;
	var y;
	var index;

	for(y = 0; y < h; y++) {
		for(x = 0; x < w; x++) {
			index = (y * w + x) * 4;
			if(imageData.data[index + 3] > 0) {
				pix.x.push(x);
				pix.y.push(y);

			}
		}
	}
	pix.x.sort(function(a, b) { return a - b });
	pix.y.sort(function(a, b) { return a - b });
	var n = pix.x.length - 1;

	w = pix.x[n] - pix.x[0] + 1;
	h = pix.y[n] - pix.y[0] + 1;
	var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

	canvas.width = w;
	canvas.height = h;
	ctx.putImageData(cut, 0, 0);
	return (ctx);
}

function textBlock(x, y, z, name, text, options) {

	if(!options) {
		options = {};
	}
	//Set width an height for plane
	var planeWidth = options.width || 3.2;
	var planeHeight = options.height || 6.8; //10;

	//Set width and height for dynamic texture using same multiplier
	var DTWidth = planeWidth * 100; //64;
	var DTHeight = planeHeight * 100; //64

	var dynamicTexture = new BABYLON.DynamicTexture(
			"DynamicTexture",
			{
				width: DTWidth,
				height: DTHeight
			}, currentScene);

	//Check width of text for given font type at any size of font
	dynamicTexture.hasAlpha = true;

	var textureContext = dynamicTexture.getContext();
	textureContext.font = (options.fontSize || "22") + "px DPTFont";
	textureContext.save();
	switch(whoami.user.preferences.colorScheme) {
		case DPTGlobal.COLORS_dark:
			textureContext.fillStyle = "#7fffff";
			break;
		case DPTGlobal.COLORS_bright:
			textureContext.fillStyle = "#601616";
			break;
		case DPTGlobal.COLORS_default:
		default:
			textureContext.fillStyle = "#51c1fe";
	}
	if('color' in options) {
		textureContext.fillStyle = options.color;
	}

	wrapText(
		textureContext,
		text,
		5,
		(options.fontSize || 22) + 42, DTWidth -1, options.fontSize || 22);

	var dpt = JSON.parse(name);

	if(dpt.canEdit && dpt.context == "topicScene") {
		textureContext.drawImage(editIcon, 36, 0, 36, 36);
		textureContext.globalCompositeOperation = "xor";
		switch(whoami.user.preferences.colorScheme) {
			case DPTGlobal.COLORS_dark:
				textureContext.fillStyle = "#ff7f00";
				break;
			case DPTGlobal.COLORS_bright:
				textureContext.fillStyle = "#7a1a00";
				break;
			case DPTGlobal.COLORS_default:
			default:
				textureContext.fillStyle = "#51c1fe";
		}
		textureContext.fillRect(36,0,36,36);
	}
	
	if(dpt.isOnline) {
		textureContext.drawImage(onlineIcon, 72, 0, 36, 36);
		textureContext.globalCompositeOperation = "xor";
		switch(whoami.user.preferences.colorScheme) {
			case DPTGlobal.COLORS_dark:
				textureContext.fillStyle = "#009900";
				break;
			case DPTGlobal.COLORS_bright:
				textureContext.fillStyle = "#009900";
				break;
			case DPTGlobal.COLORS_default:
			default:
				textureContext.fillStyle = "#009900";
		}
		textureContext.fillRect(72,0,36,36);
	}
	
	textureContext = cropImage(textureContext, textureContext.canvas);

	//Create plane
	var plane = BABYLON.MeshBuilder.CreatePlane(
			"texttexture",
			{
				width: textureContext.canvas.width/100,
				height: textureContext.canvas.height/100,
			}, currentScene);
	plane.dpt = dpt;

	//plane actionManager to handle hover effect
	plane.actionManager = new BABYLON.ActionManager(currentScene);

	// bold ON MOUSE ENTER
	plane.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger,
			function(ev) {
				// var driver = new Driver()
				// driver.highlight(".btn-bar-icon")
				var meshLocal = ev.meshUnderPointer;
				canvas.style.cursor = "move";
			}, false));

	// normal ON MOUSE EXIT
	plane.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger,
			function(ev) {
				var meshLocal = ev.meshUnderPointer;
				canvas.style.cursor = "default";
			}, false));
//    var pngBase64 = textureContext.canvas.toDataURL("image/png", 0.99);

    plane.bjs = {
    	x: 1/DTWidth * textureContext.canvas.width * 2.4,
    	y: 1/DTHeight * textureContext.canvas.height * 1.6
    }; 

	dynamicTexture.update();

	//create material
	var mat = new BABYLON.StandardMaterial("mat", currentScene);
	mat.diffuseTexture = dynamicTexture;
	mat.emissiveColor = new BABYLON.Color3(1,1,1);
	mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

	//apply material
	plane.material = mat;
	//mat.freeze();

	// set the position
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	plane.showBoundingBox = false;
	
	//plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
	plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_X | BABYLON.Mesh.BILLBOARDMODE_Y;

	//plane.bakeCurrentTransformIntoVertices();

	plane.doNotSyncBoundingInfo = false;



	//plane.freezeWorldMatrix();
	return (plane);
}
