"use strict";

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  let gschema = Gio.SettingsSchemaSource.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    Gio.SettingsSchemaSource.get_default(),
    false
  );

  this.settings = new Gio.Settings({
    settings_schema: gschema.lookup(
      "org.gnome.shell.extensions.improved-workspace-indicator",
      true
    ),
  });

  let prefsWidget = new Gtk.Grid({
    margin: 18,
    column_spacing: 12,
    row_spacing: 12,
  });

  let title = new Gtk.Label({
    label: "<b>Improved Workspace Indicator Preferences</b>",
    halign: Gtk.Align.START,
    use_markup: true,
  });

  prefsWidget.attach(title, 0, 0, 2, 1);

  let panel_position_label = new Gtk.Label({
    label: "Panel Position",
    halign: Gtk.Align.START,
  });

  let panel_position_combo = new Gtk.ComboBoxText();
  panel_position_combo.append("left", "left");
  panel_position_combo.append("right", "right");

  panel_position_combo.active_id = this.settings.get_string("panel-position");

  prefsWidget.attach(panel_position_label, 0, 1, 2, 1);
  prefsWidget.attach(panel_position_combo, 2, 1, 2, 1);

  this.settings.bind(
    "panel-position",
    panel_position_combo,
    "active_id",
    Gio.SettingsBindFlags.DEFAULT
  );

  prefsWidget.show_all();

  return prefsWidget;
}
