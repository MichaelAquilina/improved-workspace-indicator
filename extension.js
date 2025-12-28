import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Meta from "gi://Meta";
import St from "gi://St";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

const workspaceManager = global.workspace_manager;

// workspace switch to previous / next
function workspace_switch(step, scroll_wrap) {
  let active_index = workspaceManager.get_active_workspace_index();
  let workspace_count = workspaceManager.get_n_workspaces();

  let target_index = (active_index + step + workspace_count) % workspace_count;
  if (!scroll_wrap) {
    if (active_index + step >= workspace_count || active_index + step < 0)
      target_index = active_index;
  }

  workspaceManager
    .get_workspace_by_index(target_index)
    .activate(global.get_current_time());
}

let WorkspaceIndicator = GObject.registerClass(
  class WorkspaceIndicator extends St.Button {
    _init(workspace, active, window_changed_callback, skip_taskbar_mode, change_on_click) {
      super._init();
      this.active = active;
      this.workspace = workspace;
      this.skip_taskbar_mode = skip_taskbar_mode;
      this.window_changed_callback = window_changed_callback

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

      this._widget.add_child(this._statusLabel);

      this._thumbnailsBox = new St.BoxLayout({
        style_class: "panel-workspace-indicator-box",
        y_expand: true,
        reactive: true,
      });

      this._widget.add_child(this._thumbnailsBox);
      this.add_child(this._widget);

      // Connect signals
      this._windowAddedId = this.workspace.connect("window-added", () => {
        this.window_changed_callback();
      });
      this._windowRemovedId = this.workspace.connect("window-removed", () => {
        this.window_changed_callback();
      });

      if (change_on_click) {
        this.connect("clicked", () =>
          this.workspace.activate(global.get_current_time()),
        );
      }

      this.show_or_hide();
    }

    show_or_hide() {
      if (this.active || this.has_user_window()) {
        this.show();
        return true;
      } else {
        this.hide();
        return false;
      }
    }

    has_user_window() {
      let windows = this.workspace.list_windows();

      // Exclude windows that appear on all workspaces; they would make
      // every workspace look non-empty and defeat the purpose.
      windows = windows.filter((w) => {
        if (typeof w.is_on_all_workspaces === "function") {
          return !w.is_on_all_workspaces();
        }
        return true;
      });

      // When GNOME is configured with workspaces only on the primary monitor,
      // windows on secondary monitors are shown on all workspaces. Filter them
      // out so we only count windows on the primary monitor for visibility.
      try {
        const mutterSettings = Gio.Settings.new("org.gnome.mutter");
        const workspacesOnlyOnPrimary = mutterSettings.get_boolean(
          "workspaces-only-on-primary",
        );
        if (workspacesOnlyOnPrimary && global.display) {
          const primaryMonitorIndex = global.display.get_primary_monitor();
          windows = windows.filter((w) => {
            if (typeof w.get_monitor === "function") {
              return w.get_monitor() === primaryMonitorIndex;
            }
            return true;
          });
        }
      } catch (_e) {
        // If schema is unavailable, proceed without primary-only filtering.
      }

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
  },
);

export default class WorkspaceLayout extends Extension {
  constructor(metadata) {
    super(metadata);
  }

  enable() {
    this.indicators = [];
    this.panel_button = null;
    this.box_layout = null;
    this.themeContext = St.ThemeContext.get_for_stage(global.stage);
    this.settings = this.getSettings();

    // Custom CSS file
    this.css_file = null;

    // Custom CSS stylesheet path
    this.custom_css_path = this.settings.get_string("custom-css-path");

    if (this.custom_css_path !== "") {
      if (GLib.file_test(this.custom_css_path, GLib.FileTest.EXISTS) == true) {
        this.themesLoaded = this.themeContext
          .get_theme()
          .get_custom_stylesheets();

        for (let i = 0; i < this.themesLoaded.length; i++) {
          this.themeContext.get_theme().unload_stylesheet(this.themesLoaded[i]);
        }

        this.css_file = Gio.File.new_for_path(this.custom_css_path);
        this.themeContext.get_theme().load_stylesheet(this.css_file);
      } else {
        this.settings.set_string("custom-css-path", "");
      }
    }

    Gio.SettingsSchemaSource.new_from_directory(
      this.dir.get_child("schemas").get_path(),
      Gio.SettingsSchemaSource.get_default(),
      false,
    );

    this._panelPositionChangedId = this.settings.connect(
      "changed::panel-position",
      () => {
        this.add_panel_button();
      },
    );

    this._skipTaskbarModeChangedId = this.settings.connect(
      "changed::skip-taskbar-mode",
      () => {
        this.add_panel_button();
      },
    );
    this._changeOnClickChangedId = this.settings.connect(
      "changed::change-on-click",
      () => {
        this.add_panel_button();
      },
    );
    //scroll to change workspace
    this._changeOnScrollChangedId = this.settings.connect(
      "changed::change-on-scroll",
      () => {
        this.add_panel_button();
      },
    );
    //scroll wraparound
    this._wrapScrollChangeId = this.settings.connect(
      "changed::wrap-scroll",
      () => {
        this.add_panel_button();
      },
    );
    this._hideActivitiesChangeId = this.settings.connect(
      "changed::hide-activities",
      () => {
        this.add_panel_button();
      },
    );
    this._hideSingleWorkspacesChangeId = this.settings.connect(
      "changed::hide-single-workspaces",
      () => {
        this.add_panel_button();
      },
    );

    this.add_panel_button();
  }

  disable() {
    this.destroy_indicators();
    this.destroy_panel_button();

    if (this.settings.get_boolean("hide-activities")) {
      Main.panel.statusArea.activities.show();
    }

    workspaceManager.disconnect(this._workspaceSwitchedId);
    workspaceManager.disconnect(this._workspaceAddedId);
    workspaceManager.disconnect(this._workspaceRemovedId);
    workspaceManager.disconnect(this._workspaceReordered);
    this.settings.disconnect(this._panelPositionChangedId);
    this.settings.disconnect(this._skipTaskbarModeChangedId);
    this.settings.disconnect(this._changeOnClickChangedId);
    this.settings.disconnect(this._wrapScrollChangeId);
    this.settings.disconnect(this._changeOnScrollChangedId);
    this.settings.disconnect(this._hideActivitiesChangeId);
    this.settings.disconnect(this._hideSingleWorkspacesChangeId);
    if (this.css_file !== null) {
      this.themeContext.get_theme().unload_stylesheet(this.css_file);
    }
    this.settings = null;
  }

  add_panel_button() {
    this.destroy_panel_button();
    this.panel_button = new PanelMenu.Button(
      0.0,
      _("Improved Workspace Indicator"),
    );
    this.box_layout = new St.BoxLayout();
    this.panel_button.add_child(this.box_layout);

    let change_on_scroll = this.settings.get_boolean("change-on-scroll");
    if (change_on_scroll) {
      let scroll_wrap = this.settings.get_boolean("wrap-scroll");
      this.panel_button.connect("scroll-event", (_, event) => {
        let switch_step = 0;
        switch (event.get_scroll_direction()) {
          case Clutter.ScrollDirection.UP:
            switch_step = -1;
            break;
          case Clutter.ScrollDirection.DOWN:
            switch_step = +1;
            break;
        }

        if (switch_step) workspace_switch(switch_step, scroll_wrap);
      });
    }

    let [position] = this.settings.get_value("panel-position").get_string();
    Main.panel.addToStatusArea(
      "improved-workspace-indicator",
      this.panel_button,
      0,
      position,
    );

    if (this.settings.get_boolean("hide-activities")) {
      Main.panel.statusArea.activities.hide();
    } else {
      Main.panel.statusArea.activities.show();
    }

    this._workspaceSwitchedId = workspaceManager.connect_after(
      "workspace-switched",
      this.add_indicators.bind(this),
    );
    this._workspaceAddedId = workspaceManager.connect_after(
      "workspace-added",
      this.add_indicators.bind(this),
    );
    this._workspaceRemovedId = workspaceManager.connect_after(
      "workspace-removed",
      this.add_indicators.bind(this),
    );
    this._workspaceReordered = workspaceManager.connect_after(
      "workspaces-reordered",
      this.add_indicators.bind(this),
    );

    this.add_indicators();
  }

  add_indicators() {
    this.destroy_indicators();
    let active_index = workspaceManager.get_active_workspace_index();

    for (let i = 0; i < workspaceManager.get_n_workspaces(); i++) {
      let workspace = workspaceManager.get_workspace_by_index(i);
      if (workspace !== null) {
        let indicator = new WorkspaceIndicator(
          workspace,
          i == active_index,
          () => this.show_or_hide_indicators(),
          this.settings.get_boolean("skip-taskbar-mode"),
          this.settings.get_boolean("change-on-click"),
        );

        this.box_layout.add_child(indicator);
        this.indicators.push(indicator);
      }
    }
    this.show_or_hide_indicators();
  }

  show_or_hide_indicators() {
    let hide_single_workspaces = this.settings.get_boolean("hide-single-workspaces");

    let count = 0;
    for(let indicator of this.indicators) {
      if (indicator.show_or_hide()) {
        count += 1;
      }
    }

    if (hide_single_workspaces && count <= 1) {
      this.panel_button.hide();
    } else {
      this.panel_button.show();
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
