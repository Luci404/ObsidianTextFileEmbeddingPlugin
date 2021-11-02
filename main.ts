import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

const fs = require("fs");
const path = require('path');

// Remember to rename these classes and interfaces!

interface MyPluginSettings { mySetting: string; }
const DEFAULT_SETTINGS: MyPluginSettings = { mySetting: 'default' }

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("textfile", async (src, el, ctx) => {
			// Parse settings and get user specified variables. 
			const jsonSettings = JSON.parse(src);
			var userSpecifiedFilepath = jsonSettings.hasOwnProperty("filepath") ? jsonSettings.filepath : undefined;
			var userSpecifiedLanguage = jsonSettings.hasOwnProperty("language") ? jsonSettings.language : undefined;
			
			// Get the content from the file at the specified path.
			const activeVaultPath = this.app.workspace.getActiveFile().vault.adapter.basePath;
			const activeFilePath = this.app.workspace.getActiveFile().path;
			const resolvedPath = path.join(activeVaultPath, path.dirname(activeFilePath), userSpecifiedFilepath);
			var content = "";
			if (fs.lstatSync(resolvedPath).isFile()) { content = fs.readFileSync(resolvedPath, {encoding:'utf8', flag:'r'}); }
			else { content += `Failed to find file at path: ${userSpecifiedFilepath}`; }

			// If the user has specified a language, use the specified language else use the file extension.
			var language = userSpecifiedLanguage != undefined ? userSpecifiedLanguage : path.extname(resolvedPath).substring(1);
			
			// Create header.
			el.createEl("b").setText(`${path.basename(userSpecifiedFilepath)}`);
			
			// Create the code block (refer to prism.js docs).
			const pre = el.createEl("pre");
			const code = pre.createEl("code")
			code.addClass(`language-${language}`);
			code.setText(content);

			console.log(`filepath: ${resolvedPath}, language: ${language}, content: ${content}`);
		})
	}

	onunload() { }
	async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
	async saveSettings() { await this.saveData(this.settings); }
}