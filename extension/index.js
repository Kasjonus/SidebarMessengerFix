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

		var checkAdExist = setInterval(function () {
			const container = document.querySelector(`div[id=":ri:"]`);

			if (!container) return;

			const adParentChildren = container.parentElement.children;
			adParentChildren[adParentChildren.length - 1].style.display = "none";

			clearInterval(checkAdExist);
		}, 100);

		chrome.runtime.sendMessage({ mode: "getTheme" }, async (response) => {
			console.log(response);

			let variables;

			const Browser = {
				OPERA: "Opera",
				OPERA_GX: "Opera GX",
				OTHER: "other",
			};

			const getProduct = async () => {
				if (navigator.userAgentData.brands.filter((b) => b.brand === Browser.OPERA_GX).length === 1) return Browser.OPERA_GX;
				if (navigator.userAgentData.brands.filter((b) => b.brand === Browser.OPERA).length === 1) return Browser.OPERA;
				return Browser.OTHER;
			};

			const isGx = async () => {
				return (await getProduct()) === Browser.OPERA_GX;
			};

			let isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

			const getGxColors = async () => {
				isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
				console.log("zMIANA");

				if (await isGx()) {
					variables = "";

					const setVariable = (name, value) => (variables += `--gx-${name}:${value};`);
					const getColor = (name, opacity = 1) =>
						new Promise((resolve) => {
							opr.palette.getColorHSL(name, (clr) => {
								const s = Math.floor(clr.s * 100);
								const l = Math.floor(clr.l * 100);
								resolve(`hsla(${clr.h}, ${s}%, ${l}%, ${clr.alpha * opacity})`);
							});
						});
					const isDarkFont = await new Promise((resolve) => {
						opr.palette.getColor("gx_accent", (clr) => {
							// http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
							const getLuminance = () => {
								const rgb = [clr.r, clr.g, clr.b].map((c) => {
									let cs = c / 255;
									return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
								});
								return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
							};
							resolve(getLuminance() > 0.45);
						});
					});

					const accentColor = await getColor("gx_accent");
					setVariable("accent-color", accentColor);
					const highlightColor = await getColor("gx_accent", 0.5);
					setVariable("highlight-color", highlightColor);
					setVariable("primary-button-font-color", isDarkFont ? "black" : "white");

					const primaryFontColor = await getColor(isDarkTheme ? "gx_no_100" : "gx_no_00");
					setVariable("primary-font-color", primaryFontColor);
					const secondaryFontColor = await getColor(isDarkTheme ? "gx_no_77" : "gx_no_24");
					setVariable("secondary-font-color", secondaryFontColor);

					setVariable("primary-button-color", accentColor);
					const disabledButtonBackgroundColor = await getColor(isDarkTheme ? "gx_no_16" : "gx_no_88", 0.5);
					setVariable("primary-button-disabled-color", disabledButtonBackgroundColor);
					setVariable("primary-button-hover-color", accentColor);
					setVariable("primary-button-focus-color", accentColor);

					const secondaryButtonColor = await getColor(isDarkTheme ? "gx_no_12" : "gx_no_98");
					setVariable("secondary-button-color", secondaryButtonColor);
					const secondaryButtonActionColor = await getColor(isDarkTheme ? "gx_no_08" : "gx_no_92");
					setVariable("secondary-button-hover-color", secondaryButtonActionColor);
					setVariable("secondary-button-focus-color", secondaryButtonActionColor);

					const primaryBackgroundColor = await getColor(isDarkTheme ? "gx_no_08" : "gx_no_96");
					setVariable("primary-background-color", primaryBackgroundColor);
					const secondaryBackgroundColor = await getColor(isDarkTheme ? "gx_no_12" : "gx_no_98");
					setVariable("secondary-background-color", secondaryBackgroundColor);

					const inputBackgroundColor = await getColor(isDarkTheme ? "gx_no_16" : "gx_no_88");
					setVariable("input-background-color", inputBackgroundColor);
					const inputBorderColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("input-border-color", inputBorderColor);

					const buttonBackgroundColor = await getColor(isDarkTheme ? "gx_no_20" : "gx_no_90");
					setVariable("button-background-color", buttonBackgroundColor);
					const buttonBackgroundHoverColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("button-background-hover-color", buttonBackgroundHoverColor);
					const buttonBackgroundFocusColor = await getColor(isDarkTheme ? "gx_no_59" : "gx_no_40");
					setVariable("button-background-focus-color", buttonBackgroundFocusColor);

					const separatorColor = await getColor(isDarkTheme ? "gx_no_32" : "gx_no_80");
					setVariable("separator-color", separatorColor);

					// port && port.postMessage({ mode: "loadGXTheme", gx: variables, isDarkTheme });
					document.documentElement.style = variables;
					loadCSS("css/GXSkin");
					isDarkTheme ? loadCSS("css/DarkGXSkin") : unloadCSS("css/DarkGXSkin");
				} else {
					// let isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
					// port && port.postMessage({ mode: "loadTheme", isDarkTheme });
				}

				// TODO: Jest problem z dynamicznym odświeżaniem po stronie jasnej
				// Zmienia kolor dopiero po wykonaniu jakiegoś eventu
				// Można by jakiś wywołać, żeby było git?
			};

			await getGxColors();

			if (window?.opr?.palette && !opr?.palette?.onPaletteChanged?.hasListener(getGxColors)) {
				getGxColors();
				console.log("Z GX");
				opr.palette.onPaletteChanged.addListener(getGxColors);
			}

			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
				console.log("Z prefers-color-scheme");

				getGxColors();
			});

			loadCSS("css/GXSkin");
			document.documentElement.style = variables;
			isDarkTheme && loadCSS("css/DarkGXSkin");

			// if (response.gx !== "") {
			// 	loadCSS("css/GXSkin");
			// 	document.documentElement.style = response.gx;
			// 	response.isDarkTheme && loadCSS("css/DarkGXSkin");
			// } else {
			// 	response.isDarkTheme && loadCSS("css/DarkSkin");
			// }
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
	link.href = chrome.runtime.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

function unloadCSS(file) {
	var cssNode = document.querySelectorAll(`link[id="${file}"]`);
	cssNode.forEach((elm) => elm.parentNode.removeChild(elm));
}
