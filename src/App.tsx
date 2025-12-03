import React from 'react';
import ROUTES from './constants/Router';

const isWeb = typeof document !== 'undefined';

const App: React.FC = () => {
  const Router = isWeb ? require('react-router-dom').BrowserRouter : require('react-router').MemoryRouter;
  const RoutesComp = isWeb ? require('react-router-dom').Routes : require('react-router').Routes;
  const RouteComp = isWeb ? require('react-router-dom').Route : require('react-router').Route;

  const RouterC: any = Router;
  const RoutesAny: any = RoutesComp;
  const RouteAny: any = RouteComp;

  return (
    <RouterC>
      <div className="bg-white">
        <RoutesAny>
          {ROUTES.map(({ path, element }: any) => (
            <RouteAny key={path} path={path} element={element} />
          ))}
        </RoutesAny>
      </div>
    </RouterC>
  );
};

export default App;
