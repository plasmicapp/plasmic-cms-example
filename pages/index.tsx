import * as React from "react";
import GlobalContextsProvider from "../components/plasmic/cms_example/PlasmicGlobalContextsProvider";
import { PlasmicHomepage } from "../components/plasmic/cms_example/PlasmicHomepage";

function Homepage() {
  return (
    <GlobalContextsProvider>
      <PlasmicHomepage />
    </GlobalContextsProvider>
  );
}

export default Homepage;
