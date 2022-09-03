const { Clutter, Gio, GObject, Meta, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Me = ExtensionUtils.getCurrentExtension();
const workspaceManager = global.workspace_manager;

let WorkspaceIndicator = GObject.registerClass(
  class WorkspaceIndicator extends St.Button {
    _init(workspace, active, skip_taskbar_mode, always_show_all_workspaces, change_on_click) {
      super._init();
      this.active = active;
      this.workspace = workspace;
      this.skip_taskbar_mode = skip_taskbar_mode;
      this.always_show_all_workspaces = always_show_all_workspaces;

      // setup widgets
      this._widget = new St.Widget({
        layout_manager: new Clutter.BinLayout(),
        x_expand: true,
        y_expand: false,
      });

      this._statusLabel = new St.Label({
        style_class: "panel-workspace-indicator",
        y_align: Clutter.ActorAlign.CENTER,
        text: `${this.workspace.index() + 1}`,
      });

      if (this.active) {
        this._statusLabel.add_style_class_name("workspace-indicator-active");
      }

      this._widget.add_actor(this._statusLabel);

      this._thumbnailsBox = new St.BoxLayout({
        style_class: "panel-workspace-indicator-box",
        y_expand: true,
        reactive: true,
      });

      this._widget.add_actor(this._thumbnailsBox);
      this.add_actor(this._widget);

      // Connect signals
      this._windowAddedId = this.workspace.connect("window-added", () =>
        this.show_or_hide()
      );
      this._windowRemovedId = this.workspace.connect("window-removed", () =>
        this.show_or_hide()
      );

      if (change_on_click) {
        this.connect("clicked", () =>
          this.workspace.activate(global.get_current_time())
        );
      }

      this.show_or_hide();
    }

    show_or_hide() {
      if (this.active || this.has_user_window() || this.always_show_all_workspaces) {
        this.show();
      } else {
        this.hide();
      }
    }

    has_user_window() {
      let windows = this.workspace.list_windows();

      if (!this.skip_taskbar_mode) {
        return windows.length > 0;
      }

      return windows.some((w) => {
        return !w.is_skip_taskbar();
      });
    }

    destroy() {
      this.workspace.disconnect(this._windowRemovedId);
      this.workspace.disconnect(this._windowAddedId);
      super.destroy();
    }
  }
);

class WorkspaceLayout {
  constructor() {}

  enable() {
    this.indicators = [];
    this.panel_button = null;
    this.box_layout = null;

    let gschema = Gio.SettingsSchemaSource.new_from_directory(
      Me.dir.get_child("schemas").get_path(),
      Gio.SettingsSchemaSource.get_default(),
      false
    );
    this.settings = ExtensionUtils.getSettings();

    this._panelPositionChangedId = this.settings.connect(
      "changed::panel-position",
      () => {
        this.add_panel_button();
      }
    );

    this._skipTaskbarModeChangedId = this.settings.connect(
      "changed::skip-taskbar-mode",
      () => {
        this.add_panel_button();
      }
    );
    this._alwaysShowAllWorkspacesChangedId = this.settings.connect(
      "changed::always-show-all-workspaces",
      () => {
        this.add_panel_button();
      }
    );
    this._changeOnClickChangedId = this.settings.connect(
      "changed::change-on-click",
      () => {
        this.add_panel_button();
      }
    );

    this.add_panel_button();
  }

  disable() {
    this.destroy_indicators();
    this.destroy_panel_button();
    workspaceManager.disconnect(this._workspaceSwitchedId);
    workspaceManager.disconnect(this._workspaceAddedId);
    workspaceManager.disconnect(this._workspaceRemovedId);
    workspaceManager.disconnect(this._workspaceCountChangedId);
    workspaceManager.disconnect(this._workspacesReorderedId);
    workspaceManager.disconnect(this._dynamicWorkspacesSettingsChangedId);
    this.settings.disconnect(this._panelPositionChangedId);
    this.settings.disconnect(this._skipTaskbarModeChangedId);
    this.settings.disconnect(this._alwaysShowAllWorkspacesChangedId);
    this.settings.disconnect(this._changeOnClickChangedId);
  }

  add_panel_button() {
    this.destroy_panel_button();
    this.panel_button = new PanelMenu.Button(
      0.0,
      _("Improved Workspace Indicator")
    );
    this.box_layout = new St.BoxLayout();
    this.panel_button.add_actor(this.box_layout);

    let [position] = this.settings.get_value("panel-position").get_string();
    Main.panel.addToStatusArea(
      "improved-workspace-indicator",
      this.panel_button,
      0,
      position
    );
    this._workspaceSwitchedId = workspaceManager.connect_after(
      "workspace-switched",
      this.add_indicators.bind(this)
    );
    this._workspaceAddedId = workspaceManager.connect_after(
      "workspace-added",
      this.add_indicators.bind(this)
    );
    this._workspaceRemovedId = workspaceManager.connect_after(
      "workspace-removed",
      this.clear_workspace_cache_and_add_indicators.bind(this)
    );
    this._workspaceCountChangedId = workspaceManager.connect_after(
      "notify::n-workspaces",
      this.clear_workspace_cache_and_add_indicators.bind(this)
    );
    this._workspacesReorderedId = workspaceManager.connect_after(
      "workspaces-reordered",
      this.clear_workspace_cache_and_add_indicators.bind(this)
    );
    this._dynamicWorkspacesSettingsChangedId = workspaceManager.connect_after(
      "changed::dynamic-workspaces",
      this.clear_workspace_cache_and_add_indicators.bind(this)
    );

    this.add_indicators();
  }

  clear_workspace_cache_and_add_indicators() {
    this.workspace_cache = {};
    this.add_indicators();
  }

  add_indicators() {
    this.destroy_indicators();
    let active_index = workspaceManager.get_active_workspace_index();
    let i = 0;

    if (this.workspace_cache == undefined || this.workspace_cache == null) {
      this.workspace_cache = {};
    }

    for (; i < workspaceManager.get_n_workspaces(); i++) {
      let workspace = workspaceManager.get_workspace_by_index(i);

      if (this.workspace_cache[i] == undefined || this.workspace_cache[i] == null || workspace != null) {
        this.workspace_cache[i] = workspace;
      }
      workspace = this.workspace_cache[i];

      if (workspace !== null) {
        let indicator = new WorkspaceIndicator(
          workspace,
          i == active_index,
          this.settings.get_boolean("skip-taskbar-mode"),
          this.settings.get_boolean("always-show-all-workspaces"),
          this.settings.get_boolean("change-on-click")
        );

        this.box_layout.add_actor(indicator);
        this.indicators.push(indicator);
      }
    }
  }

  destroy_indicators() {
    let i = 0;
    for (; i < this.indicators.length; i++) {
      this.indicators[i].destroy();
    }
    this.indicators = [];
  }

  destroy_panel_button() {
    this.destroy_indicators();

    if (this.box_layout !== null) this.box_layout.destroy();
    if (this.panel_button !== null) this.panel_button.destroy();

    this.box_layout = null;
    this.panel_button = null;
  }
}

function init() {
  return new WorkspaceLayout();
}
