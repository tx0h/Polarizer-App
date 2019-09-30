function circleText(ctx, text, x, y, radius, angle) {
	var numRadsPerLetter = 2 * Math.PI / text.length;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);

	for (var i = 0; i < text.length; i++) {
		ctx.save();
		ctx.rotate(i * numRadsPerLetter);

		ctx.fillText(text[i], 0, -radius);
		ctx.restore();
	}
	ctx.restore();
}

function circleTextPlane(x, y, z, name, text) {
	//Set width an height for plane
	var planeWidth = 12;
	var planeHeight = 12; //10;

	//Create plane
	var plane = BABYLON.MeshBuilder.CreatePlane(name, { width: planeWidth, height: planeHeight }, currentScene);
	plane.dpt = JSON.parse('{"context": "topicCircle"}');

	//Set width and height for dynamic texture using same multiplier
	var DTWidth = planeWidth * 100; //64;
	var DTHeight = planeHeight * 100; //64

	var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, currentScene);

	//Check width of text for given font type at any size of font
	var ctx = dynamicTexture.getContext();

	dynamicTexture.hasAlpha = true;
	ctx.fillStyle = 'transparent';

	textureContext = dynamicTexture.getContext();
	textureContext.font = "28px DPTFont";
	textureContext.save();
	textureContext.fillStyle = "#00ccff";

	circleText(textureContext, text, 600, 600, 550, -Math.PI / 3)
		//			textureContext.scale(3, 3);
	textureContext.restore();

	dynamicTexture.update();

	//create material
	var mat = new BABYLON.StandardMaterial("mat", currentScene);
	mat.diffuseTexture = dynamicTexture;
	mat.emissiveColor = new BABYLON.Color3(1, 1, 1);

	//apply material
	plane.material = mat;
	//mat.freeze();

	// set the position
	plane.position.x = x + 2;
	plane.position.y = y;
	plane.position.z = z;

	plane.scaling.x *= 1.5;
	plane.scaling.y *= 1.5;
	//plane.doNotSyncBoundingInfo = true
	//plane.freezeWorldMatrix();
	return (plane);
}

function circlePoints(points, radius, center) {
	var slice = 2 * Math.PI / points;
	var nodes = [];
	for (var i = 0; i < points; i++) {
		var angle = slice * i;
		var newX = center.X + radius * Math.cos(angle);
		var newY = center.Y + radius * Math.sin(angle);
		nodes.push({ x: newX, y: newY });
		/*
		var box = new BABYLON.MeshBuilder.CreateBox("box", {
			width: 0.1,
			height: 0.1,
			depth: 0.1,
			sideOrientation: 1
		}, currentScene);
		box.position = new BABYLON.Vector3(newX, newY, -1);
		//create material
		var mat = new BABYLON.StandardMaterial("mat", currentScene);
		mat.diffuseColor = new BABYLON.Color3(1,.5,0);
		mat.emissiveColor = new BABYLON.Color3(1,.5,0);

		//apply material
		box.material = mat;
		mat.freeze();
		*/
	}
	return (nodes);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {

	var lines = text.split("\n");
	for (var i = 0; i < lines.length; i++) {
		var words = lines[i].split(' ');
		var line = '';
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
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

	for (y = 0; y < h; y++) {
		for (x = 0; x < w; x++) {
			index = (y * w + x) * 4;
			if (imageData.data[index + 3] > 0) {
				pix.x.push(x);
				pix.y.push(y);

			}
		}
	}
	pix.x.sort(function(a, b) { return a - b });
	pix.y.sort(function(a, b) { return a - b });
	var n = pix.x.length - 1;

	w = pix.x[n] - pix.x[0];
	h = pix.y[n] - pix.y[0];
	var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

	canvas.width = w;
	canvas.height = h;
	ctx.putImageData(cut, 0, 0);
	return (ctx);
}


function textBlock(x, y, z, name, text) {

	//Set width an height for plane
	var planeWidth = 4.8;
	var planeHeight = 3.2; //10;

	//Create plane
	var plane = BABYLON.MeshBuilder.CreatePlane(name, { width: planeWidth, height: planeHeight }, currentScene);
	plane.dpt = JSON.parse(name);

	//Set width and height for dynamic texture using same multiplier
	var DTWidth = planeWidth * 100; //64;
	var DTHeight = planeHeight * 100; //64

	var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, currentScene);

	//Check width of text for given font type at any size of font
	dynamicTexture.hasAlpha = true;

	textureContext = dynamicTexture.getContext();
	textureContext.font = "22px DPTFont";
	textureContext.save();
	textureContext.fillStyle = "#00ccff";

	wrapText(textureContext, text, 5, 20, 479, 22);
	//	textureContext = cropImage(textureContext, textureContext.canvas);

	dynamicTexture.update();

	//create material
	var mat = new BABYLON.StandardMaterial("mat", currentScene);
	mat.diffuseTexture = dynamicTexture;
	mat.emissiveColor = new BABYLON.Color3(1, 1, 1);

	//apply material
	plane.material = mat;
	//mat.freeze();

	// set the position
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	plane.showBoundingBox = false;
	//plane.doNotSyncBoundingInfo = true
	//plane.freezeWorldMatrix();
	return (plane);
}