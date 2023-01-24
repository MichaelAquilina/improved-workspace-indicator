## Improved Workspace Indicator
[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][gextension]

Gnome shell extension that provides a workspace indicator more similar to i3/sway

Namely:

- it shows all _in use_ workspaces
- it highlights the currently active workspace

![Screenshot](screenshot.png)


## Installing from source

Run `make install`

## Publishing a new version

1. Compile the schema

```shell
glib-compile-schemas schemas
```

2. zip up the contents

```shell
rm *.zip && zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
```

3. upload a new version to https://extensions.gnome.org/upload/

[gextension]: https://extensions.gnome.org/extension/3968/improved-workspace-indicator/
