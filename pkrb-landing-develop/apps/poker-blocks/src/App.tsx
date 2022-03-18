import { useRoutes } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme/theme";
import { routes } from "./routes/routes";
import { useLanguage } from "./contexts/language/LanguageContextProvider";
import { IntlProvider } from "react-intl";
import { frMessage } from "./languages/fr/index";
import { enMessage } from "./languages/en-us/index";

function App() {
  const routing = useRoutes(routes);
  const { activeLanguage } = useLanguage();
  const activeMessage = activeLanguage === "Fr" ? frMessage : enMessage;

  return (
    <IntlProvider
      messages={activeMessage}
      locale={activeLanguage}
      defaultLocale="Fr"
    >
      <ThemeProvider theme={theme}>{routing}</ThemeProvider>
    </IntlProvider>
  );
}

export default App;
