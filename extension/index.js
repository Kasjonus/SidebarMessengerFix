/* CSS loader - functions */

const loadCSS = (file) => {
	if (document.querySelectorAll(`link[id="${file}"]`).length > 0) return;
	var link = document.createElement("link");
	link.href = chrome.runtime.getURL(file + ".css");
	link.id = file;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
};

const unloadCSS = (file) => {
	var cssNode = document.querySelectorAll(`link[id="${file}"]`);
	cssNode.forEach((elm) => elm.parentNode.removeChild(elm));
};

/* --- --- --- */

/* Opera GX Functions */

class ThemeController {
	constructor() {
		this.lastDarkModeState = this.#checkPrefersColors();
	}

	#checkPrefersColors = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

	#Theme = {
		DARK: "DARK",
		LIGHT: "LIGHT",
	};

	#Browser = {
		OPERA: "Opera",
		OPERA_GX: "Opera GX",
		OTHER: "other",
	};

	#getProduct = async () => {
		if (navigator.userAgentData.brands.filter((b) => b.brand === this.#Browser.OPERA_GX).length === 1) return this.#Browser.OPERA_GX;
		if (navigator.userAgentData.brands.filter((b) => b.brand === this.#Browser.OPERA).length === 1) return this.#Browser.OPERA;
		return this.#Browser.OTHER;
	};

	#isGx = async () => {
		return (await this.#getProduct()) === this.#Browser.OPERA_GX;
	};

	#getGxColors = async () => {
		const isDarkTheme = this.#checkPrefersColors();

		let variables = "";

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

		return variables;
	};

	#gxLoader = async (isDarkTheme) => {
		document.documentElement.style = await this.#getGxColors();

		loadCSS("css/GXSkin");

		isDarkTheme ? loadCSS("css/DarkGXSkin") : unloadCSS("css/DarkGXSkin");
		this.lastDarkModeState = isDarkTheme;
	};

	checkBrowserAndLoadSkin = async () => {
		const isDarkTheme = this.#checkPrefersColors();

		const isGxCheck = await this.#isGx();

		if (!isGxCheck) {
			isDarkTheme ? loadCSS("css/DarkSkin") : unloadCSS("css/DarkSkin");
			this.lastDarkModeState = isDarkTheme;
			return;
		}

		await this.#gxLoader(isDarkTheme);
	};

	#gxListener = async () => {
		const isDarkTheme = this.#checkPrefersColors();
		this.#gxLoader(isDarkTheme);
	};

	loadListeners = () => {
		if (window?.opr?.palette && !opr?.palette?.onPaletteChanged?.hasListener(this.#gxListener)) {
			opr.palette.onPaletteChanged.addListener(this.#gxListener);
		}

		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
			this.checkBrowserAndLoadSkin();
		});
	};
}

/* --- --- --- */

class FixController {
	constructor() {
		this.blockHidePanel = false;
	}

	hideAd = () => {
		var checkAdExist = setInterval(function () {
			const container = document.querySelector(`div[id=":ri:"]`);

			if (!container) return;

			const adParentChildren = container.parentElement.children;
			adParentChildren[adParentChildren.length - 1].style.display = `none`;

			clearInterval(checkAdExist);
		}, 100);
	};

	messageInputFix = () => {
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
	};

	movePanel = () => {
		let blockHidePanel = false;
		let leftPanelState = 1;

		document.addEventListener("mousemove", (e) => {
			const navElements = document.querySelectorAll(`div[role="navigation"]`);

			let navigationWidth = 0;
			for (const navElement of navElements) {
				navigationWidth += navElement.clientWidth;
			}

			if (e.clientX < 10 && leftPanelState === 0) {
				for (const navElement of navElements) {
					navElement.classList.remove("zeroWidth");
				}
				leftPanelState = 1;
			} else if (!blockHidePanel && window.innerWidth < 900 && e.clientX > navigationWidth && leftPanelState === 1) {
				for (const navElement of navElements) {
					navElement.classList.add("zeroWidth");
				}
				leftPanelState = 0;
			}
		});
	};

	loadAll = () => {
		this.hideAd();
		this.messageInputFix();
		this.movePanel();
	};
}

document.addEventListener("readystatechange", () => {
	if (document.readyState === "interactive") {
		document.body.style.backgroundColor = "#242526";
		loadCSS("css/DefaultFix");

		chrome.runtime.sendMessage({ mode: "getTheme" }, async (response) => {
			if (response.status.connection) {
				const themeController = new ThemeController();

				await themeController.checkBrowserAndLoadSkin();

				themeController.loadListeners();
			} else {
				if (window.confirm("Fix for sidebar Facebook Messenger™ Error\nIf you want to report your problem to developer, click OK")) {
					window.open("https://github.com/Kasjonus/SidebarMessengerFix/issues", "_blank");
				}
			}
		});

		const fixController = new FixController();
		fixController.loadAll();
	}
});
