// theme.ts
import {
    createTheme,
    defaultVariantColorsResolver,
    type CSSVariablesResolver,
    type VariantColorsResolver,
} from "@mantine/core";

const variantColorResolver: VariantColorsResolver = (input) => {
    if (input.variant === "metadata") {
        return {
            background: "var(--app-metadata-bg)",
            hover: "var(--app-metadata-hover)",
            color: "var(--app-metadata-color)",
            border: "1px solid var(--app-metadata-border)",
        };
    }

    return defaultVariantColorsResolver(input);
};

const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},

    light: {
        "--app-page-bg": "#F6F8FB",
        "--app-header-bg": "#FFFFFF",

        "--app-card-bg": "#f8f8f8",
        "--app-card-border": "#D6DEE8",
        "--app-card-shadow": "0 1px 2px rgba(15, 23, 42, 0.06)",

        "--app-metadata-bg": "#DBEAFE",
        "--app-metadata-hover": "#BFDBFE",
        "--app-metadata-color": "#0F3D75",
        "--app-metadata-border": "rgba(37, 99, 235, 0.14)",
    },

    dark: {
        "--app-page-bg": "#1F1F1F",
        "--app-header-bg": "#242424",

        "--app-card-bg": "#2B2B2B",
        "--app-card-border": "rgba(255, 255, 255, 0.08)",
        "--app-card-shadow": "none",

        "--app-metadata-bg": "rgba(30, 58, 95, 0.55)",
        "--app-metadata-hover": "rgba(30, 58, 95, 0.72)",
        "--app-metadata-color": "#BFDBFE",
        "--app-metadata-border": "rgba(147, 197, 253, 0.22)",
    },
});

export const theme = createTheme({
    primaryColor: "blue",

    variantColorResolver,

    colors: {
        blue: [
            "#EFF6FF",
            "#DBEAFE",
            "#BFDBFE",
            "#93C5FD",
            "#60A5FA",
            "#3B82F6",
            "#2563EB",
            "#1D4ED8",
            "#1E40AF",
            "#1E3A8A",
        ],
    },

    defaultRadius: "md",

    components: {
        Card: {
            defaultProps: {
                withBorder: true,
                padding: "lg",
                radius: "md",
            },
            styles: {
                root: {
                    backgroundColor: "var(--app-card-bg)",
                    borderColor: "var(--app-card-border)",
                    boxShadow: "var(--app-card-shadow)",
                },
            },
        },

        Button: {
            defaultProps: {
                radius: "md",
            },
            styles: {
                root: {
                    fontWeight: 600,
                },
            },
        },

        ActionIcon: {
            defaultProps: {
                radius: "md",
            },
        },
    },
});

export { cssVariablesResolver };