run-nested-session: install
	dbus-run-session -- gnome-shell --devkit --wayland

format:
	npx prettier@3.7.4 -w .

install:
	rm -rf ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io
	cp -r $$PWD ~/.local/share/gnome-shell/extensions/improved-workspace-indicator@michaelaquilina.github.io

package:
	rm -f *.zip
	zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
