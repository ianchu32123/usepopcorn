import { useEffect, useState } from "react";
import StarRating from "./StarRating"; // 引入 StarRating 组件

// 计算数组平均值的函数
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  // 定义状态变量
  const [query, setQuery] = useState(""); // 搜索关键词
  const [movies, setMovies] = useState([]); // 电影列表
  const [watched, setWatched] = useState([]); // 观看过的电影列表
  const [isloading, setisloading] = useState(false); // 是否加载中
  const [error, seterror] = useState(""); // 错误信息
  const [selectid, setselectid] = useState(null); // 当前选中的电影ID
  const key = "d461809b"; // API Key

  // 删除观看过的电影
  function handledeletewatched(id) {
    setWatched((watched) =>
      watched.filter((movie) => movie.imdbID !== id)
    ); /* 回调函数中使用 filter 方法遍历观看过的电影列表，保留那些不等于指定 ID 的电影。
    这样就实现了将指定 ID 的电影从观看过的电影列表中移除的功能。 */
  }

  // 选中电影
  function handleSelectmovie(id) {
    setselectid(id);
  }

  // 关闭电影详情页
  function handleClose() {
    setselectid(null);
  }

  // 添加观看过的电影
  function handleAddWatched(movie) {
    setWatched((watched) => [
      ...watched,
      movie,
    ]); /* 回调函数中使用扩展运算符 [...watched] 创建了观看过的电影列表的一个副本。
    将新观看的电影 movie 添加到副本中。 watched原本預設是空的 */
  }

  // useEffect Hook，在查询关键词改变时执行
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

  return (
    <>
      {/* 导航栏组件 */}
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </Navbar>

      {/* 主要内容区域 */}
      <Main>
        {/* 左侧内容盒子 */}
        <Box>
          {isloading && <Loader />} {/* 加载状态时显示加载器 */}
          {!isloading && !error && (
            <MovieList movies={movies} onSelectmovie={handleSelectmovie} />
          )}{" "}
          {/* 非加载状态且无错误时显示电影列表 */}
          {error && <Errormessage message={error} />} {/* 显示错误信息 */}
        </Box>

        {/* 右侧内容盒子 */}
        <Box>
          {/* 根据是否选中电影显示不同内容 */}
          {selectid ? (
            <MovieDetails
              selectid={selectid}
              onclosemovie={handleClose}
              onAddwatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchList
                watched={watched}
                ondeletewatched={handledeletewatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// 加载器组件
function Loader() {
  return <p className="loader">Loading...</p>;
}

// 错误信息组件
function Errormessage({ message }) {
  return (
    <p className="error">
      <span>X</span>
      {message}
    </p>
  );
}

// 导航栏组件
function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Logo 组件
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// 搜索组件
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// 电影数量组件
function Numresult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

// 主要内容区域组件
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// 内容盒子组件
function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box scrollbar">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

// 电影列表组件
function MovieList({ movies, onSelectmovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectmovie={onSelectmovie}
        /> /* movies是電影列表，对每个电影对象执行一个函数，该函数接收一个参数 movie，代表当前正在处理的电影对象。 */
      ))}
    </ul>
  );
}

// 电影组件
function Movie({ movie, onSelectmovie }) {
  return (
    /* {() => onSelectmovie(movie.imdbID)} 的作用是创建了一个匿名函数，在触发事件时才会调用 onSelectmovie 函数，并将 movie.imdbID 作为参数传递给它。 */
    <li onClick={() => onSelectmovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// 电影详情组件
function MovieDetails({ selectid, onclosemovie, onAddwatched, watched }) {
  const key = "d461809b"; // API Key
  const [movie, setMovie] = useState({}); // 电影详情数据
  const [userrating, setuserrating] = useState(""); // 用户评分
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie; // 解构电影详情数据

  // 检查电影是否已观看
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectid);

  // 获取已观看电影的用户评分
  const watchedUserrating =
    watched.find((movie) => movie.imdbID === selectid)?.userrating || "N/A";

  // 处理添加观看过的电影事件
  function handleadd() {
    const newWatchMovie = {
      imdbID: selectid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userrating,
    };
    onAddwatched(newWatchMovie); // 调用添加观看过的电影函数
    onclosemovie(); // 关闭电影详情页
  }

  // 获取电影详情数据
  useEffect(() => {
    async function getMovieDetails() {
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&i=${selectid}`
      );
      const data = await res.json();
      setMovie(data);
    }
    getMovieDetails();
  }, [selectid]);

  // 设置页面标题
  useEffect(
    function () {
      document.title = title;
      return function () {
        document.title = "use popcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onclosemovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDB rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRating={10}
                size={28}
                onsetrating={setuserrating}
              />
              <button className="btn-add" onClick={handleadd}>
                + add movie here
              </button>
            </>
          ) : (
            <p> you rated with movie {watchedUserrating}⭐️</p>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Direct by {director}</p>
      </section>
    </div>
  );
}

// 观看总结组件
function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)); // 平均 IMDB 评分
  const avgUserRating = average(watched.map((movie) => movie.userRating)); // 平均用户评分
  const avgRuntime = average(watched.map((movie) => movie.runtime)); // 平均片长
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

// 观看列表组件
function WatchList({ watched, ondeletewatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovie movie={movie} ondeletewatched={ondeletewatched} />
      ))}
    </ul>
  );
}

// 观看电影组件
function WatchMovie({ movie, ondeletewatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => ondeletewatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
