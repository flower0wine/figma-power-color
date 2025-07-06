import { useState, useEffect, useCallback } from 'react';
import { Input, Select } from 'figma-kit';
import Button from './button';
import { FiRefreshCw, FiLock, FiUnlock } from 'react-icons/fi';
import './ui.css';

const curatedColors = [
    { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' }, 
    { name: 'Amber', hex: '#eab308' }, { name: 'Lime', hex: '#84cc16' },
    { name: 'Green', hex: '#22c55e' }, { name: 'Emerald', hex: '#10b981' },
    { name: 'Cyan', hex: '#06b6d4' }, { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Blue', hex: '#3b82f6' }, { name: 'Indigo', hex: '#6366f1' },
    { name: 'Violet', hex: '#8b5cf6' }, { name: 'Fuchsia', hex: '#d946ef' },
    { name: 'Pink', hex: '#db2777' }, { name: 'Rose', hex: '#be185d' },
    { name: 'Red-900', hex: '#7f1d1d' }, { name: 'Blue-900', hex: '#1e3a8a' },
    { name: 'Green-900', hex: '#365314' }
];

const shadeLightness: { [key: string]: number } = {
    "50": 95, "100": 90, "200": 79, "300": 66, "400": 55, "500": 44,
    "600": 34, "700": 27, "800": 23, "900": 17, "950": 10
};

// --- Helper Color Conversion Functions ---
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function getContrastYIQ(hex: string): string {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333' : 'white';
}

function copyTextToClipboard(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.position = 'absolute';
  textArea.style.left = '-9999px';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy', err);
  }

  document.body.removeChild(textArea);
  return success;
}


function App() {
    const [hex, setHex] = useState('#104635');
    const [h, setH] = useState(161);
    const [s, setS] = useState(62);
    const [l, setL] = useState(17);
    const [paletteName, setPaletteName] = useState('Sherwood Green');
    const [isNameLocked, setIsNameLocked] = useState(false);
    const [harmonyMode, setHarmonyMode] = useState('shades');
    const [exportFormat, setExportFormat] = useState('css');
    const [generatedColors, setGeneratedColors] = useState<{ name: string | number, hex: string, isBase: boolean }[]>([]);

    const updateFromHex = (newHex: string) => {
        const rgb = hexToRgb(newHex);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            setHex(newHex);
            setH(hsl.h);
            setS(hsl.s);
            setL(hsl.l);
        } else {
            setHex(newHex); // allow invalid hex temporarily
        }
    };
    
    const updateFromHsl = useCallback((newH: number, newS: number, newL: number) => {
        const newHex = hslToHex(newH, newS, newL);
        setH(newH);
        setS(newS);
        setL(newL);
        setHex(newHex);
    }, []);

    useEffect(() => {
        updateFromHsl(h, s, l);
    }, [h, s, l, updateFromHsl]);
    
    // Generate Palette
    useEffect(() => {
        const colors: { name: string, hex: string, isBase: boolean }[] = [];
        if (harmonyMode === 'shades') {
            let closestShade = 900;
            let minDiff = 100;
            for (const shade in shadeLightness) {
                const diff = Math.abs(l - shadeLightness[shade]);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestShade = parseInt(shade);
                }
            }
            const l_base = l;
            const l_map_base = shadeLightness[closestShade.toString()];
            const l_diff = l_base - l_map_base;
            const s_base = s;
            const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
            shades.forEach(shadeKey => {
                let currentL = shadeLightness[shadeKey.toString()] + l_diff;
                currentL = Math.max(0, Math.min(100, currentL));
                let currentS = s_base;
                currentS = Math.max(0, Math.min(100, currentS));
                const newHex = hslToHex(h, currentS, currentL);
                colors.push({ name: shadeKey.toString(), hex: newHex, isBase: shadeKey === closestShade });
            });
        } else {
          colors.push({ name: 'Base', hex: hslToHex(h, s, l), isBase: true });
            if (harmonyMode === 'complementary') {
                const compH = (h + 180) % 360;
                colors.push({ name: 'Comp.', hex: hslToHex(compH, s, l), isBase: false });
            } else if (harmonyMode === 'analogous') {
                const an1H = (h + 30) % 360;
                const an2H = (h - 30 + 360) % 360;
                colors.push({ name: 'Analog. 1', hex: hslToHex(an1H, s, l), isBase: false });
                colors.push({ name: 'Analog. 2', hex: hslToHex(an2H, s, l), isBase: false });
            } else if (harmonyMode === 'triadic') {
                const t1H = (h + 120) % 360;
                const t2H = (h + 240) % 360;
                colors.push({ name: 'Triad 1', hex: hslToHex(t1H, s, l), isBase: false });
                colors.push({ name: 'Triad 2', hex: hslToHex(t2H, s, l), isBase: false });
            }
        }
        setGeneratedColors(colors);
    }, [h, s, l, harmonyMode]);
    
    const handleRefresh = () => {
        const randomColor = curatedColors[Math.floor(Math.random() * curatedColors.length)];
        updateFromHex(randomColor.hex);
        if (!isNameLocked) {
            setPaletteName(randomColor.name);
        }
    };
    
    const handlePostMessage = (type: string, payload: Record<string, unknown>) => {
        parent.postMessage({ pluginMessage: { type, ...payload } }, '*');
    };

    const handleCreateVariables = () => {
        handlePostMessage('create-variables', { name: paletteName || 'Power Color Palette', colors: generatedColors });
    };
    
    const handleInsertStyleGuide = () => {
        handlePostMessage('insert-style-guide', { name: paletteName || 'Power Color Palette', colors: generatedColors });
    };

    const handleExportCode = () => {
        let outputString = '';
        const sanitizedPaletteName = (paletteName || 'color').toLowerCase().replace(/\s+/g, '-');
        
        const colorsToExport = generatedColors.map(c => ({name: c.name.toString(), hex: c.hex}));

        if (exportFormat === 'css') {
            outputString = `:root {\n${colorsToExport.map(c => `  --${sanitizedPaletteName}-${c.name}: ${c.hex};`).join('\n')}\n}`;
        } else if (exportFormat === 'scss') {
            outputString = colorsToExport.map(c => `$${sanitizedPaletteName}-${c.name}: ${c.hex};`).join('\n');
        } else if (exportFormat === 'json') {
            const json = colorsToExport.reduce((acc, c) => ({...acc, [c.name]: c.hex}), {});
            outputString = JSON.stringify({ [sanitizedPaletteName]: json }, null, 2);
        }

        if (copyTextToClipboard(outputString)) {
            handlePostMessage('notify', { message: `Copied ${exportFormat.toUpperCase()} to clipboard!`, error: false });
        } else {
            // Fallback for when execCommand fails
            handlePostMessage('export-code', { outputString });
        }
    };
    
    const sGradient = `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`;
    const lGradient = `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;
    
    return (
      <div className="container">
        <div className="left-panel scroll-container">
          <div className="input-group">
            <label
              className="label"
              style={{
                textTransform: "uppercase",
                color: "var(--figma-color-text-secondary)",
              }}
            >
              Generator settings
            </label>
            <div className="input-group">
              <label className="label">Mode</label>
              <Select.Root
                defaultValue={harmonyMode}
                onValueChange={setHarmonyMode}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="shades">Shades</Select.Item>
                  <Select.Item value="complementary">Complementary</Select.Item>
                  <Select.Item value="analogous">Analogous</Select.Item>
                  <Select.Item value="triadic">Triadic</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="input-group">
              <label className="label">Hex code input</label>
              <div className="input-row">
                <Input
                  value={hex}
                  onValueChange={updateFromHex}
                  prefix={
                    <div
                      className="color-swatch-prefix"
                      style={{ backgroundColor: hex }}
                    ></div>
                  }
                />
                <div className="icon-button-wrapper" onClick={handleRefresh}>
                  <FiRefreshCw />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="label">HSL input</label>
              <div className="slider-group">
                <label htmlFor="h-slider" className="label">
                  H
                </label>
                <input
                  type="range"
                  id="h-slider"
                  min="0"
                  max="360"
                  value={h}
                  onChange={(e) => setH(parseInt(e.target.value))}
                />
                <span className="slider-value">{h}</span>
              </div>
              <div className="slider-group">
                <label htmlFor="s-slider" className="label">
                  S
                </label>
                <input
                  type="range"
                  id="s-slider"
                  min="0"
                  max="100"
                  value={s}
                  style={{ background: sGradient }}
                  onChange={(e) => setS(parseInt(e.target.value))}
                />
                <span className="slider-value">{s}</span>
              </div>
              <div className="slider-group">
                <label htmlFor="l-slider" className="label">
                  L
                </label>
                <input
                  type="range"
                  id="l-slider"
                  min="0"
                  max="100"
                  value={l}
                  style={{ background: lGradient }}
                  onChange={(e) => setL(parseInt(e.target.value))}
                />
                <span className="slider-value">{l}</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                className="label"
                style={{
                  textTransform: "uppercase",
                  color: "var(--figma-color-text-secondary)",
                }}
              >
                Export
              </label>
              <span className="pro-tag">Pro</span>
            </div>
            <div className="input-group">
              <label className="label">Name</label>
              <div className="input-row">
                <Input
                  value={paletteName}
                  onValueChange={setPaletteName}
                  disabled={isNameLocked}
                />
                <div
                  className="icon-button-wrapper"
                  onClick={() => setIsNameLocked(!isNameLocked)}
                >
                  {isNameLocked ? <FiLock /> : <FiUnlock />}
                </div>
              </div>
            </div>
            <Button
              onClick={handleCreateVariables}
            >
              Create variables
            </Button>
          </div>
          <div className="input-group">
            <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
              <div style={{ flexGrow: 1 }}>
                <Select.Root
                  defaultValue={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="css">CSS Variables</Select.Item>
                    <Select.Item value="scss">SCSS Variables</Select.Item>
                    <Select.Item value="json">JSON</Select.Item>
                  </Select.Content>
                </Select.Root>
              </div>
              <div style={{ flexGrow: 2 }}>
                <Button onClick={handleExportCode}>
                  Export Code
                </Button>
              </div>
            </div>
          </div>
          <div className="input-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                className="label"
                style={{
                  textTransform: "uppercase",
                  color: "var(--figma-color-text-secondary)",
                }}
              >
                Insert style guide
              </label>
              <span className="pro-tag">Pro</span>
            </div>
            <Button onClick={handleInsertStyleGuide}>
              Insert style guide
            </Button>
          </div>
        </div>
        <div className="right-panel scroll-container">
          {generatedColors.map((color) => {
            const textColor = getContrastYIQ(color.hex);
            return (
              <div
                key={color.name}
                className="color-item"
                style={{ backgroundColor: color.hex, color: textColor }}
                onClick={() => {
                  const textToCopy = color.hex.toUpperCase();
                  if (copyTextToClipboard(textToCopy)) {
                    handlePostMessage("notify", {
                      message: `Copied ${textToCopy} to clipboard`,
                      error: false
                    });
                  } else {
                     handlePostMessage("notify", {
                      message: `Failed to copy ${textToCopy}`,
                      error: true
                    });
                  }
                }}
              >
                <div className="color-info">
                  <div className="color-item-label">{color.name}</div>
                  {color.isBase && (
                    <div
                      className="base-indicator"
                      style={{
                        borderColor:
                          textColor === "white"
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(255,255,255,0.5)",
                      }}
                    ></div>
                  )}
                </div>
                <div className="color-item-hex">{color.hex.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
}

export default App; 