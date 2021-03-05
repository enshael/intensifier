var canvasId = 'bitmap';

var constants = {
	MAX_HEIGHT : 250
}

var settings = {
	numFrames : 25,
	numSplices: 128,
	label : 'TURN DOWN FOR WHAT',
	delay : 20,
	frameOffset: 10
}

window.onload = function() {

	var canvas = document.getElementById(canvasId);
	var ctx = canvas.getContext('2d');
	var gif, image, generateInt;
	var frames = settings.numFrames;

	ctx.fillStyle = '#FFF';
	ctx.fillRect(0,0,canvas.width, canvas.height);

	var createImage = function(url) {

		gif = new GIFEncoder();
		gif.setRepeat(0);
		gif.setDelay(settings.delay);

		image = new Image();

		image.onload = function() {
		
			$('#upload').show();

			canvas.width = image.width;
			canvas.height = image.height;

			createFrames();
		}
		image.src = url;
	}

	var sineFunction = function(time) {
		var amplitude = 20;

		// in ms
		var period = settings.numFrames*settings.frameOffset;

		var centerX = 0;
		var nextX = amplitude * Math.sin(time * 2 * Math.PI / period) + centerX;
		return nextX;
	}

	var createFrames = function() {

		gif.start();
		gif.setSize(canvas.width, canvas.height);

		var spliceHeight = Math.ceil(canvas.height / settings.numSplices);

		for(var i = 0; i < settings.numFrames; i++) {
				
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for(var j = 0; j <= settings.numSplices; j++) {
				var shift = {
					x : sineFunction((i*settings.frameOffset)+j),
					y : j*spliceHeight
				}

				ctx.drawImage(image, 0, shift.y, canvas.width, spliceHeight, shift.x, shift.y, canvas.width, spliceHeight);
			}



			// ctx.fillStyle = "#FFF";
			// ctx.font = "bold 22px Arial";
			// ctx.strokeStyle = 'black';
			// ctx.lineWidth = 8;
			// ctx.lineJoin = "round";
			// ctx.strokeText(settings.label, 20, canvas.height - 20);
			// ctx.fillStyle = 'white';
			// ctx.fillText(settings.label, 20, canvas.height - 20);

			var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			gif.addFrame(imageData.data, true);
		}

			gif.finish();

			var binary_gif = gif.stream().getData(); //notice this is different from the as3gif package!
	  		var data_url = 'data:image/gif;base64,' + encode64(binary_gif);

	  		document.getElementById('image').src = data_url;
	}

	// Hard coded image for now
	createImage('https://raw.githubusercontent.com/enshael/intensifier/master/images/jarder02.png');

	function handleDragOver(e) {
		e.stopPropagation();
    	e.preventDefault();
    	e.dataTransfer.dropEffect = 'copy';    	
	}

	function handleFileSelect(e) {
		
		e.stopPropagation();
    	e.preventDefault();

    	var files = e.dataTransfer.files;

		var output = [];
		for (var i = 0, f; f = files[i]; i++) {

			var reader = new FileReader();

			reader.onload = (function(theFile) {
				return function(e) {
					createImage(e.target.result);
				}
			})(f);
			reader.readAsDataURL(f);
		}
	}

	var dropZone = document.getElementById('dropbox');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
}

$(function() {

    var $post = $('#upload');
    var $img = $('#image');

    $post.click(function(e) {
    	
    	e.preventDefault();
		e.stopPropagation();

    	$.ajax({
			url: 'https://api.imgur.com/3/image',
			type: 'POST',
			headers: {
				Authorization: 'CLIENT-ID e781a07d0760a0a'
			},
			data: {
				type: 'base64',
				image: $img.attr('src').split(',')[1]
			},
			dataType: 'json'
		}).success(function(result) {
			window.location = 'https://imgur.com/gallery/' + result.data.id;
		}).error(function() {
			alert('Could not reach api.imgur.com. Sorry :(');
		});
    });
});