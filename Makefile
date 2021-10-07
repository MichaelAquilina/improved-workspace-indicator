install:
	glib-compile-schemas schemas
	rm -rf ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io
	cp -r $$PWD ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io
