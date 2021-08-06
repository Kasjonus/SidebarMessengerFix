document.querySelectorAll("audio").forEach((audio, index) => {
	console.log(index, audio.preload, audio.volume);
	if (audio.preload === "auto") {
		audio.volume = 0.2;
	} else {
		audio.volume = 0.05;
	}
	console.log(index, audio.preload, audio.volume);
});

// TODO - Missing event for update audio tags
document
	.querySelector("div.buofh1pr.j83agx80.eg9m0zos.ni8dbmo4.cbu4d94t.gok29vw1 > div:not(.rj1gh0hx) > div")
	.addEventListener("DOMNodeInserted", (e) => {
		e.relatedNode.getAttribute("role") === "row" && console.log("New message");
	});
