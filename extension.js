// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
/* exported init enable disable */

const { Clutter, Gio, GObject, Meta, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const WORKSPACE_SCHEMA = 'org.gnome.desktop.wm.preferences';
const WORKSPACE_KEY = 'workspace-names';

let WorkspaceIndicator = GObject.registerClass(
class WorkspaceIndicator extends PanelMenu.Button {
    _init(workspace, active) {
        super._init(0.0, _('Workspace Indicator'));
        this.active = active;
        this.workspace = workspace;
        this.workspace.connect('window-added', this.window_added.bind(this));
        this.workspace.connect('window-removed', this.window_removed.bind(this));

        let container = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true,
        });
        this.add_actor(container);

        this._statusLabel = new St.Label({
            style_class: 'panel-workspace-indicator',
            y_align: Clutter.ActorAlign.CENTER,
            text: `${this.workspace.index() + 1}`,
        });

        if (this.active) {
            this._statusLabel.add_style_class_name('active');
        }

        container.add_actor(this._statusLabel);

        this._thumbnailsBox = new St.BoxLayout({
            style_class: 'panel-workspace-indicator-box',
            y_expand: true,
            reactive: true,
        });

        container.add_actor(this._thumbnailsBox);

        this.show_or_hide();
    }

    clicked() {
        this.workspace.activate();
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

    _onDestroy() {
        super._onDestroy();
    }
});

function init() {
    // ExtensionUtils.initTranslations();
}

let _indicators = [];
let workspaceManager = global.workspace_manager;

function enable() {
    generate_workspaces();
    workspaceManager.connect_after('workspace-switched', generate_workspaces);
    workspaceManager.connect_after('workspace-added', generate_workspaces);
    workspaceManager.connect_after('workspace-removed', generate_workspaces);
}

function generate_workspaces() {
    destrory_workspaces();
    let active_index = workspaceManager.get_active_workspace_index();
    let i = workspaceManager.get_n_workspaces();
    for (; i >= 0; i--) {
        let workspace = workspaceManager.get_workspace_by_index(i);
        if (workspace !== null) {
            indicator = new WorkspaceIndicator(workspace, i == active_index);
            _indicators.push(indicator);
            Main.panel.addToStatusArea(`workspace-indicator-${i}`, indicator);
        }
    }
}

function destrory_workspaces() {
    let i = 0;
    for(; i < _indicators.length; i++) {
        _indicators[i].destroy();
    }
    _indicators = [];
}

function disable() {
    destrory_workspaces();
}
