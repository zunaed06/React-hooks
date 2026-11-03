# Understanding React.memo() and useCallback()

This project demonstrates how React handles component re-rendering, function references, and state updates using `React.memo()` and `useCallback()`.

We have two counters, two buttons, and three child components:

- `Title`
- `ShowCount`
- `Button`

---

## 1. Project Structure

```text
src/
├── App.jsx
├── Button.jsx
├── ShowCount.jsx
├── Title.jsx
└── App.css
```

## 2. Understanding the Components

### Title.jsx

```jsx
import React from 'react';

const Title = () => {
    console.log('Rendering title ....');

    return (
        <div>
            <h1>Use callback hook tutorial</h1>
        </div>
    );
};

export default React.memo(Title);
```

`React.memo()` prevents this component from re-rendering when its parent re-renders, provided its props remain unchanged.

### ShowCount.jsx

```jsx
import React from 'react';

const ShowCount = ({ count, title }) => {
    console.log(`Rendering ${title}....`);

    return (
        <div>
            <p>{title} is {count}</p>
        </div>
    );
};

export default React.memo(ShowCount);
```

This component receives two props:

- `count`: The current counter value.
- `title`: The counter's name.

Because it uses `React.memo()`, it only re-renders when its props change (assuming no other reason forces it to render).

### Button.jsx

```jsx
import React from 'react';

const Button = ({ handleClick, children }) => {
    console.log(`Rendering button ${children}`);

    return (
        <div>
            <button type='button' onClick={handleClick}>
                {children}
            </button>
        </div>
    );
};

export default React.memo(Button);
```

This component receives:

- `handleClick`: The function executed when the button is clicked.
- `children`: The button's displayed text.

It is also wrapped in `React.memo()`.

---

## 3. Understanding App.jsx

```jsx
import { useCallback, useState } from "react";
import Title from "./Title";
import Button from "./Button";
import ShowCount from "./ShowCount";

function App() {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);

    const increamentbyOne = useCallback(() => {
        setCount1(prev => prev + 1);
    }, []);

    const increamentbyFive = useCallback(() => {
        setCount2(prev => prev + 1);
    }, []);

    return (
        <>
            <div>
                <Title />

                <ShowCount count={count1} title="Counter 1" />

                <Button handleClick={increamentbyOne}>
                    Increament by one
                </Button>

                <hr />

                <ShowCount count={count2} title="Counter 2" />

                <Button handleClick={increamentbyFive}>
                    Increament by Five
                </Button>
            </div>
        </>
    );
}

export default App;
```

We have two independent state variables:

```jsx
const [count1, setCount1] = useState(0);
const [count2, setCount2] = useState(0);
```

We also have two functions wrapped in `useCallback()`.

```jsx
const increamentbyOne = useCallback(() => {
    setCount1(prev => prev + 1);
}, []);

const increamentbyFive = useCallback(() => {
    setCount2(prev => prev + 1);
}, []);
```

**Why is the dependency array empty?**

Because we are using functional state updates:

```jsx
setCount1(prev => prev + 1);
```

We don't directly access `count1` inside the function. React provides the previous state through `prev`.

Therefore, we don't need `count1` or `count2` in the dependency arrays.

---

## 4. What Happens During Initial Rendering?

When the application starts, all five child components render.

Console output:

```text
Rendering title ....
Rendering Counter 1....
Rendering button Increament by one
Rendering Counter 2....
Rendering button Increament by Five
```

At this point:

```text
count1 = 0
count2 = 0
```

Both callback functions have been created and their references are cached by React.

Let's call them:

```text
increamentbyOne   → Function A
increamentbyFive  → Function B
```

---

## 5. What Happens When We Click "Increament by one"?

### Step 1: Function execution

Clicking the first button executes:

```jsx
increamentbyOne();
```

Inside that function:

```jsx
setCount1(prev => prev + 1);
```

The state changes:

```text
count1: 0 → 1
count2: 0
```

### Step 2: App re-renders

Since `count1` changed, React re-renders the `App` component.

This means the entire `App` function executes again.

Normally, functions declared inside a component would be recreated during this re-render.

However, we used `useCallback()`.

### Step 3: Function references remain unchanged

Because the dependency arrays are empty, React returns the previously cached function references.

Before re-rendering:

```text
increamentbyOne   → Function A
increamentbyFive  → Function B
```

After re-rendering:

```text
increamentbyOne   → Function A
increamentbyFive  → Function B
```

**Important:** Clicking a button executes its function. It does not create a new function reference.

We can execute Function A multiple times while retaining the same reference.

### Step 4: React.memo compares the props

Now React checks the props of each child component.

| Component | Previous props | New props | Re-render? |
|---|---|---|---|
| Title | No props | No props | No |
| ShowCount 1 | count = 0 | count = 1 | Yes |
| Button 1 | Function A | Function A | No |
| ShowCount 2 | count = 0 | count = 0 | No |
| Button 2 | Function B | Function B | No |

Only `ShowCount 1` receives a changed prop.

Therefore, only that component renders again.

**Console output:**

```text
Rendering Counter 1....
```

---

## 6. What Happens When We Click "Increament by Five"?

Exactly the opposite happens.

First:

```text
count1 = 1
count2 = 0
```

After clicking the second button:

```text
count1 = 1
count2 = 1
```

`App` re-renders, but both callback references remain unchanged.

React.memo compares the props:

| Component | Previous props | New props | Re-render? |
|---|---|---|---|
| Title | No props | No props | No |
| ShowCount 1 | count = 1 | count = 1 | No |
| Button 1 | Function A | Function A | No |
| ShowCount 2 | count = 0 | count = 1 | Yes |
| Button 2 | Function B | Function B | No |

**Console output:**

```text
Rendering Counter 2....
```

---

## 7. What If We Remove useCallback()?

Suppose we replace:

```jsx
const increamentbyOne = useCallback(() => {
    setCount1(prev => prev + 1);
}, []);
```

With:

```jsx
const increamentbyOne = () => {
    setCount1(prev => prev + 1);
};
```

Now, every time `App` re-renders, a new function reference is created.

For example:

```text
Before re-render:
increamentbyOne → Function A

After re-render:
increamentbyOne → Function C
```

When `React.memo()` compares the Button's props:

```text
Previous handleClick = Function A
New handleClick      = Function C
```

Since the references are different, React considers the props changed.

Consequently, the Button re-renders unnecessarily.

This is the problem `useCallback()` helps solve.

---

## 8. React.memo() vs useCallback()

| React.memo() | useCallback() |
|---|---|
| Wraps a component | Wraps a function |
| Helps prevent unnecessary component re-renders | Preserves function references |
| Compares previous and new props | Compares dependency values |
| Useful for optimizing child components | Useful when passing functions to memoized children |

They work together, but they solve different problems.

---

## 9. Final Concepts to Remember

1. Every time a component re-renders, ordinary functions declared inside it are recreated.
2. Calling a function does not change its reference.
3. Different function references are not inherently bad.
4. Different references can cause unnecessary child re-renders when passed as props to a component wrapped in `React.memo()`.
5. `useCallback()` caches a function reference between renders while its dependencies remain unchanged.
6. `React.memo()` compares props to determine whether a child can skip rendering.
7. `useCallback()` does not execute a function automatically.
8. `useCallback()` caches a function reference, whereas `useMemo()` caches a calculation's returned value.

### The Most Important Example

```jsx
const greet = () => console.log("Hello");

greet();
greet();
greet();
greet();
```

- Function executions: 4
- Function references created: 1

**Executing a function and creating a function are two different things.**

That is the fundamental concept behind understanding `useCallback()`.