import "./App.css";
import Button from "@mui/material/Button";

function Example() {
  return (
    <Button className="bg-blue-500 text-white hover:bg-blue-600">Save</Button>
  );
}

function App() {
  return (
    <>
      <h1>Vite + React</h1>
      <Example />
    </>
  );
}

export default App;
