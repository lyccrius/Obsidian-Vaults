/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DefaultQuery
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  defaultState: {
    searchQuery: {
      query: "-path:Diary"
    },
    sortOrder: "alphabetical" /* alphabetical */,
    collapseAll: false,
    extraContext: false,
    unlinkedCollapsed: false
  },
  rememberSettings: {
    dbFileName: "",
    saveTimer: 1e3,
    checkTimer: 1e3,
    // delayAfterFileOpening: 1000,
    rememberBacklinkNav: false
  }
};
var DefaultQuery = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.loadingFile = false;
  }
  setSortOrder(t) {
    var _a;
    const backlinks = (_a = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView)) == null ? void 0 : _a.leaf.view.backlinks;
    if (backlinks.backlinkDom.sortOrder === t) {
      return;
    }
    const backlinkDom = backlinks.backlinkDom;
    const unlinkedDom = backlinks.unlinkedDom;
    backlinkDom.sortOrder = t;
    unlinkedDom.sortOrder = t;
    backlinkDom.changed();
    unlinkedDom.changed();
    this.app.workspace.requestSaveLayout();
  }
  setQuery(query, useEphemeralState) {
    const activeLeaf = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (activeLeaf === null) {
      return;
    }
    const backlinks = activeLeaf.leaf.view.backlinks;
    const searchInputContainer = document.querySelector(".workspace-leaf.mod-active .search-input-container");
    if (searchInputContainer === null) {
      return;
    }
    let style = searchInputContainer.getAttribute("style");
    style = style.replace(/display:\s?none;?/g, "");
    searchInputContainer.setAttribute("style", style);
    const input = searchInputContainer.querySelector("input");
    if (input === null) {
      return;
    }
    if (useEphemeralState) {
      if (input.value == query) {
        return;
      }
    } else {
      if (input.value && input.value != this.lastDefaultQuery[0]) {
        return;
      }
    }
    input.value = query;
    this.resetLastDefaultQuery();
    const eventBlankInput = new InputEvent("input", {
      "bubbles": true,
      "cancelable": true
    });
    input.dispatchEvent(eventBlankInput);
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new DefaultQuerySettingTab(this.app, this));
    this.resetLastDefaultQuery();
    try {
      this.db = await this.readDb();
      this.lastSavedDb = await this.readDb();
    } catch (e) {
      console.error(
        "Default Backlink plugin can't read database: " + e
      );
      this.db = {};
      this.lastSavedDb = {};
    }
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      if (file === null) {
        return;
      }
      let st = this.settings.defaultState;
      setTimeout(() => {
        this.restoreEphemeralState(st);
      }, 100);
    }));
    this.registerEvent(
      this.app.workspace.on("quit", () => {
        this.writeDb(this.db);
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => this.renameFile(file, oldPath))
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => this.deleteFile(file))
    );
    this.registerInterval(
      window.setInterval(() => this.checkEphemeralStateChanged(), this.settings.rememberSettings.checkTimer)
    );
    this.registerInterval(
      window.setInterval(() => this.writeDb(this.db), this.settings.rememberSettings.saveTimer)
    );
    this.restoreEphemeralState();
  }
  renameFile(file, oldPath) {
    let newName = file.path;
    let oldName = oldPath;
    this.db[newName] = this.db[oldName];
    delete this.db[oldName];
  }
  deleteFile(file) {
    let fileName = file.path;
    delete this.db[fileName];
  }
  checkEphemeralStateChanged() {
    var _a;
    let fileName = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path;
    if (!fileName || !this.lastLoadedFileName || fileName != this.lastLoadedFileName || this.loadingFile)
      return;
    let st = this.getEphemeralState();
    if (st == null) {
      return;
    }
    if (!this.lastEphemeralState)
      this.lastEphemeralState = st;
    if (!this.isEphemeralStatesEquals(st, this.lastEphemeralState)) {
      this.saveEphemeralState(st);
      this.lastEphemeralState = st;
    }
  }
  isEphemeralStatesEquals(state1, state2) {
    return state1.searchQuery && state2.searchQuery && state1.searchQuery.query === state2.searchQuery.query && state1.sortOrder === state2.sortOrder && state1.collapseAll === state2.collapseAll && state1.extraContext === state2.extraContext;
  }
  async saveEphemeralState(st) {
    var _a;
    let fileName = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path;
    if (fileName && fileName == this.lastLoadedFileName) {
      this.db[fileName] = st;
    }
  }
  async restoreEphemeralState(specificState = null) {
    var _a;
    let isSet = false;
    if (this.settings.rememberSettings.rememberBacklinkNav) {
      let fileName = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path;
      if (fileName == void 0) {
        return;
      }
      if (fileName && this.loadingFile && this.lastLoadedFileName == fileName)
        return;
      this.loadingFile = true;
      if (this.lastLoadedFileName != fileName) {
        this.lastEphemeralState = {};
        this.lastLoadedFileName = fileName;
        if (fileName) {
          let st = this.db[fileName];
          if (specificState != null) {
            st = specificState;
          }
          if (st) {
            this.setEphemeralState(st);
            this.lastEphemeralState = st;
            isSet = true;
          }
        }
      }
      this.loadingFile = false;
    }
    if (!isSet) {
      this.setEphemeralState(this.settings.defaultState);
    }
  }
  async readDb() {
    let db = {};
    const dbFileName = this.settings.rememberSettings.dbFileName;
    if (dbFileName === "") {
      this.settings.rememberSettings.dbFileName = this.manifest.dir + "/remember-backlink.json";
      await this.saveSettings();
    }
    if (await this.app.vault.adapter.exists(dbFileName)) {
      let data = await this.app.vault.adapter.read(dbFileName);
      db = JSON.parse(data);
    }
    return db;
  }
  async writeDb(db) {
    let newParentFolder = this.settings.rememberSettings.dbFileName.substring(0, this.settings.rememberSettings.dbFileName.lastIndexOf("/"));
    if (!await this.app.vault.adapter.exists(newParentFolder))
      this.app.vault.adapter.mkdir(newParentFolder);
    if (JSON.stringify(this.db) !== JSON.stringify(this.lastSavedDb)) {
      this.app.vault.adapter.write(
        this.settings.rememberSettings.dbFileName,
        JSON.stringify(db)
      );
      this.lastSavedDb = JSON.parse(JSON.stringify(db));
    }
  }
  getEphemeralState() {
    let state = { searchQuery: { query: "" } };
    const activeLeaf = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const backlinks = activeLeaf == null ? void 0 : activeLeaf.leaf.view.backlinks;
    if (backlinks == void 0) {
      return null;
    }
    state.sortOrder = backlinks.backlinkDom.sortOrder;
    state.collapseAll = backlinks.collapseAll;
    state.extraContext = backlinks.extraContext;
    state.unlinkedCollapsed = backlinks.unlinkedCollapsed;
    if (backlinks.searchQuery) {
      state.searchQuery.query = backlinks.searchQuery.query;
    } else {
      state.searchQuery.query = "";
    }
    return state;
  }
  setEphemeralState(state) {
    const activeLeaf = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (activeLeaf === null) {
      return;
    }
    const backlinks = activeLeaf == null ? void 0 : activeLeaf.leaf.view.backlinks;
    this.setQuery(state.searchQuery.query, true);
    this.setSortOrder(state.sortOrder);
    if (state.collapseAll != backlinks.collapseAll)
      backlinks.setCollapseAll(state.collapseAll);
    if (state.extraContext != backlinks.extraContext)
      backlinks.setExtraContext(state.extraContext);
    if (state.unlinkedCollapsed == backlinks.unlinkedCollapsed)
      backlinks.setUnlinkedCollapsed(!state.unlinkedCollapsed, true);
  }
  resetLastDefaultQuery() {
    this.lastDefaultQuery = [this.settings.defaultState.searchQuery.query];
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (this.settings.defaultQuery) {
      this.settings.defaultState.searchQuery.query = this.settings.defaultQuery;
      await this.saveSettings();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var DefaultQuerySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const rememberBacklinkNav = this.plugin.settings.rememberSettings.rememberBacklinkNav;
    containerEl.empty();
    containerEl.createEl("h3", { text: "Default backlinks Navigation" });
    new import_obsidian.Setting(containerEl).setName("Default query").setDesc(rememberBacklinkNav ? "Default query will be added only when the note is not remembered." : "The query will be automatically added if the search input is empty.").addText((text) => text.setPlaceholder("query").setValue(this.plugin.settings.defaultState.searchQuery.query).onChange(async (value) => {
      this.plugin.lastDefaultQuery.push(this.plugin.settings.defaultState.searchQuery.query);
      this.plugin.settings.defaultState.searchQuery.query = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Collapse results").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.defaultState.collapseAll).onChange(async (value) => {
        this.plugin.settings.defaultState.collapseAll = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Show more context").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.defaultState.extraContext).onChange(async (value) => {
        this.plugin.settings.defaultState.extraContext = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Sort order").addDropdown((dropDown) => dropDown.addOption("alphabetical" /* alphabetical */, "File name (A to Z)").addOption("alphabeticalReverse" /* alphabeticalReverse */, "File name (Z to A)").addOption("byModifiedTime" /* byModifiedTime */, "Modified time (new to old)").addOption("byModifiedTimeReverse" /* byModifiedTimeReverse */, "Modified time (old to new)").addOption("byCreatedTime" /* byCreatedTime */, "Created time (new to old)").addOption("byCreatedTimeReverse" /* byCreatedTimeReverse */, "Created time (old to new)").setValue(this.plugin.settings.defaultState.sortOrder || "alphabetical" /* alphabetical */).onChange(async (value) => {
      this.plugin.settings.defaultState.sortOrder = value;
      this.display();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Expand Unlinked mentions").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.defaultState.unlinkedCollapsed).onChange(async (value) => {
        this.plugin.settings.defaultState.unlinkedCollapsed = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Remember backlinks display" });
    new import_obsidian.Setting(containerEl).setName("Remember bottom backlink panel display settings for each file").setDesc("Remember for each file").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.rememberSettings.rememberBacklinkNav).onChange(async (value) => {
        this.plugin.settings.rememberSettings.rememberBacklinkNav = value;
        this.display();
        await this.plugin.saveSettings();
      });
    });
    if (this.plugin.settings.rememberSettings.rememberBacklinkNav) {
      new import_obsidian.Setting(containerEl).setName("Save timer (ms)").setDesc("The interval to save current state to database.").addText((text) => text.setPlaceholder("query").setValue(this.plugin.settings.rememberSettings.saveTimer.toString()).onChange(async (value) => {
        let v = Number(value);
        if (isNaN(v)) {
          new import_obsidian.Notice("Please enter a valid number for save timer.");
          return;
        }
        this.plugin.settings.rememberSettings.saveTimer = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("Check timer (ms)").setDesc("The interval to check the state.").addText((text) => text.setPlaceholder("query").setValue(this.plugin.settings.rememberSettings.checkTimer.toString()).onChange(async (value) => {
        let v = Number(value);
        if (isNaN(v)) {
          new import_obsidian.Notice("Please enter a valid number for check timer.");
          return;
        }
        this.plugin.settings.rememberSettings.checkTimer = v;
        await this.plugin.saveSettings();
      }));
    }
    if (this.plugin.settings.defaultState.sortOrder != "alphabetical" /* alphabetical */ || rememberBacklinkNav) {
      let noteEl = containerEl.createEl("p", {
        text: `Known issue: The check mark in the menu of "Change sort order" can not be updated. It may be confusing but the sort order takes effect actually.`
      });
      noteEl.setAttribute("style", "color: gray; font-style: italic; margin-top: 30px;");
    }
  }
};
