## Improved Workspace Indicator
[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][gextension]

GNOME Shell extension that provides a workspace indicator more similar to i3/sway.

Namely:

- it shows all _in use_ workspaces
- it highlights the currently active workspace

![Screenshot](screenshot.png)


## Installing from source

Run `make install`

## How to use custom CSS stylesheet

You can use a custom CSS stylesheet to change a look of workspace indicator widget.

#### 1. Write your own CSS stylesheet

As a base, use [stylesheet.css](./stylesheet.css), as it has all classes needed to create a custom stylesheet for IWI.

> **Note**
> Creating custom CSS stylesheets might require from you some actual knowledge of CSS. You can check [this](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps) tutorial on MDN to learn basics of CSS.

<details open>
<summary>Which parts of a stylesheet you would want to modify:</summary>

#### Workspace indicator
```css
.panel-workspace-indicator,
.panel-workspace-indicator-box .workspace {
  border: 1px solid #cccccc;
  background-color: rgba(200, 200, 200, 0.5);
}
```
###### Located in lines [13-17](https://github.com/MichaelAquilina/improved-workspace-indicator/blob/b03afe9d3fe562c418ff25967e61eded67bf17c6/stylesheet.css#L13-L17)

In this part you can customize a look of a single workspace indicator, as well as colors for an inactive workspace.

#### Active workspace
```css
.workspace-indicator-active {
  background-color: rgba(20, 200, 200, 0.5);
}
```
###### Located in lines [28-30](https://github.com/MichaelAquilina/improved-workspace-indicator/blob/b03afe9d3fe562c418ff25967e61eded67bf17c6/stylesheet.css#L28-L30)

Here you can change properties of an active workspace indicator.

</details>

#### 2. Choose your custom stylesheet in extension's preferences

Open IWI's preferences and locate `Custom CSS stylesheet` row. Now either click on folder button which will open a file chooser dialog, or paste a path of your stylesheet file into textbox.

#### 3. Reload an extension

Close IWI's preferences window and re-enable extension by toggling an switch in extensions manager.

> **Note**
> You can disable custom CSS by removing an path from textbox in preferences window.


## Publishing a new version

1. Compile the schema

```shell
glib-compile-schemas schemas
```

2. Zip up the contents

```shell
rm *.zip && zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
```

3. Upload a new version to https://extensions.gnome.org/upload/

[gextension]: https://extensions.gnome.org/extension/3968/improved-workspace-indicator/
