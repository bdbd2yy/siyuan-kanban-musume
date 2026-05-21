"use strict";

const { Dialog, Menu, Plugin, getFrontend, showMessage } = require("siyuan");

const PLUGIN_NAME = "siyuan-kanban-musume";
const PLUGIN_BASE = `/plugins/${PLUGIN_NAME}`;
const SETTING_FILE = "kanban-musume-setting.json";
const ROOT_ID = "kanban-musume-root";
const CANVAS_ID = "kanban-musume-live2d";
const STYLE_ID = "kanban-musume-style";
const SCRIPT_ID = "kanban-musume-live2d-script";
const IDLE_INTERVAL = 45000;
const DRAG_CLICK_THRESHOLD = 4;
const HITOKOTO_QUEUE_SIZE = 10;

const ICONS = {
  heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.43-9.33-9.11C.8 8.12 2.7 4 6.68 4A5.1 5.1 0 0 1 12 7.1 5.1 5.1 0 0 1 17.32 4c3.98 0 5.88 4.12 4.01 7.89C19 16.57 12 21 12 21Z"/></svg>',
  message: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.63-.75L3 21l1.25-5.87A9 9 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 9Z"/></svg>',
  refresh: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20 6v5h-5"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 18v-5h5"/><path stroke-linecap="round" stroke-linejoin="round" d="M18.4 9A7 7 0 0 0 6.6 7.4L4 10m16 4-2.6 2.6A7 7 0 0 1 5.6 15"/></svg>',
  camera: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 11v5"/><path stroke-linecap="round" d="M12 8h.01"/></svg>',
  eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m3 3 18 18"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.58 10.58A2 2 0 0 0 13.42 13.4"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.88 5.1A9.77 9.77 0 0 1 12 4.86c5.25 0 8.44 4.78 9 6.64a8.2 8.2 0 0 1-2.16 3.3"/><path stroke-linecap="round" stroke-linejoin="round" d="M6.1 6.55C4.24 7.82 3.12 9.64 3 11.5c.56 1.86 3.75 6.64 9 6.64 1.3 0 2.48-.3 3.52-.82"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05a2.1 2.1 0 1 1-2.97 2.97l-.05-.05a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 1 1-4.2 0v-.07a1.8 1.8 0 0 0-1.18-1.67 1.8 1.8 0 0 0-1.98.36l-.05.05a2.1 2.1 0 1 1-2.97-2.97l.05-.05A1.8 1.8 0 0 0 3.74 15a1.8 1.8 0 0 0-1.66-1.1H2a2.1 2.1 0 1 1 0-4.2h.07a1.8 1.8 0 0 0 1.67-1.18 1.8 1.8 0 0 0-.36-1.98l-.05-.05a2.1 2.1 0 1 1 2.97-2.97l.05.05a1.8 1.8 0 0 0 1.98.36H8.4A1.8 1.8 0 0 0 9.5 2.28V2a2.1 2.1 0 1 1 4.2 0v.07a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.05-.05a2.1 2.1 0 1 1 2.97 2.97l-.05.05a1.8 1.8 0 0 0-.36 1.98v.08a1.8 1.8 0 0 0 1.66 1.1H22a2.1 2.1 0 1 1 0 4.2h-.07A1.8 1.8 0 0 0 19.4 15Z"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>'
};

const DEFAULT_SETTING = {
  hidden: false,
  position: "left",
  draggable: true,
  idleTipsEnabled: true,
  hitokotoEnabled: true,
  currentModel: "HK416",
  models: [
    {
      id: "HK416",
      name: "416",
      path: `${PLUGIN_BASE}/models/416/model.json`
    },
    {
      id: "pio",
      name: "Pio",
      path: `${PLUGIN_BASE}/models/pio/model.json`
    },
    {
      id: "chino",
      name: "Chino",
      path: `${PLUGIN_BASE}/models/chino/model.json`
    }
  ],
  messages: {
    welcome: [
      "欢迎使用思源笔记。",
      "今天也一起整理一点想法吧。",
      "你回来啦"
    ],
    time: {
      lateNight: [
        "夜已经深了，写完这一段就早点休息吧。"
      ],
      morning: [
        "早上好，你居然可以起得这么早呢"
      ],
      forenoon: [
        "上午好，享受上午的时光吧"
      ],
      noon: [
        "中午了，记得吃饭和休息"
      ],
      afternoon: [
        "下午容易犯困，要不要偷偷眯一下呢"
      ],
      evening: [
        "傍晚好，收束一下今天的线索吧"
      ],
      night: [
        "晚上好，适合复盘，也适合安静写作"
      ]
    },
    idle: [
      "我还在这里，有需要就叫我",
      "空白也是一种缓冲，慢慢想"
    ],
    touch: [
      "在呢",
      "别戳太用力啦",
      "想到新点子了吗？",
      "认真写笔记，不许摸鱼！",
      "再点我，就把你的todo加倍！"
    ],
    copy: [
      "已复制，别忘了标注来源",
      "这段内容看起来很有用"
    ],
    visibilitychange: [
      "欢迎回来",
      "刚才的思路还在这里"
    ],
    random: [
      "灵感通常不是等来的，是写着写着浮出来的。",
      "先记下来，稍后再决定它是不是好想法。",
      "今天可以只推进一个很小但确定的步骤。",
      "复杂的内容，先拆成三个标题。",
      "如果卡住了，换一种问法。",
      "一条清晰的笔记，比十条模糊的收藏更有价值。",
      "把结论写在前面，未来的你会感谢现在的你。",
      "不用一次写完，先留下可继续的线索。",
      "整理不是为了漂亮，是为了下次更快找到。",
      "现在这个想法值得加一个双链。"
    ],
    tooltips: {
      random: "随机一言",
      model: "切换模型",
      photo: "截图",
      info: "信息",
      hide: "隐藏",
      settings: "设置",
      show: "展开看板娘"
    },
    goodbye: [
      "我先藏起来，需要时再叫我"
    ],
    modelChanged: [
      "你好，现在是 {name} 在看着你"
    ],
    photo: [
      "你又在给我拍照啦"
    ]
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeMessages(value) {
  const merged = clone(DEFAULT_SETTING.messages);
  if (!isPlainObject(value)) {
    return merged;
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === "tooltips" && isPlainObject(item)) {
      merged.tooltips = { ...merged.tooltips, ...item };
    } else {
      merged[key] = item;
    }
  }
  return merged;
}

function normalizeSetting(value) {
  const source = isPlainObject(value) ? value : {};
  const models = Array.isArray(source.models) ? source.models : DEFAULT_SETTING.models;
  const normalizedModels = models
    .map((model) => ({
      id: String(model.id || "").trim(),
      name: String(model.name || model.id || "").trim(),
      path: String(model.path || "").trim()
    }))
    .filter((model) => model.id && model.name && model.path);
  const safeModels = normalizedModels.length > 0 ? normalizedModels : clone(DEFAULT_SETTING.models);
  const currentModel = safeModels.some((model) => model.id === source.currentModel)
    ? source.currentModel
    : safeModels[0].id;

  return {
    hidden: Boolean(source.hidden ?? DEFAULT_SETTING.hidden),
    position: source.position === "left" ? "left" : "right",
    draggable: Boolean(source.draggable ?? DEFAULT_SETTING.draggable),
    idleTipsEnabled: Boolean(source.idleTipsEnabled ?? DEFAULT_SETTING.idleTipsEnabled),
    hitokotoEnabled: Boolean(source.hitokotoEnabled ?? DEFAULT_SETTING.hitokotoEnabled),
    currentModel,
    models: safeModels,
    messages: mergeMessages(source.messages)
  };
}

function randomIndex(length) {
  if (length <= 0) {
    return -1;
  }
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const bucketSize = 0x100000000;
    const limit = bucketSize - (bucketSize % length);
    const values = new Uint32Array(1);
    do {
      cryptoApi.getRandomValues(values);
    } while (values[0] >= limit);
    return values[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function randomItem(items, previousItem = "") {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  const candidates = previousItem && items.length > 1
    ? items.filter((item) => item !== previousItem)
    : items;
  return candidates[randomIndex(candidates.length)] || "";
}

function formatText(text, data = {}) {
  return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : match
  ));
}

function pickMessage(value, data = {}) {
  if (Array.isArray(value)) {
    return formatText(randomItem(value), data);
  }
  if (typeof value === "string") {
    return formatText(value, data);
  }
  return "";
}

async function fetchRandomHitokoto(timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch("https://v1.hitokoto.cn/", {
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data && typeof data.hitokoto === "string" && data.hitokoto.trim()) {
      const text = data.hitokoto.trim();
      const from = typeof data.from === "string" && data.from.trim() ? data.from.trim() : "";
      const fromWho = typeof data.from_who === "string" && data.from_who.trim() ? data.from_who.trim() : "";
      return { text, from, fromWho };
    }
    throw new Error("Empty hitokoto in response");
  } finally {
    clearTimeout(timer);
  }
}

function appendStrings(value, result) {
  if (typeof value === "string") {
    result.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      appendStrings(item, result);
    }
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (key !== "tooltips") {
        appendStrings(item, result);
      }
    }
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notify(text, timeout = 3000, type = "info") {
  if (typeof showMessage === "function") {
    showMessage(text, timeout, type);
  } else {
    console.log(`[${PLUGIN_NAME}] ${text}`);
  }
}

function createElement(tag, className, html) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (html) {
    element.innerHTML = html;
  }
  return element;
}

function ensureStylesheet() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = `${PLUGIN_BASE}/index.css`;
  document.head.appendChild(link);
}

function ensureLive2DScript() {
  if (typeof window.loadlive2d === "function") {
    return Promise.resolve();
  }
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${PLUGIN_BASE}/static/l2d.js`;
    script.async = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

class KanbanMusumePlugin extends Plugin {
  constructor(options) {
    super(options);
    const frontend = typeof getFrontend === "function" ? getFrontend() : "desktop";
    this.isMobile = frontend === "mobile" || frontend === "browser-mobile";
    this.setting = clone(DEFAULT_SETTING);
    this.root = null;
    this.canvas = null;
    this.dialog = null;
    this.toolbar = null;
    this.showButton = null;
    this.loadedModelPath = "";
    this.messageTimer = 0;
    this.idleTimer = 0;
    this.lastRandomMessage = "";
    this.hitokotoQueue = [];
    this.hitokotoSeen = new Set();
    this.hitokotoRefilling = false;
    this.hitokotoRetryTimer = 0;
    this.hitokotoRetryCount = 0;
    this.isDragging = false;
    this.dragMode = "";
    this.dragMoved = false;
    this.dragOffset = { x: 0, y: 0 };
    this.dragStart = { x: 0, y: 0 };
    this.suppressShowButtonClick = false;
    this.suppressShowButtonClickTimer = 0;
    this.boundCopyHandler = () => this.showMessage("copy");
    this.boundVisibilityHandler = () => {
      if (!document.hidden) {
        this.showMessage("visibilitychange");
      }
    };
    this.boundDragMove = (event) => this.onDragMove(event);
    this.boundDragEnd = () => this.onDragEnd();
  }

  async onload() {
    ensureStylesheet();
    this.setting = await this.loadSetting();
    this.addTopBarEntry();
    await this.mountWidget();
    document.addEventListener("copy", this.boundCopyHandler);
    document.addEventListener("visibilitychange", this.boundVisibilityHandler);
    this.restartIdleTimer();
  }

  onunload() {
    clearTimeout(this.messageTimer);
    clearTimeout(this.suppressShowButtonClickTimer);
    clearTimeout(this.hitokotoRetryTimer);
    clearInterval(this.idleTimer);
    document.removeEventListener("copy", this.boundCopyHandler);
    document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
    document.removeEventListener("mousemove", this.boundDragMove);
    document.removeEventListener("mouseup", this.boundDragEnd);
    this.root?.remove();
    this.root = null;
  }

  openSetting() {
    this.openSettingsDialog();
  }

  async loadSetting() {
    try {
      const data = await this.loadData(SETTING_FILE);
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return normalizeSetting(parsed);
    } catch (error) {
      console.warn(`[${PLUGIN_NAME}] Failed to load settings, using defaults.`, error);
      return clone(DEFAULT_SETTING);
    }
  }

  async saveSetting(setting = this.setting) {
    this.setting = normalizeSetting(setting);
    await this.saveData(SETTING_FILE, JSON.stringify(this.setting, null, 2));
  }

  addTopBarEntry() {
    const title = this.i18n?.kanbanMusume || "思源看板娘";
    const topbar = this.addTopBar({
      icon: ICONS.heart,
      title,
      position: "right",
      callback: () => {}
    });
    topbar.addEventListener("click", () => this.openTopBarMenu(topbar));
  }

  openTopBarMenu(topbar) {
    const menu = new Menu("kanbanMusumeMenu");
    menu.addItem({
      iconHTML: `<span class="font-awesome-icon">${this.setting.hidden ? ICONS.eye : ICONS.eyeOff}</span>`,
      label: this.setting.hidden ? "显示看板娘" : "隐藏看板娘",
      click: () => this.setHidden(!this.setting.hidden)
    });
    menu.addSeparator();
    menu.addItem({
      iconHTML: `<span class="font-awesome-icon">${ICONS.settings}</span>`,
      label: this.i18n?.setting || "设置",
      click: () => this.openSettingsDialog()
    });

    if (this.isMobile) {
      menu.fullscreen();
      return;
    }

    let rect = topbar.getBoundingClientRect();
    if (rect.width === 0) {
      rect = document.querySelector("#barMore")?.getBoundingClientRect() || rect;
    }
    menu.open({ x: rect.right, y: rect.bottom, isLeft: true });
  }

  async mountWidget() {
    document.getElementById(ROOT_ID)?.remove();

    this.root = createElement("div", "km-root");
    this.root.id = ROOT_ID;

    const stage = createElement("div", "km-stage");
    this.dialog = createElement("div", "km-dialog");
    this.toolbar = createElement("div", "km-toolbar");
    this.canvas = document.createElement("canvas");
    this.canvas.id = CANVAS_ID;
    this.canvas.className = "km-canvas";
    this.canvas.width = 320;
    this.canvas.height = 500;

    this.showButton = createElement("button", "km-show");
    this.showButton.type = "button";

    this.buildToolbar();
    stage.appendChild(this.dialog);
    stage.appendChild(this.toolbar);
    stage.appendChild(this.canvas);
    this.root.appendChild(stage);
    this.root.appendChild(this.showButton);
    document.body.appendChild(this.root);

    this.canvas.addEventListener("click", () => this.showMessage("touch"));
    stage.addEventListener("mousedown", (event) => this.onDragStart(event));
    this.showButton.addEventListener("mousedown", (event) => this.onShowButtonDragStart(event));
    this.showButton.addEventListener("click", () => {
      if (this.suppressShowButtonClick) {
        this.suppressShowButtonClick = false;
        return;
      }
      this.setHidden(false);
    });

    this.applyWidgetClasses();
    if (!this.setting.hidden) {
      await this.reloadModel(true);
      window.setTimeout(() => this.showGreeting(), 600);
    }
    this.initHitokotoQueue();
  }

  buildToolbar() {
    this.toolbar.replaceChildren(
      this.createTool("random", ICONS.message, () => this.showRandomMessage()),
      this.createTool("model", ICONS.refresh, () => this.switchToNextModel()),
      this.createTool("photo", ICONS.camera, () => this.capturePhoto()),
      this.createTool("info", ICONS.info, () => this.showInfoDialog()),
      this.createTool("hide", ICONS.eyeOff, () => this.setHidden(true)),
      this.createTool("settings", ICONS.settings, () => this.openSettingsDialog())
    );
  }

  createTool(key, icon, action) {
    const button = createElement("button", "km-tool", icon);
    button.type = "button";
    button.setAttribute("aria-label", this.getTooltip(key));
    button.dataset.tip = this.getTooltip(key);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      action();
    });
    return button;
  }

  getTooltip(key) {
    return this.setting.messages.tooltips?.[key] || key;
  }

  applyWidgetClasses() {
    if (!this.root) {
      return;
    }
    this.root.classList.toggle("km-left", this.setting.position === "left");
    this.root.classList.toggle("km-right", this.setting.position === "right");
    this.root.classList.toggle("km-hidden", this.setting.hidden);
    this.showButton.dataset.tip = this.getTooltip("show");
    this.buildToolbar();
  }

  currentModel() {
    return this.setting.models.find((model) => model.id === this.setting.currentModel) || this.setting.models[0];
  }

  async reloadModel(force = false) {
    const model = this.currentModel();
    if (!this.canvas || !model || this.setting.hidden) {
      return;
    }
    if (!force && this.loadedModelPath === model.path) {
      return;
    }
    this.loadedModelPath = model.path;
    try {
      await ensureLive2DScript();
      window.loadlive2d(CANVAS_ID, model.path);
    } catch (error) {
      console.error(`[${PLUGIN_NAME}] Failed to load Live2D model: ${model.path}`, error);
      notify(`看板娘模型加载失败：${model.name}`, 5000, "error");
    }
  }

  showDialogText(text, time = 3600) {
    if (!this.dialog || !text || this.setting.hidden) {
      return;
    }
    this.dialog.textContent = text;
    this.dialog.classList.add("km-active");
    clearTimeout(this.messageTimer);
    this.messageTimer = window.setTimeout(() => {
      this.dialog?.classList.remove("km-active");
    }, time);
  }

  showMessage(key, data = {}) {
    const value = this.setting.messages[key];
    const text = pickMessage(value, data);
    this.showDialogText(text);
  }

  showGreeting() {
    const text = this.getTimeMessage() || pickMessage(this.setting.messages.welcome);
    this.showDialogText(text);
  }

  getTimeMessage() {
    const hour = new Date().getHours();
    const time = this.setting.messages.time;
    if (!isPlainObject(time)) {
      return pickMessage(time);
    }
    let key = "night";
    if (hour > 22 || hour <= 5) {
      key = "lateNight";
    } else if (hour <= 8) {
      key = "morning";
    } else if (hour <= 11) {
      key = "forenoon";
    } else if (hour <= 14) {
      key = "noon";
    } else if (hour <= 17) {
      key = "afternoon";
    } else if (hour <= 19) {
      key = "evening";
    }
    return pickMessage(time[key]);
  }

  initHitokotoQueue() {
    this.hitokotoQueue = [];
    this.hitokotoSeen = new Set();
    this.hitokotoRetryCount = 0;
    clearTimeout(this.hitokotoRetryTimer);
    if (!this.setting.hitokotoEnabled) {
      return;
    }
    const batch = [];
    for (let i = 0; i < HITOKOTO_QUEUE_SIZE; i++) {
      batch.push(
        fetchRandomHitokoto().catch(() => null)
      );
    }
    Promise.allSettled(batch).then((results) => {
      for (const result of results) {
        if (result.status === "fulfilled" && result.value && !this.hitokotoSeen.has(result.value.text)) {
          this.hitokotoSeen.add(result.value.text);
          this.hitokotoQueue.push(result.value);
        }
      }
      if (this.hitokotoSeen.size > 500) {
        this.hitokotoSeen = new Set([...this.hitokotoSeen].slice(-200));
      }
      if (this.hitokotoQueue.length === 0 && this.setting.hitokotoEnabled && this.hitokotoRetryCount < 3) {
        this.hitokotoRetryCount++;
        this.hitokotoRetryTimer = window.setTimeout(() => this.initHitokotoQueue(), 30000);
      }
    });
  }

  refillHitokotoQueue() {
    if (!this.setting.hitokotoEnabled || this.hitokotoRefilling) {
      return;
    }
    this.hitokotoRefilling = true;
    const fillQueue = async () => {
      try {
        while (this.setting.hitokotoEnabled && this.hitokotoQueue.length < HITOKOTO_QUEUE_SIZE) {
          const needed = HITOKOTO_QUEUE_SIZE - this.hitokotoQueue.length;
          if (needed >= 7) {
            const batch = [];
            for (let i = 0; i < 3 && i < needed; i++) {
              batch.push(fetchRandomHitokoto().catch(() => null));
            }
            const results = await Promise.allSettled(batch);
            for (const result of results) {
              if (!this.setting.hitokotoEnabled) break;
              if (result.status === "fulfilled" && result.value && !this.hitokotoSeen.has(result.value.text)) {
                this.hitokotoSeen.add(result.value.text);
                if (this.hitokotoSeen.size > 500) {
                  this.hitokotoSeen = new Set([...this.hitokotoSeen].slice(-200));
                }
                this.hitokotoQueue.push(result.value);
              }
            }
          } else {
            const item = await fetchRandomHitokoto();
            if (!this.setting.hitokotoEnabled) break;
            if (item && !this.hitokotoSeen.has(item.text)) {
              this.hitokotoSeen.add(item.text);
              if (this.hitokotoSeen.size > 500) {
                this.hitokotoSeen = new Set([...this.hitokotoSeen].slice(-200));
              }
              this.hitokotoQueue.push(item);
            }
          }
      } catch (error) {
        console.warn(`[${PLUGIN_NAME}] Failed to refill hitokoto queue.`, error);
      } finally {
        this.hitokotoRefilling = false;
      }
    };
    fillQueue();
  }

  tryUseHitokotoQueue() {
    if (!this.setting.hitokotoEnabled) {
      return { text: "", timeout: 3600 };
    }

    if (this.hitokotoQueue.length > 0) {
      const item = this.hitokotoQueue.shift();
      let text = item.text;
      const parts = [];
      if (item.fromWho) parts.push(item.fromWho);
      if (item.from) {
        const source = item.from.replace(/^《|》$/g, "");
        parts.push(`《${source}》`);
      }
      if (parts.length > 0) text = `${text} —— ${parts.join(" ")}`;
      this.refillHitokotoQueue();
      return { text, timeout: 6000 };
    }

    this.refillHitokotoQueue();
    return { text: "", timeout: 3600 };
  }

  showRandomMessage() {
    const result = this.tryUseHitokotoQueue();
    let text = result.text;
    let timeout = result.timeout;

    if (!text) {
      const items = [];
      appendStrings(this.setting.messages.random, items);
      if (items.length === 0) {
        appendStrings({
          welcome: this.setting.messages.welcome,
          time: this.setting.messages.time,
          idle: this.setting.messages.idle,
          touch: this.setting.messages.touch,
          copy: this.setting.messages.copy,
          visibilitychange: this.setting.messages.visibilitychange
        }, items);
      }
      const model = this.currentModel();
      text = formatText(randomItem(items, this.lastRandomMessage), {
        model: model?.name || "",
        modelId: model?.id || ""
      });
    }

    this.lastRandomMessage = text;
    this.showDialogText(text, timeout);
  }

  restartIdleTimer() {
    clearInterval(this.idleTimer);
    this.idleTimer = window.setInterval(() => {
      if (!this.setting.hidden && this.setting.idleTipsEnabled) {
        this.showMessage("idle");
      }
    }, IDLE_INTERVAL);
  }

  async switchToNextModel() {
    if (this.setting.models.length <= 1) {
      return;
    }
    const index = this.setting.models.findIndex((model) => model.id === this.setting.currentModel);
    const next = this.setting.models[(index + 1) % this.setting.models.length];
    this.setting.currentModel = next.id;
    await this.saveSetting(this.setting);
    await this.reloadModel(true);
    this.showMessage("modelChanged", { name: next.name, id: next.id });
  }

  capturePhoto() {
    try {
      const name = `kanban-musume-${Date.now()}.png`;
      if (window.Live2D) {
        window.Live2D.captureName = name;
        window.Live2D.captureFrame = true;
      } else {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL("image/png");
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      this.showMessage("photo");
    } catch (error) {
      console.error(`[${PLUGIN_NAME}] Failed to capture photo.`, error);
      notify("截图失败，请查看控制台。", 5000, "error");
    }
  }

  showInfoDialog() {
    const model = this.currentModel();
    new Dialog({
      title: "思源看板娘",
      content: `
        <div class="b3-typography" style="padding: 20px 24px">
          <p><strong>当前模型：</strong>${escapeHTML(model?.name || "")}</p>
          <p><strong>模型路径：</strong><code>${escapeHTML(model?.path || "")}</code></p>
          <p><strong>配置文件：</strong><code>${SETTING_FILE}</code></p>
        </div>
      `,
      width: this.isMobile ? "92vw" : "520px"
    });
  }

  async setHidden(hidden) {
    if (hidden) {
      this.showMessage("goodbye");
      await this.saveSetting({ ...this.setting, hidden: true });
      window.setTimeout(() => {
        this.resetPlacement(this.setting.position);
        this.applyWidgetClasses();
      }, 450);
      return;
    }
    await this.saveSetting({ ...this.setting, hidden: false });
    this.applyWidgetClasses();
    this.clampVisiblePlacement();
    await this.reloadModel(true);
    this.showGreeting();
  }

  onDragStart(event) {
    if (!this.setting.draggable || this.setting.hidden || event.target.closest(".km-toolbar")) {
      return;
    }
    const rect = this.root.getBoundingClientRect();
    this.isDragging = true;
    this.dragMode = "stage";
    this.dragMoved = false;
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;
    this.dragStart.x = event.clientX;
    this.dragStart.y = event.clientY;
    this.root.classList.add("km-dragging");
    document.addEventListener("mousemove", this.boundDragMove);
    document.addEventListener("mouseup", this.boundDragEnd);
  }

  onShowButtonDragStart(event) {
    if (!this.setting.draggable || !this.setting.hidden) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const rect = this.showButton.getBoundingClientRect();
    this.isDragging = true;
    this.dragMode = "showButton";
    this.dragMoved = false;
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;
    this.dragStart.x = event.clientX;
    this.dragStart.y = event.clientY;
    this.root.classList.add("km-dragging");
    document.addEventListener("mousemove", this.boundDragMove);
    document.addEventListener("mouseup", this.boundDragEnd);
  }

  onDragMove(event) {
    if (!this.isDragging) {
      return;
    }
    if (
      !this.dragMoved &&
      (Math.abs(event.clientX - this.dragStart.x) > DRAG_CLICK_THRESHOLD ||
        Math.abs(event.clientY - this.dragStart.y) > DRAG_CLICK_THRESHOLD)
    ) {
      this.dragMoved = true;
    }

    if (this.dragMode === "showButton") {
      this.moveShowButtonAlongEdge(event);
      return;
    }

    const left = Math.max(0, Math.min(window.innerWidth - this.root.offsetWidth, event.clientX - this.dragOffset.x));
    const top = Math.max(0, Math.min(window.innerHeight - this.root.offsetHeight, event.clientY - this.dragOffset.y));
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
    this.root.style.right = "auto";
    this.root.style.bottom = "auto";
  }

  moveShowButtonAlongEdge(event) {
    const rect = this.showButton.getBoundingClientRect();
    const buttonHeight = rect.height || this.showButton.offsetHeight || 42;
    const computed = window.getComputedStyle(this.showButton);
    const edgeOffset = Number.parseFloat(computed.bottom) || 0;
    const top = Math.max(0, Math.min(window.innerHeight - buttonHeight, event.clientY - this.dragOffset.y));
    const bottom = Math.max(0, window.innerHeight - top - buttonHeight - edgeOffset);

    this.root.style.top = "";
    this.root.style.bottom = `${bottom}px`;
    if (this.setting.position === "left") {
      this.root.style.left = "0";
      this.root.style.right = "auto";
    } else {
      this.root.style.left = "auto";
      this.root.style.right = "0";
    }
  }

  clampVisiblePlacement() {
    if (!this.root || this.setting.hidden) {
      return;
    }
    const rect = this.root.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const left = Math.max(0, Math.min(window.innerWidth - rect.width, rect.left));
    const top = Math.max(0, Math.min(window.innerHeight - rect.height, rect.top));
    if (left === rect.left && top === rect.top) {
      return;
    }
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
    this.root.style.right = "auto";
    this.root.style.bottom = "auto";
  }

  onDragEnd() {
    const shouldSuppressClick = this.dragMode === "showButton" && this.dragMoved;
    this.isDragging = false;
    this.dragMode = "";
    this.dragMoved = false;
    clearTimeout(this.suppressShowButtonClickTimer);
    this.suppressShowButtonClick = shouldSuppressClick;
    if (shouldSuppressClick) {
      this.suppressShowButtonClickTimer = window.setTimeout(() => {
        this.suppressShowButtonClick = false;
      }, 250);
    }
    this.root?.classList.remove("km-dragging");
    document.removeEventListener("mousemove", this.boundDragMove);
    document.removeEventListener("mouseup", this.boundDragEnd);
  }

  resetPlacement(position = this.setting.position) {
    if (!this.root) {
      return;
    }
    this.root.style.top = "";
    this.root.style.bottom = "0";
    if (position === "left") {
      this.root.style.left = "0";
      this.root.style.right = "auto";
    } else {
      this.root.style.left = "auto";
      this.root.style.right = "0";
    }
  }

  openSettingsDialog() {
    const id = `km-settings-${Date.now()}`;
    new Dialog({
      title: "设置 - 思源看板娘",
      content: `<div id="${id}" class="km-settings"></div>`,
      width: this.isMobile ? "92vw" : "780px"
    });
    const panel = document.getElementById(id);
    if (panel) {
      this.renderSettingsPanel(panel);
    }
  }

  renderSettingsPanel(panel) {
    panel.replaceChildren();

    const hiddenInput = this.createCheckbox(this.setting.hidden);
    const positionSelect = this.createSelect([
      ["left", "左侧"],
      ["right", "右侧"]
    ], this.setting.position);
    const draggableInput = this.createCheckbox(this.setting.draggable);
    const idleInput = this.createCheckbox(this.setting.idleTipsEnabled);
    const hitokotoInput = this.createCheckbox(this.setting.hitokotoEnabled);
    const currentSelect = this.createModelSelect(this.setting.currentModel);
    const modelBody = document.createElement("tbody");
    const messageArea = document.createElement("textarea");
    messageArea.className = "b3-text-field";
    messageArea.value = JSON.stringify(this.setting.messages, null, 2);

    panel.appendChild(this.createRow("隐藏看板娘", "隐藏后仍可从屏幕边缘展开。", hiddenInput));
    panel.appendChild(this.createRow("位置", "选择看板娘贴靠屏幕左侧或右侧。", positionSelect));
    panel.appendChild(this.createRow("允许拖拽", "关闭后看板娘固定在所选侧边。", draggableInput));
    panel.appendChild(this.createRow("空闲提示", "定时显示 idle 文案。", idleInput));
    panel.appendChild(this.createRow("一言 Hitokoto", "从 Hitokoto API 获取随机一言，失败时使用本地随机文案", hitokotoInput));
    panel.appendChild(this.createRow("当前模型", "选择后会立即保存并重新加载模型。", currentSelect));

    const modelTable = this.createModelTable(modelBody);
    const modelWrap = createElement("div");
    modelWrap.appendChild(modelTable);
    const addModel = createElement("button", "b3-button b3-button--outline");
    addModel.type = "button";
    addModel.textContent = "添加模型";
    addModel.addEventListener("click", () => this.appendModelRow(modelBody, { id: "", name: "", path: "" }));
    modelWrap.appendChild(addModel);
    panel.appendChild(this.createRow("模型列表", "每行包含 id、显示名称和 model.json 路径。", modelWrap));

    panel.appendChild(this.createRow("交互文案 JSON", "保存后立即生效。", messageArea));

    const actions = createElement("div", "km-actions");
    const saveButton = createElement("button", "b3-button b3-button--text");
    saveButton.type = "button";
    saveButton.textContent = "保存";
    saveButton.addEventListener("click", async () => {
      await this.saveSettingsFromPanel({
        hiddenInput,
        positionSelect,
        draggableInput,
        idleInput,
        hitokotoInput,
        currentSelect,
        modelBody,
        messageArea
      });
    });
    actions.appendChild(saveButton);
    panel.appendChild(actions);

    currentSelect.addEventListener("change", async () => {
      this.setting.currentModel = currentSelect.value;
      await this.saveSetting(this.setting);
      await this.reloadModel(true);
      const model = this.currentModel();
      this.showMessage("modelChanged", { name: model.name, id: model.id });
    });
  }

  createRow(title, description, control) {
    const row = createElement("div", "km-row");
    const text = createElement("div", "km-row-title");
    const strong = document.createElement("strong");
    strong.textContent = title;
    const desc = document.createElement("span");
    desc.textContent = description;
    text.appendChild(strong);
    text.appendChild(desc);
    row.appendChild(text);
    row.appendChild(control);
    return row;
  }

  createCheckbox(checked) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "b3-switch fn__flex-center";
    input.checked = checked;
    return input;
  }

  createSelect(options, value) {
    const select = document.createElement("select");
    select.className = "b3-select fn__flex-center fn__size200";
    for (const [optionValue, label] of options) {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = label;
      option.selected = optionValue === value;
      select.appendChild(option);
    }
    return select;
  }

  createModelSelect(value) {
    return this.createSelect(this.setting.models.map((model) => [model.id, model.name]), value);
  }

  createModelTable(body) {
    const table = createElement("table", "km-model-table");
    const head = document.createElement("thead");
    head.innerHTML = "<tr><th>ID</th><th>名称</th><th>model.json 路径</th><th></th></tr>";
    for (const model of this.setting.models) {
      this.appendModelRow(body, model);
    }
    table.appendChild(head);
    table.appendChild(body);
    return table;
  }

  appendModelRow(body, model) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input class="b3-text-field" data-field="id" value="${escapeHTML(model.id)}"></td>
      <td><input class="b3-text-field" data-field="name" value="${escapeHTML(model.name)}"></td>
      <td><input class="b3-text-field" data-field="path" value="${escapeHTML(model.path)}"></td>
      <td><button type="button" class="b3-button b3-button--outline km-model-remove">×</button></td>
    `;
    row.querySelector("button").addEventListener("click", () => row.remove());
    body.appendChild(row);
  }

  collectModels(body) {
    return Array.from(body.querySelectorAll("tr"))
      .map((row) => ({
        id: row.querySelector('[data-field="id"]').value.trim(),
        name: row.querySelector('[data-field="name"]').value.trim(),
        path: row.querySelector('[data-field="path"]').value.trim()
      }))
      .filter((model) => model.id || model.name || model.path);
  }

  async saveSettingsFromPanel(elements) {
    let messages;
    try {
      messages = JSON.parse(elements.messageArea.value);
    } catch (error) {
      notify(`交互文案 JSON 格式错误：${error.message}`, 5000, "error");
      return;
    }

    const models = this.collectModels(elements.modelBody);
    if (models.length === 0 || models.some((model) => !model.id || !model.name || !model.path)) {
      notify("模型列表必须填写 id、名称和路径。", 5000, "error");
      return;
    }

    const previousPosition = this.setting.position;
    const previousModel = this.currentModel();
    const wasHitokotoEnabled = this.setting.hitokotoEnabled;
    const next = normalizeSetting({
      hidden: elements.hiddenInput.checked,
      position: elements.positionSelect.value,
      draggable: elements.draggableInput.checked,
      idleTipsEnabled: elements.idleInput.checked,
      hitokotoEnabled: elements.hitokotoInput.checked,
      currentModel: elements.currentSelect.value,
      models,
      messages
    });

    const nextModel = next.models.find((model) => model.id === next.currentModel) || next.models[0];
    const shouldReload = previousModel?.id !== nextModel.id || previousModel?.path !== nextModel.path;

    await this.saveSetting(next);
    if (!wasHitokotoEnabled && this.setting.hitokotoEnabled) {
      this.initHitokotoQueue();
    }
    if (previousPosition !== this.setting.position || !this.setting.draggable) {
      this.resetPlacement(this.setting.position);
    }
    this.applyWidgetClasses();
    this.restartIdleTimer();
    if (!this.setting.hidden && shouldReload) {
      await this.reloadModel(true);
      this.showMessage("modelChanged", { name: nextModel.name, id: nextModel.id });
    }
    if (!this.setting.hidden && !shouldReload) {
      this.showGreeting();
    }
    notify("思源看板娘设置已保存。");
  }
}

module.exports = KanbanMusumePlugin;
