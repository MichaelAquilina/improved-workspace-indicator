// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
/* exported init enable disable */

const { Clutter, Gio, GObject, Meta, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const workspaceManager = global.workspace_manager;

let WorkspaceIndicator = GObject.registerClass(
class WorkspaceIndicator extends PanelMenu.Button {
    _init(workspace, active) {
        super._init(0.0, _('Workspace Indicator'));
        this.active = active;
        this.workspace = workspace;
        this._windowAddedId = this.workspace.connect('window-added', this.window_added.bind(this));
        this._windowRemovedId = this.workspace.connect('window-removed', this.window_removed.bind(this));

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
        this.workspace.disconnect(this._windowRemovedId);
        this.workspace.disconnect(this._windowAddedId);
    }
});


class WorkspaceLayout {
    constructor() {
        this._indicators = [];
    }

    enable() {
        this.generate_workspaces();
        this._workspaceSwitchedId = workspaceManager.connect_after('workspace-switched', this.generate_workspaces.bind(this));
        this._workspaceAddedId = workspaceManager.connect_after('workspace-added', this.generate_workspaces.bind(this));
        this._workspaceRemovedId = workspaceManager.connect_after('workspace-removed', this.generate_workspaces.bind(this));
    }

    disable() {
        this.destrory_workspaces();
        workspaceManager.disconnect(this._workspaceSwitchedId);
        workspaceManager.disconnect(this._workspaceAddedId);
        workspaceManager.disconnect(this._workspaceRemovedId);
    }

    generate_workspaces() {
        this.destrory_workspaces();
        let active_index = workspaceManager.get_active_workspace_index();
        let i = workspaceManager.get_n_workspaces();
        for (; i >= 0; i--) {
            let workspace = workspaceManager.get_workspace_by_index(i);
            if (workspace !== null) {
                let indicator = new WorkspaceIndicator(workspace, i == active_index);
                this._indicators.push(indicator);
                Main.panel.addToStatusArea(`workspace-indicator-${i}`, indicator);
            }
        }
    }

    destrory_workspaces() {
        let i = 0;
        for(; i < this._indicators.length; i++) {
            this._indicators[i].destroy();
        }
        this._indicators = [];
    }
}

function init() {
    return new WorkspaceLayout();
}
