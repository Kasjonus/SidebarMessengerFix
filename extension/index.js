var darkSkinLoaded = false;

function loadCSS(file) {
	var link = document.createElement("link");
	link.href = chrome.extension.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function unloadCSS(file) {
	var cssNode = document.getElementById(file);
	cssNode && cssNode.parentNode.removeChild(cssNode);
}

function checkTheme(lightTheme) {
	if (!lightTheme && !darkSkinLoaded) {
		loadCSS("css/DarkSkin");
		darkSkinLoaded = true;
	} else if (lightTheme && darkSkinLoaded) {
		unloadCSS("css/DarkSkin");
		darkSkinLoaded = false;
	}
}

loadCSS("css/DefaultFix");
checkTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
	checkTheme(event.matches);
});
