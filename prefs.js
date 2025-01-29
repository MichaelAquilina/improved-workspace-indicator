"use strict";

import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

import * as Config from "resource:///org/gnome/Shell/Extensions/js/misc/config.js";
const ShellVersion = parseFloat(Config.PACKAGE_VERSION);

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class WorkspaceLayoutPref extends ExtensionPreferences {
  addWithLabel(label, widget) {
    let labelWidget = new Gtk.Label({
      label: label,
      halign: Gtk.Align.START,
      use_markup: true,
    });
    this.prefsWidget.attach(labelWidget, 0, this.currentRow, 2, 1);
    this.prefsWidget.attach(widget, 2, this.currentRow, 2, 1);

    this.currentRow++;
  }

  fillPreferencesWindow(window) {
    window.settings = this.getSettings();
    const page = new Adw.PreferencesPage();

    const group = new Adw.PreferencesGroup({
      title: _("<b>Improved Workspace Indicator Preferences</b>"),
    });

    // gtk4 apps do not have a margin property
    this.currentRow = 0;
    this.prefsWidget = new Gtk.Grid({
      margin_start: 18,
      margin_end: 18,
      margin_top: 18,
      margin_bottom: 18,
      column_spacing: 12,
      row_spacing: 12,
    });

    // Panel Position Chooser
    let panel_position_combo = new Gtk.ComboBoxText();
    panel_position_combo.append("left", "left");
    panel_position_combo.append("right", "right");
    panel_position_combo.append("center", "center");
    panel_position_combo.active_id =
      window.settings.get_string("panel-position");

    this.addWithLabel("Panel Position", panel_position_combo);

    window.settings.bind(
      "panel-position",
      panel_position_combo,
      "active_id",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Skip Taskbar Mode Selector
    let skip_taskbar_mode_toggle = new Gtk.Switch({
      active: window.settings.get_boolean("skip-taskbar-mode"),
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.END,
      visible: true,
    });

    this.addWithLabel(
      "Ignore Taskbar-Skipped Windows\r" +
        "<small>These include hidden windows from the desktop-icons-ng extension.</small>",
      skip_taskbar_mode_toggle,
    );

    window.settings.bind(
      "skip-taskbar-mode",
      skip_taskbar_mode_toggle,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Enable / Disable change on click

    let change_on_click_toggle = new Gtk.Switch({
      active: window.settings.get_boolean("change-on-click"),
      halign: Gtk.Align.END,
      visible: true,
    });

    this.addWithLabel(
      "Change workspace on indicator click",
      change_on_click_toggle,
    );

    window.settings.bind(
      "change-on-click",
      change_on_click_toggle,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Scroll to change workspace

    let change_on_scroll_toggle = new Gtk.Switch({
      active: window.settings.get_boolean("change-on-scroll"),
      halign: Gtk.Align.END,
      visible: true,
    });

    this.addWithLabel(
      "Change workspace on indicator mouse-scroll",
      change_on_scroll_toggle,
    );

    window.settings.bind(
      "change-on-scroll",
      change_on_scroll_toggle,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Scroll wraparound

    let wrap_scroll_toggle = new Gtk.Switch({
      active: window.settings.get_boolean("wrap-scroll"),
      halign: Gtk.Align.END,
      visible: true,
    });

    this.addWithLabel(
      "Wraparound workspace when mouse-scroll",
      wrap_scroll_toggle,
    );

    window.settings.bind(
      "wrap-scroll",
      wrap_scroll_toggle,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Hide Activities

    let hide_activities_toggle = new Gtk.Switch({
      active: window.settings.get_boolean("hide-activities"),
      halign: Gtk.Align.END,
      visible: true,
    });

    this.addWithLabel(
      "Hide Activities Widget in Status Bar",
      hide_activities_toggle,
    );

    window.settings.bind(
      "hide-activities",
      hide_activities_toggle,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Custom CSS stylesheet

    var custom_css_box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      css_classes: Array("linked"), // Style class in libadwaita
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });

    let custom_css_label = new Gtk.Label({
      label:
        "Custom CSS stylesheet\r" +
        "<small>You need to reload this extension to see the changes.</small>",
      halign: Gtk.Align.START,
      use_markup: true,
    });

    var custom_css_help = new Gtk.Button({
      icon_name: "dialog-information-symbolic",
      tooltip_text: "Click for more information",
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });

    custom_css_help.connect("clicked", () => {
      GLib.spawn_command_line_sync(
        "xdg-open https://github.com/MichaelAquilina/improved-workspace-indicator/blob/main/docs/how_to_custom_css.md",
      );
    });

    let custom_css_entry = new Gtk.Entry({
      tooltip_text: "Remove path from entry box to restore a original style.",
    });

    let css_entry_buffer = custom_css_entry.get_buffer();

    let custom_css_set_path = window.settings.get_string("custom-css-path");
    css_entry_buffer.set_text(custom_css_set_path, custom_css_set_path.length);

    function css_filechooser_open() {
      let dialog = new Gtk.FileChooserNative({
        title: "Choose a valid CSS stylesheet file",
        transient_for: null,
        modal: true,
        action: Gtk.FileChooserAction.OPEN,
      });

      let css_filter = new Gtk.FileFilter();
      css_filter.set_name("CSS stylesheet (*.css)");
      css_filter.add_mime_type("text/css");
      dialog.add_filter(css_filter);

      dialog.connect("response", (self, response) => {
        if (response === Gtk.ResponseType.ACCEPT) {
          let gfile = dialog.get_file();
          let file_path = gfile.get_path();
          css_entry_buffer.set_text(file_path, file_path.length);
        }
        dialog.destroy();
      });
      dialog.ref(); // File chooser closes itself if nobody is holding its ref
      dialog.show();
    }

    if (ShellVersion < 40) {
      let custom_css_button_image = new Gtk.Image({
        icon_name: "folder-symbolic",
      });

      var custom_css_button = new Gtk.Button({
        image: custom_css_button_image,
      });
    } else {
      var custom_css_button = new Gtk.Button({
        icon_name: "folder-symbolic",
      });
    }

    custom_css_button.connect("clicked", () => {
      css_filechooser_open();
    });

    this.prefsWidget.connect("unrealize", () => {
      let custom_css_dest = css_entry_buffer.get_text();
      if (custom_css_dest !== window.settings.get_string("custom-css-path")) {
        if (
          GLib.file_test(custom_css_dest, GLib.FileTest.IS_REGULAR) == true ||
          custom_css_dest === ""
        ) {
          window.settings.set_string("custom-css-path", custom_css_dest);
        }
      }
    });

    custom_css_box.append(custom_css_entry);
    custom_css_box.append(custom_css_button);

    this.prefsWidget.attach(custom_css_label, 0, this.currentRow, 2, 1);
    this.prefsWidget.attach(custom_css_help, 1, this.currentRow, 1, 1);
    this.prefsWidget.attach(custom_css_box, 2, this.currentRow, 2, 1);

    group.add(this.prefsWidget);
    page.add(group);

    window.add(page);
  }
}
