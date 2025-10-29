import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { negotiateLanguages } from "@fluent/langneg";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { LocalizationProvider, ReactLocalization } from "@fluent/react";
import { Localized } from "@fluent/react";
// Store all translations as a simple object which is available
// synchronously and bundled with the rest of the code.
const RESOURCES = {
  "en-US": new FluentResource("app = react app"),
};

// A generator function responsible for building the sequence
// of FluentBundle instances in the order of user's language
// preferences.

function* generateBundles(userLocales) {
  // Choose locales that are best for the user.
  const currentLocales = negotiateLanguages(
    userLocales,
    ["fr", "en-US", "pl"],
    { defaultLocale: "en-US" }
  );

  for (const locale of currentLocales) {
    const bundle = new FluentBundle(locale);
    bundle.addResource(RESOURCES[locale]);
    yield bundle;
  }
}

// The ReactLocalization instance stores and caches the sequence of generated
// bundles. You can store it in your app's state.
let l10n = new ReactLocalization(generateBundles(navigator.languages));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LocalizationProvider l10n={l10n}>
    <Localized id="app">
      <App />
    </Localized>
  </LocalizationProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
