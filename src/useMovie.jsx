import { useEffect, useState } from "react";
function useMovie(query) {
  const [movies, setMovies] = useState([]); // 电影列表
  const [isloading, setisloading] = useState(false); // 是否加载中
  const [error, seterror] = useState(""); // 错误信息
  const key = "d461809b"; // API Key
  useEffect(
    function () {
      const controller = new AbortController(); // 创建 AbortController 实例，用于取消 fetch 请求

      async function fetchMovie() {
        try {
          setisloading(true); // 设置加载状态为 true
          seterror(""); // 清空错误信息
          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`,
            { signal: controller.signal }
          ); // 发起 API 请求

          if (!res.ok) {
            throw new Error("出错了");
          }

          const data = await res.json(); // 解析响应数据

          if (data.Response === "false") {
            throw new Error("找不到电影了");
          }

          setMovies(data.Search); // 更新电影列表数据
          setisloading(false); // 设置加载状态为 false
          seterror(""); // 清空错误信息
        } catch (err) {
          console.error(err);
          if (err.name !== "AbortError") {
            seterror(err.message); // 设置错误信息
          }
        } finally {
          setisloading(false); // 设置加载状态为 false
        }
      }

      // 如果搜索关键词为空，则清空电影列表并返回
      if (!query.length) {
        setMovies([]); // 清空电影列表
        seterror(""); // 清空错误信息
        return;
      }
      fetchMovie(); // 执行 API 请求
      return function () {
        controller.abort(); // 组件卸载时取消请求
      };
    },
    [query]
  ); // 每当搜索关键词发生变化时重新执行
}

export default useMovie;
