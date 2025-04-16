import {
  BrowserRouter as Router, // Ensure BrowserRouter is imported
} from "react-router-dom";
import "./App.css";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <PublicRoute />
    </Router>
  );
}

export default App;
