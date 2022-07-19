document.addEventListener("readystatechange", () => {

	if (document.readyState === "interactive") {
		var checkExist = setInterval(function () {
            const elementGX = document.querySelector(".gx");
			if (elementGX && elementGX.style.cssText.length > 0) {

                chrome.runtime.sendMessage({ mode: "saveGXTheme", theme: elementGX.style.cssText });

				clearInterval(checkExist);
			}
		}, 100);
	}
});