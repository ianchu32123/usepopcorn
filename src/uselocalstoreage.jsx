// import { useState, useEffect } from "react";

// function uselocalstoreage(initialState, key) {
//   const [value, setvalue] = useState(function () {
//     const storevalue = localStorage.getItem(key);
//     return storevalue ? JSON.parse(storevalue) : initialState;
//   }); /* 將資料儲存在本地端 */

//   useEffect(
//     function () {
//       localStorage.setItem(key, JSON.stringify(watched));
//     },
//     [value, key]
//   ); /* 將資料儲存在本地端 */

//   return [value, setvalue];
// }

// export default uselocalstoreage;
