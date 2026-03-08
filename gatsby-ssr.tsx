import React from "react";
import type { RenderBodyArgs } from "gatsby";

export const onRenderBody = ({ setHeadComponents }: RenderBodyArgs) => {
  setHeadComponents([
    <script
      key="theme-blocking-script"
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  try {
    var theme = localStorage.getItem('administration-theme');
    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
    if (!theme && supportDarkMode) theme = 'dark';
    if (!theme) theme = 'light';
    document.documentElement.setAttribute('data-theme', theme);
    window.__theme = theme;
  } catch (e) {}
})();
`,
      }}
    />,
  ]);
};
