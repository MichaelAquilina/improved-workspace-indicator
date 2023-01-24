## How to use custom CSS stylesheet

You can use custom CSS stylesheets to change a look of workspace indicator widget.

#### 1. Write your own CSS stylesheet

As a base, use [stylesheet.css](./stylesheet.css), as it has all classes needed to create a custom stylesheet for Improved Workspace Indicator.

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

Open extension's preferences and locate `Custom CSS stylesheet` row. Now either click on folder button which will open a file chooser dialog, or paste a path of your stylesheet file into textbox.

#### 3. Reload an extension

Close preferences window and re-enable extension by toggling an switch in extensions manager.

> **Note**
> You can disable custom CSS by removing an path from textbox in preferences window.