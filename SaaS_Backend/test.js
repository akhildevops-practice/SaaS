function maximumSum(arr, k) {
  const n = arr.length;
  const result = [];
  const deque = [];

  //   1, 3, -1, -3, 5, 3, 6, 7
  //     0, 1, 2, 3, 4, 5, 6;
  for (let i = 0; i < n; i++) {
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }
    while (deque.length > 0 && arr[deque[deque.length - 1]] < arr[i]) {
      deque.pop();
    }

    deque.push(i);

    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
  }
  return result;
}

console.log(maximumSum([1, 3, -1, -3, 5, 3, 6, 7], 3));
// test.js
