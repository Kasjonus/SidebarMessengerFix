var port = chrome.runtime.connect({ name: "themeLoader" });
port.onMessage.addListener(function (message, sender) {
	console.log(message, sender);
	if (message.mode === "loadGXTheme") {
		document.documentElement.style = message.gx;
		message.isDarkTheme ? loadCSS("css/DarkGXSkin") : unloadCSS("css/DarkGXSkin");
	} else if (message.mode === "loadTheme") {
		message.isDarkTheme ? loadCSS("css/DarkSkin") : unloadCSS("css/DarkSkin");
	}
});

document.addEventListener("readystatechange", () => {
	if (document.readyState === "interactive") {
		document.body.style.backgroundColor = "#242526";
		loadCSS("css/DefaultFix");

		chrome.runtime.sendMessage({ mode: "getTheme" }, (response) => {
			console.log(response);
			if (response.gx !== "") {
				loadCSS("css/GXSkin");
				document.documentElement.style = response.gx;
				response.isDarkTheme && loadCSS("css/DarkGXSkin");
			} else {
				response.isDarkTheme && loadCSS("css/DarkSkin");
			}
		});

		let blockHidePanel = false;

		var checkExist = setInterval(function () {
			if (!document.querySelector(`input[dir="ltr"]`)) return;

			document.querySelector(`input[dir="ltr"]`).addEventListener("focus", () => {
				document.querySelector(`div[role="navigation"]`).classList.add("fullWidth");
				blockHidePanel = true;
			});

			document.querySelector(`input[dir="ltr"]`).addEventListener("blur", () => {
				document.querySelector(`div[role="navigation"]`).classList.remove("fullWidth");
				blockHidePanel = false;
			});

			clearInterval(checkExist);
		}, 100);

		let leftPanelState = 1;
		document.addEventListener("mousemove", (e) => {
			const navElement = document.querySelector(`div[role="navigation"]`);
			if (e.clientX < 10 && leftPanelState === 0) {
				navElement.classList.remove("zeroWidth");
				leftPanelState = 1;
			} else if (!blockHidePanel && window.innerWidth < 900 && e.clientX > navElement.clientWidth && leftPanelState === 1) {
				navElement.classList.add("zeroWidth");
				leftPanelState = 0;
			}
		});
	}
});

function loadCSS(file) {
	if (document.querySelectorAll(`link[id="${file}"]`).length > 0) return;
	var link = document.createElement("link");
	link.href = chrome.extension.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function unloadCSS(file) {
	var cssNode = document.querySelectorAll(`link[id="${file}"]`);
	cssNode.forEach((elm) => elm.parentNode.removeChild(elm));
}
