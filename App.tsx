import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/common/queryClient';
import AppNavigator from './src/navigations/AppNavigator';


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppNavigator />
  </QueryClientProvider>
);

export default App;
