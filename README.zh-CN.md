[English](./README.md)

# Power Color - Figma 插件

Power Color 是一款功能强大的 Figma 插件，旨在简化您的色彩工作流。您可以从单一基础色生成完整的调色板，创建和谐的配色方案，并立即将它们导出为 Figma 变量、样式指南或用于开发项目的代码片段。

![Power Color 插件截图](https://raw.githubusercontent.com/kazemai/power-color-figma/main/cover.png)

## ✨ 功能特性

- **🎨 多功能调色板生成**: 在不同模式下创建调色板：
  - **色阶 (Shades)**: 从一个基础色生成完整的色阶和色调。
  - **和谐配色 (Harmonic)**: 即时创建互补色、近似色或三元色配色方案。
- **⚙️ 精准色彩控制**: 使用十六进制（Hex）代码输入或 HSL 滑块微调您的基础色。想试试手气？点击刷新按钮即可获得一个精心挑选的随机颜色。
- **🚀 Figma 集成**:
  - **创建变量 (Create Variables)**: 一键从您的调色板自动生成一个新的 Figma 色彩变量集合。
  - **插入样式指南 (Insert Style Guide)**: 在您的文档中添加一个即用型的样式指南框架，显示所有颜色及其名称和代码。
- **💻 代码导出**:
  - 以多种格式将您的调色板直接复制到剪贴板：**CSS 变量**、**SCSS 变量** 和 **JSON**。
  - 无缝的一键复制体验。

## 🛠️ 安装与开发

要在本地开始开发此插件：

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/kazemai/power-color-figma.git
    cd power-color-figma
    ```

2.  **安装依赖:**
    本项目使用 `pnpm` 作为包管理器。
    ```bash
    pnpm install
    ```

3.  **启动开发服务器:**
    此命令将监视文件更改并自动重新构建插件。
    ```bash
    pnpm run watch
    ```

4.  **在 Figma 中加载插件:**
    - 打开 Figma 桌面客户端。
    - 前往 `Plugins` > `Development` > `Import plugin from manifest...`
    - 选择本项目 `dist` 文件夹中的 `manifest.json` 文件。
    - 您将在您的开发插件列表中看到“Power Color”，即可运行！

## 📜 可用脚本

- `pnpm run build`: 在 `dist` 文件夹中创建生产环境的构建版本。
- `pnpm run watch`: 启动具有实时重新加载功能的开发模式。
- `pnpm run lint`: 使用 ESLint 进行代码检查。
- `pnpm run lint:fix`: 使用 ESLint 检查代码并自动修复问题。

## 🤝 贡献

欢迎各种贡献！如果您有任何建议或发现错误，请随时提交 issue 或 pull request。

## 📄 许可证

本项目基于 MIT 许可证授权。 