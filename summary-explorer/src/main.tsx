// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MantineProvider, ColorSchemeScript, localStorageColorSchemeManager } from '@mantine/core'
import { theme, cssVariablesResolver } from "./theme";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "app-color-scheme",
});

createRoot(document.getElementById('root')!).render(
  <>
    <ColorSchemeScript defaultColorScheme="light" />
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
      colorSchemeManager={colorSchemeManager}
    >
      <App />
    </MantineProvider>
  </>
)