let port = null;

chrome.runtime.onConnect.addListener((_port) => {
	port = _port;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	const sendAndLog = (data) => {
		sendResponse(data);
		console.log(message.mode, data);
	};

	switch (message.mode) {
		case "getTheme":
			try {
				chrome.storage.local.set({ ["style"]: "test zapisu" });
				const localStyles = null; //await chrome.storage.local.get("style");

				sendAndLog({ result: 200, localStyles: localStyles });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}
			break;
		case "saveTheme":
			try {
				localStorage.setItem("theme", message.theme);
				sendAndLog({ result: 200, theme: message.theme });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}

				sendAndLog({ result: 200, isDarkTheme, gx: window?.opr?.palette ? variables : localStorage.getItem("style") });
			} catch (error) {
				sendAndLog({ result: 500, error: error });
			}
			break;

		default:
			sendAndLog({ result: 400, error: "invalid function" });
			break;
	}
});
