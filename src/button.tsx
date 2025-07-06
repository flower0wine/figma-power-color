import { Button as FigmaButton } from "figma-kit";

interface FigmaButtonProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  ...props
}: FigmaButtonProps) {
  return (
    <FigmaButton
      style={{
        width: "100%",
        color: "var(--figma-color-text-onbrand)",
        backgroundColor: "var(--figma-color-bg-brand)",
        outlineOffset: "0px",
        borderRadius: "4px",
      }}
      {...props}
    >
      {children}
    </FigmaButton>
  );
}