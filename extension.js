const { Clutter, Gio, GObject, Meta, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const workspaceManager = global.workspace_manager;

let WorkspaceIndicator = GObject.registerClass(
  class WorkspaceIndicator extends St.Button {
    _init(workspace, active) {
      super._init();
      this.active = active;
      this.workspace = workspace;
      this._windowAddedId = this.workspace.connect(
        "window-added",
        this.window_added.bind(this)
      );
      this._windowRemovedId = this.workspace.connect(
        "window-removed",
        this.window_removed.bind(this)
      );

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

      this.connect("clicked", () =>
        this.workspace.activate(global.get_current_time())
      );

      if (this.active) {
        this._statusLabel.add_style_class_name("active");
      }

      this._widget.add_actor(this._statusLabel);

      this._thumbnailsBox = new St.BoxLayout({
        style_class: "panel-workspace-indicator-box",
        y_expand: true,
        reactive: true,
      });

      this._widget.add_actor(this._thumbnailsBox);
      this.add_actor(this._widget);

      this.show_or_hide();
    }

    window_removed() {
      this.show_or_hide();
    }

    window_added() {
      this.show_or_hide();
    }

    show_or_hide() {
      if (this.active || this.workspace.list_windows().length > 0) {
        this.show();
      } else {
        this.hide();
      }
    }

    destroy() {
      this.workspace.disconnect(this._windowRemovedId);
      this.workspace.disconnect(this._windowAddedId);
      super.destroy();
    }
  }
);

class WorkspaceLayout {
  constructor() {
    this.indicators = [];
    this.panel_button = null;
    this.box_layout = null;
  }

  enable() {
    this.panel_button = new PanelMenu.Button(
      0.0,
      _("Improved Workspace Indicator")
    );
    this.box_layout = new St.BoxLayout();
    this.panel_button.add_actor(this.box_layout);

    Main.panel.addToStatusArea(
      "improved-workspace-indicator",
      this.panel_button
    );
    this.generate_workspaces();
    this._workspaceSwitchedId = workspaceManager.connect_after(
      "workspace-switched",
      this.generate_workspaces.bind(this)
    );
    this._workspaceAddedId = workspaceManager.connect_after(
      "workspace-added",
      this.generate_workspaces.bind(this)
    );
    this._workspaceRemovedId = workspaceManager.connect_after(
      "workspace-removed",
      this.generate_workspaces.bind(this)
    );
  }

  disable() {
    this.destroy_indicators();
    this.box_layout.destroy();
    this.panel_button.destroy();
    workspaceManager.disconnect(this._workspaceSwitchedId);
    workspaceManager.disconnect(this._workspaceAddedId);
    workspaceManager.disconnect(this._workspaceRemovedId);
  }

  generate_workspaces() {
    this.destroy_indicators();
    let active_index = workspaceManager.get_active_workspace_index();
    let i = 0;

    for (; i < workspaceManager.get_n_workspaces(); i++) {
      let workspace = workspaceManager.get_workspace_by_index(i);
      if (workspace !== null) {
        let indicator = new WorkspaceIndicator(workspace, i == active_index);

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
}

function init() {
  return new WorkspaceLayout();
}
