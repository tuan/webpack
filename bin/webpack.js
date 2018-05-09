#!/usr/bin/env node
function runCommand(command, options) {
	const cp = require("child_process");
	return new Promise((resolve, reject) => {
		const executedCommand = cp.spawn(command, options, {
			stdio: "inherit",
			shell: true
		});

		executedCommand.on("error", error => {
			reject(error);
		});

		executedCommand.on("exit", code => {
			if (code === 0) {
				resolve(true);
			} else {
				reject();
			}
		});
	});
}

let webpackCliInstalled = false;
try {
	require.resolve("webpack-cli");
	webpackCliInstalled = true;
} catch (err) {
	webpackCliInstalled = false;
}

let webpackCommandInstalled = false;
try {
	require.resolve("webpack-command");
	webpackCommandInstalled = true;
} catch (err) {
	webpackCommandInstalled = false;
}

if (!webpackCliInstalled) {
	const path = require("path");
	const fs = require("fs");
	const readLine = require("readline");

	console.error(
		"The CLI for webpack must be installed as a separate package, for which there are two choices:\n" +
			"    webpack-cli (https://github.com/webpack/webpack-cli) : The original webpack CLI from webpack@3.\n" +
			"    webpack-command (https://github.com/webpack-contrib/webpack-command) : A lightweight, opinionated webpack CLI."
	);

	const isYarn = fs.existsSync(path.resolve(process.cwd(), "yarn.lock"));

	const packageManager = isYarn ? "yarn" : "npm";
	const webpackCLIOptions = ["install", "-D", "webpack-cli"];
	const webpackCommandOptions = ["install", "-D", "webpack-command"];

	if (isYarn) {
		webpackCLIOptions[0] = "add";
		webpackCommandOptions[0] = "add";
	}

	const webpackCLIInstallCommand = `${packageManager} ${webpackCLIOptions.join(
		" "
	)}`;
	const webpackCommandInstallCommand = `${packageManager} ${webpackCommandOptions.join(
		" "
	)}`;

	const question = `Would you like to install webpack-cli or webpack-command? (That will run '${webpackCLIInstallCommand}' or '${webpackCommandInstallCommand}') (webpack-cli/webpack-command): `;

	const questionInterface = readLine.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	questionInterface.question(question, answer => {
		questionInterface.close();

		switch (answer.toLowerCase()) {
			case "webpack-cli": {
				console.error(
					`Installing 'webpack-cli' (running '${webpackCLIInstallCommand}')...`
				);

				runCommand(packageManager, webpackCLIOptions)
					.then(result => {
						return require("webpack-cli"); //eslint-disable-line
					})
					.catch(error => {
						console.error(error);
						process.exitCode = 1;
					});
				break;
			}
			case "webpack-command": {
				console.error(
					`Installing 'webpack-command' (running '${webpackCommandInstallCommand}')...`
				);

				runCommand(packageManager, webpackCommandOptions)
					.then(result => {
						return require("webpack-command"); //eslint-disable-line
					})
					.catch(error => {
						console.error(error);
						process.exitCode = 1;
					});
				break;
			}
			default: {
				console.error(
					"It needs to be installed alongside webpack to use the CLI"
				);
				process.exitCode = 1;
				break;
			}
		}
	});
} else {
	if (webpackCliInstalled) {
		require("webpack-cli"); // eslint-disable-line
	}

	if (webpackCommandInstalled) {
		require("webpack-command"); // eslint-disable-line
	}
}
