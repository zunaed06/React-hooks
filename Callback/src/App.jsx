import { useCallback, useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import Title from "./Title";
import Button from "./Button";
import ShowCount from "./ShowCount";

function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const increamentbyOne = useCallback(() => {
    setCount1((prev) => prev + 1);
  },[]);

  const increamentbyFive = useCallback(() => {
    setCount2((prev) => prev + 1);
  },[]);

  return (
    <>
      <div>
        <Title/>  
        <ShowCount count={count1} title="Counter 1"></ShowCount>
        <Button handleClick={increamentbyOne}>Increament by one</Button>
        <hr/>
        <ShowCount count={count2} title="Counter 2"></ShowCount>
        <Button handleClick={increamentbyFive}>Increament by Five </Button>
      </div>
    </>
  );
}

export default App;
