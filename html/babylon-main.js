

function createAvatar(avatarInfo, camera) {
	var name;
	if(!avatarInfo && camera) {
		var name = dpt.getSocketId();
	} else {
		name = avatarInfo.avatar;
	}
	var avatar = BABYLON.MeshBuilder.CreateBox(
		name,
		{
			width: 0.35,
			height: 0.35,
			depth: 0.35
		}, currentScene);
	if(camera) {
		avatar.position = new BABYLON.Vector3(0,0,0);
		avatar.parent = camera;
		avatar.position.z = camera.position.z - 1.3;
//		avatar.position.z = camera.position.y + 1.3;
		var socket = dpt.getSocket();
		socket.emit('3d', { event: 'connect', avatar: name, avatarPos: avatar.position });
		setInterval(() => {
			socket.emit('3d', { event: 'update', avatar: name, avatarPos: currentScene.cameras[0].position });
		}, 1000);
	} else {
		avatar.position = avatarInfo.avatarPos;
	}
//	avatar.position = camera.position;
	var mat = new BABYLON.StandardMaterial("avatar", currentScene);
	mat.diffuseColor = new BABYLON.Color3(1,1,0);
	mat.emissiveColor = new BABYLON.Color3(1,1,0);
	avatar.material = mat;
}

function disposeAvatar(avatarInfo) {
	for(var i in currentScene.meshes) {
		if(currentScene.meshes[i].name == avatarInfo.avatar) {
			currentScene.meshes[i].dispose();
			break;
		}
	}
}

function updateAvatar(avatarInfo) {
	var mySocketId = dpt.getSocketId();
	var done = false;
	if(avatarInfo.avatar != mySocketId) {
		for(var i in currentScene.meshes) {
			if(currentScene.meshes[i].name == avatarInfo.avatar) {
				currentScene.meshes[i].position = avatarInfo.avatarPos;
				done = true;
				break;
			}
		}
		if(!done) {
			createAvatar(avatarInfo);
		}
	}
}

function getCollisionBox() {
	//Simple box
	var box = new BABYLON.MeshBuilder.CreateBox("collisionBox", 
	{
		width: 100,
		height: 60,
		depth: 80,
		sideOrientation: 1
	}, currentScene);

	box.position = new BABYLON.Vector3(0, 0, -39.85);
	//create material
	var mat = new BABYLON.StandardMaterial("mat", currentScene);
	mat.diffuseColor = new BABYLON.Color3(10 / 255, 80 / 255, 119 / 255);
	mat.specularColor = new BABYLON.Color3(10 / 255, 80 / 255, 119 / 255);
	mat.emissiveColor = new BABYLON.Color3(10 / 255, 80 / 255, 119 / 255);
	mat.alpha = 0.45;
	
	//mat.alphaMode = BABYLON.Engine.ALPHA_MAXIMIZED;
	

	//apply material
	box.material = mat;
	//mat.freeze();

	return(box);
}

function getCamera() {

	var camera = new BABYLON.ArcRotateCamera(
			"Camera",
			-Math.PI/2,
			Math.PI/2,
			35,
			new BABYLON.Vector3(0, 0, 0),
			currentScene);

	// camera
	camera.wheelPrecision = 30;
	camera.panningSensibility = 300;
	camera.pinchDeltaPercentage = 0.001;
	camera.pinchToPanMaxDistance = 124;

	camera.lowerRadiusLimit = 1;
	camera.upperRadiusLimit = 250;
		
	camera.lowerAlphaLimit = 0.0174533 * -179;
	camera.upperAlphaLimit = 0.0174533 * 180;
	camera.lowerBetaLimit = 0.0174533 * 0;
	camera.upperBetaLimit = 0.0174533 * 179;
	
	camera.panningDistanceLimit = 35;

	camera.panningAxis = new BABYLON.Vector3(1, 1, 0);
	//camera.setTarget(BABYLON.Vector3.Zero());

	if(currentScene.dptMode == "topicScene") {
		camera.radius = 15;
		if(topicCamState) {
			camera.setPosition(topicCamState.position);
			camera.setTarget(topicCamState.target);
			camera.alpha = topicCamState.alpha;
			camera.beta = topicCamState.beta;
			camera.radius = topicCamState.radius;
		}

	} else if(currentScene.dptMode == "opinionScene") {
		//camera.setPosition(new BABYLON.Vector3(0,0,-20));
		if(opinionCamState) {
			camera.setPosition(opinionCamState.position);
			camera.setTarget(opinionCamState.target);
			camera.alpha = opinionCamState.alpha;
			camera.beta = opinionCamState.beta;
			camera.radius = opinionCamState.radius;
		}
	}

	return(camera);
}

function setBabylonScheme() {
	switch(whoami.user.preferences.colorScheme) {
	case DPTGlobal.COLORS_dark:
		currentScene.clearColor = new BABYLON.Color3(0, 0.1, 0.2);
		break;
	case DPTGlobal.COLORS_bright:
		currentScene.clearColor = new BABYLON.Color3(.7, 0.9, 1.0);
		break;
	case DPTGlobal.COLORS_skybox:
		currentScene.clearColor = new BABYLON.Color3(10 / 255, 80 / 255, 119 / 255);
		break;
	case DPTGlobal.COLORS_default:
	default:
		var skybox = BABYLON.Mesh.CreateBox("skyBox", 250.0, currentScene);
		var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", currentScene);
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/skybox/space2", currentScene);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.disableLighting = true;
		skybox.infiniteDistance = true;
		skybox.material = skyboxMaterial;
		
	}
}

var createGenericScene = function(dptMode) {

	var genericScene = new BABYLON.Scene(engine);
	BABYLON.Scene.DoubleClickDelay = 500;

	currentScene = genericScene;
	currentScene.dptMode = dptMode;
	currentScene.collisionsEnabled = false;

	// switch the light on.
	var light = new BABYLON.HemisphericLight(
			"light1",
			new BABYLON.Vector3(0, 0, -1),
			currentScene);

	light.radius = 10;
	light.diffuse = new BABYLON.Color3(1, 0.8, 0.8);
	light.intensity = 0.5;

	// get us the cam
	var camera = getCamera();
	camera.attachControl(canvas, true);
	camera.checkCollisions = false;

	//createAvatar(false, camera);

	setBabylonScheme();
	createGUIScene(dptMode);

	currentScene.onPointerObservable.add((pointerInfo) => {
		idleSince = BABYLON.Tools.Now;
		powerSave = false;
		switch (pointerInfo.type) {
			case BABYLON.PointerEventTypes.POINTERDOWN:
				//console.log("POINTER DOWN");
				break;
			case BABYLON.PointerEventTypes.POINTERTAP:
				//console.log("POINTER TAP");
				
				let picked = pointerInfo.pickInfo.pickedMesh;

				if(picked && 'dpt' in picked) {

					// catch the icon button on the canvas
					// "To get the axis aligned version of your picked
					// coordinates, you need to transform it by the inverse of
					// the mesh world matrix. discussed on here:
					// https://forum.babylonjs.com/t/how-to-calculate-the-rotation-from-the-billboard-picked-point-position/6667/11
					var inverse = BABYLON.Matrix.Invert(picked.getWorldMatrix());

					// click point
					var click = BABYLON.Vector3.TransformCoordinates(pointerInfo.pickInfo.pickedPoint, inverse)

					click.x = picked._geometry.extend.maximum.x + click.x;
					click.y = picked._geometry.extend.maximum.y - click.y;

					if(click.y < .36) {
						if(click.x >=0 && click.x < .36) {
							// invite to chat via proposition
							if('opinionId' in picked.dpt
							&& picked.dpt.context == "opinionScene"
							&& picked.name == "texttexture"
							&& picked.dpt.canInvite == true) {

								return;
							}
						} else if(click.x >= .36 && click.x < .72) {
							// edit either the opinion or the topic
							if('opinionId' in picked.dpt
							&& picked.dpt.context == "opinionScene"
							&& picked.name == "texttexture"
							&& picked.dpt.canEdit == true) {
								opinionEdit(picked.dpt);
								return;
							}
							if('topicId' in picked.dpt
							&& picked.dpt.context == "topicScene"
							&& picked.name == "texttexture"
							&& picked.dpt.canEdit == true) {
								topicEdit(picked.dpt);
								return;
							}
						}
					}
					if(picked.dpt.context == "tubeConnection") {

						if(picked.dpt.status == "CLOSED") {
							for(var i in currentScene.meshes) {
								if('dpt' in currentScene.meshes[i]
								&& currentScene.meshes[i].dpt.context == "tubeConnection"
								&& currentScene.meshes[i].dpt.initiatorOpinion == picked.dpt.recipientsOpinion
								&& currentScene.meshes[i].dpt.recipientOpinion == picked.dpt.initiatorOpinion) {
									alert("found one second dialog between both.");
								}
							}
							currentDialog = {
								dialog: picked.dpt.dialogId,
								topic: currentTopicStr,
								initiatorOpinion: picked.dpt.initiatorsOpinion,
								recipientOpinion: picked.dpt.recipientsOpinion,
							};
							dpt.getDialogSet(currentDialog.dialog);
						}

					} else if(picked.dpt.context == "topicScene") {

						//console.log("hit topicId: "+picked.dpt.topicId);
						jQuery("#form").remove();
						formVisible = false;

						topicCamState = currentScene.cameras[0].storeState();
						currentTopic = picked.dpt.topicId;
						currentTopicStr = picked.dpt.topic;
						currentScene.dispose();
						currentScene = __opinionScene("opinionScene");
						currentScene.name = "opinionScene";
						dpt.getOpinionByTopic(currentTopic);

					} else if(picked.dpt.context == "opinionScene") {
							
						opinionContext(picked.dpt);
						
					}
				}

				break;
			case BABYLON.PointerEventTypes.POINTERMOVE:
				/*
				for(i in currentScene.meshes) {
					if(pointerInfo.pickInfo.ray.intersectsMesh(currentScene.meshes[i])
					&& 'dpt' in currentScene.meshes[i]) {
						var bla = currentScene.meshes[i];
						console.log('hit');
					}
				}
				*/
				//console.log("POINTER MOVE");
				//if('dpt' in pointerInfo.pickInfo.pickedMesh) {
				//	console.log("POINTER MOVE");
				//}
				break;
			case BABYLON.PointerEventTypes.POINTERWHEEL:
				//console.log("POINTER WHEEL");
				break;
			case BABYLON.PointerEventTypes.POINTERPICK:
				//console.log("POINTER PICK");
				break;
			case BABYLON.PointerEventTypes.POINTERUP:
				//console.log("POINTER UP");
				break;
			case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
				//console.log("POINTER DOUBLE-TAP");
				break;
		}
	});

	currentScene.onKeyboardObservable.add((kbInfo) => {
		idleSince = BABYLON.Tools.Now;
		powerSave = false;
		switch (kbInfo.type) {
			case BABYLON.KeyboardEventTypes.KEYDOWN:
				break;
			case BABYLON.KeyboardEventTypes.KEYUP:
		}
	});

	return currentScene;
}

function startBabylonEngine() {
	engine = new BABYLON.Engine(canvas, true); //, { preserveDrawingBuffer: true, stencil: true });
	//engine.doNotHandleContextLost = true;
	//engine.enableOfflineSupport = false;
	
	// babylon render loop
	engine.runRenderLoop(function() {
		let timeout = BABYLON.Tools.Now - idleSince;
		
		// stop rendering after 3s idle time
		if(timeout > 3000.0) {
			powerSave = true;
		}
	
		// reload scene after 10min idle time
		if(timeout > 600000.0) {
			if(currentScene.name == "topicScene") {
				dpt.getTopic();
			} else if(currentScene.name == "opinionScene" && currentTopic) {
				dpt.getOpinionByTopic(currentTopic);
			}
			powerSave = false;
			idleSince = BABYLON.Tools.Now;
//		} else {
//			jQuery('#debug').text("");
		}
	
		if(currentScene && !powerSave) {
//			jQuery('#debug').text(engine.getFps()+"\n"+(BABYLON.Tools.Now - idleSince));
			currentScene.render();
		}
	
	});
}

