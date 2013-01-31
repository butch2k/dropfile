// dropfile.js | Andrew Dodson (drew81.com), Jonathan Neal (jonathantneal.com) | MIT licensed
!this.File && (function (global, location) {
	var
	// Event cross-browser syntax
	hasListener = "addEventListener" in global,
	addEventListener = hasListener ? "addEventListener" : "attachEvent",
	on = hasListener ? "" : "on",

	// DOM Objects
	document = global.document,
	documentElement = document.documentElement,
	object = document.createElement("x-object"),

	// MIME types for most files
	mimes = {
		"audio/mp4": "m4a f4a f4b",
		"audio/ogg": "oga ogg",
		"audio/$&": "mid midi mp3 wav",
		"application/javascript": "js jsonp",
		"application/json": "json",
		"application/msword": "doc dot",
		"application/octet-stream": "bin",
		"application/postscript": "ai",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
		"application/vnd.ms-excel": "xla xls xlt",
		"application/vnd.ms-fontobject": "eot",
		"application/vnd.ms-powerpoint": "pot ppa pps ppt",
		"application/x-shockwave-flash": "swf",
		"application/xml": "atom rdf rss xml",
		"application/$&": "pdf rtf zip",
		"font/opentype": "otf",
		"font/$&": "ttf ttc woff",
		"image/jpeg": "jpe jpeg jpg",
		"image/svg+xml": "svg svgz",
		"image/vnd.adobe.photoshop": "psd",
		"image/vnd.microsoft.icon": "ico",
		"image/$&": "bmp ief gif png tif tiff webp",
		"text/cache-manifest": "appcache manifest",
		"text/plain": "txt",
		"text/x-component": "htc",
		"text/x-vcard": "vcf",
		"text/$&": "css html php vtt",
		"text/x-$&": "markdown md",
		"video/mp4": "mp4 m4v f4v f4p",
		"video/ogg": "ogv",
		"video/quicktime": "mov qt",
		"video/$&": "avi mpg vdo viv vivo webm",
		"video/x-$&": "flv"
	};

	/* DataTransfer (http://www.w3.org/html/wg/drafts/html/master/editing.html#the-datatransfer-interface) {
		types: Array,
		files: FileList
	} */

	function DataTransfer(files) {
		this.files = new FileList(files);
		this.types = new Array("Files");
	}

	/* FileList (http://www.w3.org/TR/FileAPI/#dfn-filelist) {
		[0..]: File,
		index: Function,
		length: Number
	} */

	function FileList(files) {
		for (var length = this.length = files.length, index = 0; index < length; ++index) {
			this[index] = new File(files[index].split(","));
		}
	}

	FileList.prototype.item = function(index) {
		return this[index];
	};

	/* File (http://www.w3.org/TR/FileAPI/#dfn-file) {
		name: String,
		lastModifiedDate: Date,
		size: Number,
		type: String
	} */

	function File(array) {
		var size = array[1].length;

		this.lastModifiedDate = new Date;
		this.name = array[0];
		this.type = mime(array[0]);
		this.size = (size * 0.75) - (size % 3);
		this.blob = array[1];
	}

	/* FileReader (http://www.w3.org/TR/FileAPI/#dfn-filereader) {
		readAsArrayBuffer: Function
		readAsDataURL: Function
		readAsText: Function
		readyState: Number
	} */

	function FileReader() {
		this.onload = this.result = null;
		this.readyState = 0;
	}

	FileReader.prototype.readAsArrayBuffer = function (file) {
		throw("FileReader.readAsArrayBuffer is unimplemented");
	};

	FileReader.prototype.readAsDataURL = function (file) {
		this.result = "data:" + file.type + ";base64," + file.blob;
		this.readyState = 2;

		var event = hasListener ? document.createEvent("CustomEvent") : document.createEventObject();
		event.type = "load";
		event.target = this;

		this.onload && this.onload.call(this, event);
	};

	FileReader.prototype.readAsText = function (file) {
		this.result = atob(file.blob);
		this.readyState = 2;

		var event = hasListener ? document.createEvent("CustomEvent") : document.createEventObject();
		event.type = "load";
		event.target = this;

		this.onload && this.onload.call(this, event);
	};

	/* Drag Event (dragover, dragleave) */
	function onDrag(event) {
		event.preventDefault && event.preventDefault() || (event.returnValue = false);

		onDrag.x = event.clientX;
		onDrag.y = event.clientY;

		if (!event.dataTransfer.getData("Text")) {
			object.style.display = "block";

			object.style.left = event.clientX + documentElement.scrollLeft + "px";
			object.style.top = event.clientY + documentElement.scrollTop + "px";

			onDrop.active = true;
		} else {
			onDrop.active = false;
		}
	}

	/* Drop Event (file1nameblob, file2nameblob, etc..) */
	function onDrop() {
		object.style.display = "none";

		var
		element = document.elementFromPoint(onDrag.x, onDrag.y),
		event = hasListener ? document.createEvent("MouseEvent") : document.createEventObject();

		event.MsDataTransfer = new DataTransfer(arguments);

		hasListener && event.initMouseEvent("drop", true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

		hasListener ? element.dispatchEvent(event) : element.fireEvent("ondrop", event);

		onDrop.active = false;
	}

	/* MIME type by file name */
	function mime(filename) {
		var fileext = filename.match(/[^\.]*$/)[0], ext;

		for (ext in mimes) {
			if (new RegExp("(" + mimes[ext].replace(/ /g, "|") + ")").test(fileext)) {
				return fileext.replace(/.+/, ext);
			}
		}

		return "";
	}

	// create silverlight object
	object.innerHTML = "<object type=application/x-silverlight><param name=source value='"+location+"'><param name=background value=#000>";
	object = object.firstChild;

	// style silverlight object
	object.style.cssText = "display:block;height:1px;left:0;*margin:-2px;position:absolute;width:1px;top:0;z-index:9999999";

	// append silverlight object
	setTimeout(function () {
		document.body && document.body.appendChild(object) || setTimeout(arguments.callee);
	});

	// add drag events
	documentElement[addEventListener](on+"dragover",  onDrag);
	documentElement[addEventListener](on+"dragleave", onDrag);

	// add silverlight drop event
	global.dropfile = onDrop;

	// add polyfill constructors
	global.File = File;
	global.FileList = FileList;
	global.FileReader = FileReader;
})(this, "dropfile.xap");

// base64.js | David Lindquist (http://www.webtoolkit.info/javascript-base64.html), Andrew Dodson (drew81.com) | MIT licensed
!this.atob && (function (global) {
	"use strict";

	var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", keysRe = new RegExp("[^" + keys + "]");

	global.atob = function (input) {
		var output = [], buffer, bufferB, chrs, index = 0, indexB, length = input.length;

		if ((length % 4 > 0) || (keysRe.test(input)) || (/=/.test(input) && (/=[^=]/.test(input) || /={3}/.test(input)))) {
			throw new Error("Invalid base64 data");
		}

		while (index < length) {
			for (bufferB = [], indexB = index; index < indexB + 4;) {
				bufferB.push(keys.indexOf(input.charAt(index++)));
			}

			buffer = (bufferB[0] << 18) + (bufferB[1] << 12) + ((bufferB[2] & 63) << 6) + (bufferB[3] & 63);

			chrs = [(buffer & (255 << 16)) >> 16, bufferB[2] == 64 ? -1 : (buffer & (255 << 8)) >> 8, bufferB[3] == 64 ? -1 : buffer & 255];

			for (indexB = 0; indexB < 3; ++indexB) {
				if (chrs[indexB] >= 0 || indexB === 0) {
					output.push(String.fromCharCode(chrs[indexB]));
				}
			}
		}

		return output.join("");
	};

	global.btoa = function (input) {
		var output = [], buffer, chrs, index = 0, length = input.length;

		while (index < length) {
			chrs = [input.charCodeAt(index++), input.charCodeAt(index++), input.charCodeAt(index++)];

			buffer = (chrs[0] << 16) + ((chrs[1] || 0) << 8) + (chrs[2] || 0);

			output.push(
				keys.charAt((buffer & (63 << 18)) >> 18),
				keys.charAt((buffer & (63 << 12)) >> 12),
				keys.charAt(isNaN(chrs[1]) ? 64 : (buffer & (63 << 6)) >> 6),
				keys.charAt(isNaN(chrs[2]) ? 64 : (buffer & 63))
			);
		}

		return output.join("");
	};
})(this);