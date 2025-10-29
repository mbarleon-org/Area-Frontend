import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ROUTES from './constants/Router';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-white">
        <Routes>
          {ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
