import "./index.css";
import { listTemplates } from "./templatesList";
import TemplateIndicator from "./components/templateIndicator";

export default function App() {
  return (
    <div className="App">
      <TemplateIndicator templates={listTemplates} />
    </div>
  );
}
