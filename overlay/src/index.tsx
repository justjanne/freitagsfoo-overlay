import React from 'react';
import ReactDOM from 'react-dom/client';
import {QueryClient, QueryClientProvider} from 'react-query';
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import Dock from "./ui/Dock";
import Source from "./ui/Source";
import {BroadcastChannelProvider} from "./useBroadcastChannel";
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Source/>,
  },
  {
    path: "/control",
    element: <Dock/>,
  },
]);

const queryClient = new QueryClient();

const channel = new BroadcastChannel("event-state");

root.render(
  <React.StrictMode>
    <BroadcastChannelProvider value={channel}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </BroadcastChannelProvider>
  </React.StrictMode>
);
