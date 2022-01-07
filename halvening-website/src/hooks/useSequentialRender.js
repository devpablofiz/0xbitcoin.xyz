import { useReducer } from "react";

const loadedProperty = "__loaded";

const reducer = (state, { i, type }) => {
  switch (type) {
    case "ready":
      const copy = [...state];
      copy[i][loadedProperty] = true;
      return copy;
    default:
      return state;
  }
};

const defaults = {
  afterEach: i => {},
  maxTimeout: 3000
};

export const useSequentialRenderer = (input, options = defaults) => {
  const [state, dispatch] = useReducer(options.reducer || reducer, input);

  const index = state.findIndex(a => !a[loadedProperty]);
  const sliced = index < 0 ? state.slice() : state.slice(0, index + 1);

  const items = sliced.map((item, i) => {
    const done = function() {
      dispatch({ type: "ready", i });
      return i;
    };

    return { ...item, done };
  });

  /**
   * This has a bit of a bug whereby the timer restarts if another item has been skipped
   * due to a timeout and then we've moved on. For example if maxTimeoutt is 2 seconds,
   * if item one is skipped due to hitting the max timeout and item two starts to load,
   * item two's timer may get to 1.9seconds but then item one finishes. This causes items
   * to change and therefore item two's timer to restart meaning that the maxTimeout
   * can be repeated many times and technically isn't a maximum, but more of an eventual
   * safeguard preventing the sequence from continuing.
   */
  // useEffect(() => {
  //   if (options.maxTimeout) {
  //     const item = items[items.length - 1];

  //     if (!item[loadedProperty]) {
  //       const timer = setTimeout(() => {
  //         console.log("timeout hit", items.length - 1);
  //         items[items.length - 1].done();
  //       }, opteions.maxTimeout);

  //       return () => clearTimeout(timer);
  //     }
  //   }
  // }, [items, options.maxTimeout]);

  // const finished = items.every(item => item[loadedProperty]);

  // console.log(finished)
  const finished = 1;

  return { items, finished };
};
