[中文](./README.zh-CN.md)

# Power Color - Figma Plugin

Power Color is a powerful Figma plugin designed to streamline your color workflow. Generate comprehensive color palettes from a single base color, create beautiful harmonic color schemes, and instantly export them as Figma Variables, a style guide, or code snippets for your development projects.

![Power Color Plugin Screenshot](https://raw.githubusercontent.com/kazemai/power-color-figma/main/cover.png)

## ✨ Features

- **🎨 Versatile Palette Generation**: Create color palettes in different modes:
  - **Shades**: Generate a full spectrum of shades and tints from a base color.
  - **Harmonic**: Instantly create Complementary, Analogous, or Triadic color schemes.
- **⚙️ Precise Color Control**: Fine-tune your base color using Hex code input or HSL sliders. Feeling lucky? Hit the refresh button to get a random curated color.
- **🚀 Figma Integration**:
  - **Create Variables**: Automatically generate a new Figma Color Variable collection from your palette with one click.
  - **Insert Style Guide**: Add a ready-to-use style guide frame to your document, displaying all colors with their names and codes.
- **💻 Code Export**:
  - Export your palette directly to your clipboard in multiple formats: **CSS Variables**, **SCSS Variables**, and **JSON**.
  - A seamless one-click copy experience.

## 🛠️ Installation & Development

To get started with developing this plugin locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kazemai/power-color-figma.git
    cd power-color-figma
    ```

2.  **Install dependencies:**
    This project uses `pnpm` as the package manager.
    ```bash
    pnpm install
    ```

3.  **Start the development server:**
    This command will watch for file changes and automatically rebuild the plugin.
    ```bash
    pnpm run watch
    ```

4.  **Load the plugin in Figma:**
    - Open the Figma desktop app.
    - Go to `Plugins` > `Development` > `Import plugin from manifest...`
    - Select the `manifest.json` file located in the `dist` folder of this project.
    - You will see "Power Color" in your development plugins list, ready to run!

## 📜 Available Scripts

- `pnpm run build`: Creates a production-ready build in the `dist` folder.
- `pnpm run watch`: Starts the development build with live-reloading.
- `pnpm run lint`: Lints the code using ESLint.
- `pnpm run lint:fix`: Lints the code and automatically fixes issues.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or find a bug, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
