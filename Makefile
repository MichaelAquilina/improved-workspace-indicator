compile:
	glib-compile-schemas schemas

install: compile
	rm -rf ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io
	cp -r $$PWD ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io

package: compile
	rm -f *.zip
	zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
