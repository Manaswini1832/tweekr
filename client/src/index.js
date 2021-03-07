import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App/App";
import { BaseContextProvider } from "./contexts/BaseContext/BaseContext";
import { AuthContextProvider } from "./contexts/AuthContext/AuthContext";
import { CurrCollContextProvider } from "./contexts/CurrCollContext/CurrCollContext";
import { CollecNamesContextProvider } from "./contexts/CollecNamesContext/CollecNamesContext";
import {AllTagsContextProvider} from "./contexts/AllTagsContext/AllTagsContext";
import {SearchTweetIdsContextProvider} from "./contexts/SearchTweetIdsContext/SearchTweetIdsContext";

ReactDOM.render(
    <BaseContextProvider>
      <AuthContextProvider>
        <CollecNamesContextProvider>
          <CurrCollContextProvider>
            <AllTagsContextProvider>
              <SearchTweetIdsContextProvider>
              <React.StrictMode>
                <App />
              </React.StrictMode>
              </SearchTweetIdsContextProvider>
              </AllTagsContextProvider>
            </CurrCollContextProvider>
          </CollecNamesContextProvider>
        </AuthContextProvider>
    </BaseContextProvider>,
  document.getElementById('root')
);
