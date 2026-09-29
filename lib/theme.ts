export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "amz-theme";

/**
 * Runs in <head> before the first paint: a saved choice wins, otherwise the system setting.
 * Keep in sync with `preferredTheme` in components/layout/Theme.tsx.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
