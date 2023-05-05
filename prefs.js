"use strict";

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;

const Config = imports.misc.config;
const ShellVersion = parseFloat(Config.PACKAGE_VERSION);

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  this.settings = ExtensionUtils.getSettings();
  let prefsWidget;

  // gtk4 apps do not have a margin property
  if (ShellVersion >= 40) {
    prefsWidget = new Gtk.Grid({
      margin_start: 18,
      margin_end: 18,
      margin_top: 18,
      margin_bottom: 18,
      column_spacing: 12,
      row_spacing: 12,
    });
  } else {
    prefsWidget = new Gtk.Grid({
      margin: 18,
      column_spacing: 12,
      row_spacing: 12,
    });
  }

  let title = new Gtk.Label({
    label: "<b>Improved Workspace Indicator Preferences</b>",
    halign: Gtk.Align.START,
    use_markup: true,
  });

  prefsWidget.attach(title, 0, 0, 2, 1);

  // Panel Position Chooser

  let panel_position_label = new Gtk.Label({
    label: "Panel Position",
    halign: Gtk.Align.START,
  });

  let panel_position_combo = new Gtk.ComboBoxText();
  panel_position_combo.append("left", "left");
  panel_position_combo.append("right", "right");
  panel_position_combo.append("center", "center");

  panel_position_combo.active_id = this.settings.get_string("panel-position");

  prefsWidget.attach(panel_position_label, 0, 1, 2, 1);
  prefsWidget.attach(panel_position_combo, 2, 1, 2, 1);

  this.settings.bind(
    "panel-position",
    panel_position_combo,
    "active_id",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Skip Taskbar Mode Selector

  let skip_taskbar_mode_label = new Gtk.Label({
    label:
      "Ignore Taskbar-Skipped Windows\r" +
      "<small>These include hidden windows from the desktop-icons-ng extension.</small>",
    halign: Gtk.Align.START,
    use_markup: true,
  });

  let skip_taskbar_mode_toggle = new Gtk.Switch({
    active: this.settings.get_boolean("skip-taskbar-mode"),
    valign: Gtk.Align.CENTER,
    halign: Gtk.Align.END,
    visible: true,
  });

  prefsWidget.attach(skip_taskbar_mode_label, 0, 2, 2, 1);
  prefsWidget.attach(skip_taskbar_mode_toggle, 2, 2, 2, 1);

  this.settings.bind(
    "skip-taskbar-mode",
    skip_taskbar_mode_toggle,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Enable / Disable change on click

  let change_on_click_label = new Gtk.Label({
    label: "Change workspace on indicator click",
    halign: Gtk.Align.START,
  });

  let change_on_click_toggle = new Gtk.Switch({
    active: this.settings.get_boolean("change-on-click"),
    halign: Gtk.Align.END,
    visible: true,
  });

  prefsWidget.attach(change_on_click_label, 0, 3, 2, 1);
  prefsWidget.attach(change_on_click_toggle, 2, 3, 2, 1);

  this.settings.bind(
    "change-on-click",
    change_on_click_toggle,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Scroll to change workspace

  let change_on_scroll_label = new Gtk.Label({
    label: "Change workspace on indicator mouse-scroll",
    halign: Gtk.Align.START,
  });

  let change_on_scroll_toggle = new Gtk.Switch({
    active: this.settings.get_boolean("change-on-scroll"),
    halign: Gtk.Align.END,
    visible: true,
  });

  prefsWidget.attach(change_on_scroll_label, 0, 4, 2, 1);
  prefsWidget.attach(change_on_scroll_toggle, 2, 4, 2, 1);

  this.settings.bind(
    "change-on-scroll",
    change_on_scroll_toggle,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Scroll wraparound

  let wrap_scroll_label = new Gtk.Label({
    label: "Wraparound workspace when mouse-scroll",
    halign: Gtk.Align.START,
  });
  let wrap_scroll_toggle = new Gtk.Switch({
    active: this.settings.get_boolean("wrap-scroll"),
    halign: Gtk.Align.END,
    visible: true,
  });

  prefsWidget.attach(wrap_scroll_label, 0, 5, 2, 1);
  prefsWidget.attach(wrap_scroll_toggle, 2, 5, 2, 1);

  this.settings.bind(
    "wrap-scroll",
    wrap_scroll_toggle,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Custom CSS stylesheet

  if (ShellVersion >= 42) {
    var custom_css_box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      css_classes: Array("linked"), // Style class in libadwaita
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });
  } else {
    var custom_css_box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 5,
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });
  }

  let custom_css_label = new Gtk.Label({
    label:
      "Custom CSS stylesheet\r" +
      "<small>You need to reload this extension to see the changes.</small>",
    halign: Gtk.Align.START,
    use_markup: true,
  });

  if (ShellVersion < 40) {
    let custom_css_help_image = new Gtk.Image({
      icon_name: "dialog-information-symbolic",
    });

    var custom_css_help = new Gtk.Button({
      image: custom_css_help_image,
      tooltip_text: "Click for more information",
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });
  } else {
    var custom_css_help = new Gtk.Button({
      icon_name: "dialog-information-symbolic",
      tooltip_text: "Click for more information",
      halign: Gtk.Align.END,
      valign: Gtk.Align.CENTER,
    });
  }

  custom_css_help.connect("clicked", () => {
    GLib.spawn_command_line_sync(
      "xdg-open https://github.com/MichaelAquilina/improved-workspace-indicator/blob/main/docs/how_to_custom_css.md",
    );
  });

  let custom_css_entry = new Gtk.Entry({
    tooltip_text: "Remove path from entry box to restore a original style.",
  });

  let css_entry_buffer = custom_css_entry.get_buffer();

  let custom_css_set_path = this.settings.get_string("custom-css-path");
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

  prefsWidget.connect("unrealize", () => {
    let custom_css_dest = css_entry_buffer.get_text();
    if (custom_css_dest !== this.settings.get_string("custom-css-path")) {
      if (
        GLib.file_test(custom_css_dest, GLib.FileTest.IS_REGULAR) == true ||
        custom_css_dest === ""
      ) {
        this.settings.set_string("custom-css-path", custom_css_dest);
      }
    }
  });

  if (ShellVersion < 40) {
    custom_css_box.pack_end(custom_css_entry, false, false, 0);
    custom_css_box.pack_end(custom_css_button, false, false, 0);
  } else {
    custom_css_box.append(custom_css_entry);
    custom_css_box.append(custom_css_button);
  }

  prefsWidget.attach(custom_css_label, 0, 6, 2, 1);
  prefsWidget.attach(custom_css_help, 1, 6, 1, 1);
  prefsWidget.attach(custom_css_box, 2, 6, 2, 1);

  // only gtk3 apps need to run show_all()
  if (ShellVersion < 40) {
    prefsWidget.show_all();
  }

  return prefsWidget;
}
