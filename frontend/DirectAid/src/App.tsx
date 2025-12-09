import AppRouter from "./router/AppRouter.tsx";
import { AppProvider } from "./contexts/AppContext";

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
