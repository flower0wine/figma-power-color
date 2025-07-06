// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 500, height: 550, themeColors: true });

// Type for the message from the UI
type PluginMessage = 
  | { type: 'create-variables'; name: string; colors: { name: string, hex: string }[] }
  | { type: 'notify'; message: string; error?: boolean }
  | { type: 'export-code'; payload: { outputString: string } }
  | { type: 'insert-style-guide'; name: string; colors: { name: string, hex: string }[] };

function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  };
}

function hexToRgbString(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return "N/A";
    return `R ${Math.round(rgb.r * 255)} G ${Math.round(rgb.g * 255)} B ${Math.round(rgb.b * 255)}`;
}

async function createStyleGuide(name: string, colors: { name: string, hex: string }[]) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

    const parentFrame = figma.createFrame();
    parentFrame.name = `${name} - Style Guide`;
    parentFrame.layoutMode = "VERTICAL";
    parentFrame.paddingTop = 32;
    parentFrame.paddingRight = 32;
    parentFrame.paddingBottom = 32;
    parentFrame.paddingLeft = 32;
    parentFrame.itemSpacing = 16;
    parentFrame.primaryAxisSizingMode = 'AUTO';
    parentFrame.counterAxisSizingMode = 'AUTO';

    const title = figma.createText();
    title.fontName = { family: "Inter", style: "Bold" };
    title.characters = name;
    title.fontSize = 24;
    parentFrame.appendChild(title);

    for (const color of colors) {
        const colorFrame = figma.createFrame();
        colorFrame.name = `Color: ${color.name}`;
        colorFrame.layoutMode = "HORIZONTAL";
        colorFrame.primaryAxisSizingMode = 'AUTO';
        colorFrame.counterAxisSizingMode = 'AUTO';
        colorFrame.itemSpacing = 16;
        // Correct property for vertical alignment in a horizontal auto-layout frame
        colorFrame.counterAxisAlignItems = 'CENTER';
        parentFrame.appendChild(colorFrame);

        const swatch = figma.createRectangle();
        swatch.name = "Swatch";
        swatch.resize(60, 60);
        const rgb = hexToRgb(color.hex);
        if (rgb) {
            swatch.fills = [{ type: 'SOLID', color: rgb }];
        }
        swatch.cornerRadius = 4;
        colorFrame.appendChild(swatch);
        
        const infoFrame = figma.createFrame();
        infoFrame.name = "Info";
        infoFrame.layoutMode = "VERTICAL";
        infoFrame.primaryAxisSizingMode = 'AUTO';
        infoFrame.counterAxisSizingMode = 'AUTO';
        infoFrame.itemSpacing = 4;
        colorFrame.appendChild(infoFrame);

        const nameText = figma.createText();
        nameText.fontName = { family: "Inter", style: "Bold" };
        nameText.characters = color.name;
        infoFrame.appendChild(nameText);

        const hexText = figma.createText();
        hexText.fontName = { family: "Inter", style: "Regular" };
        hexText.characters = color.hex.toUpperCase();
        infoFrame.appendChild(hexText);
        
        const rgbText = figma.createText();
        rgbText.fontName = { family: "Inter", style: "Regular" };
        rgbText.characters = hexToRgbString(color.hex);
        rgbText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        infoFrame.appendChild(rgbText);
    }
    
    figma.currentPage.appendChild(parentFrame);
    figma.viewport.scrollAndZoomIntoView([parentFrame]);
}

// This function creates the variable collection and all the color variables within it.
// It's marked as async to ensure the main thread waits for it to complete.
async function createColorVariables(name: string, colors: { name: string; hex: string }[]) {
  const collection = figma.variables.createVariableCollection(name);

  for (const color of colors) {
    const rgb = hexToRgb(color.hex);
    console.log(name, color);
    
    if (rgb) {
      // The variable name should just be its specific identifier (e.g., "50", "100").
      // The grouping is handled by the collection it belongs to.
      // Including a "/" in the name was likely causing the creation to fail silently.
      const variableName = color.name.trim();
      const newVariable = figma.variables.createVariable(variableName, collection, 'COLOR');
      console.log(newVariable, variableName);
      
      newVariable.setValueForMode(collection.defaultModeId, { r: rgb.r, g: rgb.g, b: rgb.b });
    }
  }
}

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'create-variables') {
    const { name, colors } = msg;
    
    // We wrap the logic in a try...catch block to handle any potential errors during creation.
    try {
      // Await the creation process. This helps prevent a race condition where the plugin
      // closes before Figma has fully processed the variable creation.
      await createColorVariables(name, colors);
      figma.notify(`Color palette "${name}" created successfully.`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred';
      figma.notify(`Error: ${message}`, { error: true });
    }
    
  } else if (msg.type === 'notify') {
    figma.notify(msg.message, { error: msg.error || false });
  } else if (msg.type === 'export-code') {
    // The clipboard API is not available in the sandbox, so we show the code
    // in a notification for the user to copy manually.
    figma.notify(msg.payload.outputString, { timeout: 15000 }); // 15 seconds
  } else if (msg.type === 'insert-style-guide') {
    const { name, colors } = msg;
    
    try {
        await createStyleGuide(name, colors);
        figma.notify("Style guide created successfully!");
    } catch(e) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred';
        figma.notify(`Error creating style guide: ${message}`, { error: true });
    }
    // We don't close the plugin here, allowing the user to continue working.
  }

};
