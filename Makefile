install:
	glib-compile-schemas schemas
	rm -rf ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io
	cp -r $$PWD ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io

package:
	glib-compile-schemas schemas
	rm *.zip
	zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
