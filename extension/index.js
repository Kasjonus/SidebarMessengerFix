document.addEventListener("readystatechange", () => {
	if (document.readyState === "interactive") {
		document.body.style.backgroundColor = "#242526";
		loadCSS("css/DefaultFix");

		chrome.runtime.sendMessage({ mode: "getTheme" }, (response) => {
			if (response.theme === "dark") {
				if (response.gx !== null) {
					loadCSS("css/GXSkin");
					document.documentElement.style = response.gx;
				} else {
					loadCSS("css/DarkSkin");
				}
			}
		});

		var checkExist = setInterval(function () {
			if (document.querySelectorAll(".hybvsw6c > .rj1gh0hx").length) {
				document.querySelector(".hybvsw6c > .rj1gh0hx").classList.add("switchTheme");
				document.querySelector(".switchTheme").innerHTML = `
				<i
					data-visualcompletion="css-img"
					class="hu5pjgll lzf7d6o1"
					style="
						background-image: url('https://static.xx.fbcdn.net/rsrc.php/v3/yT/r/Q8CfqKxqizP.png');
						background-position: 0px -335px;
						background-size: auto;
						width: 20px;
						height: 20px;
						background-repeat: no-repeat;
						display: inline-block;
						margin: auto;
					"
				></i>
				`;
				document.querySelector(".switchTheme").addEventListener("click", () => {
					switchTheme();
				});
				clearInterval(checkExist);
			}
		}, 100);

		let leftPanelState = 1;
		document.addEventListener("mousemove", (e) => {
			if (e.clientX < 10 && leftPanelState === 0) {
				document.querySelector(`div[role="navigation"]`).classList.remove("zeroWidth");
				leftPanelState = 1;
			} else if (window.innerWidth < 900 && e.clientX > 122 && leftPanelState === 1) {
				document.querySelector(`div[role="navigation"]`).classList.add("zeroWidth");
				leftPanelState = 0;
			}
		});
	}
});

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

function switchTheme() {
	chrome.runtime.sendMessage({ mode: "getTheme" }, (response) => {
		if (response.theme === "dark") {
			unloadCSS(response.gx !== null ? "css/GXSkin" : "css/DarkSkin");
		} else {
			if (response.gx !== null) {
				loadCSS("css/GXSkin");
				document.documentElement.style = response.gx;
			} else {
				loadCSS("css/DarkSkin");
			}
		}

		chrome.runtime.sendMessage({ mode: "saveTheme", theme: response.theme === "dark" ? "light" : "dark" });
	});
}
