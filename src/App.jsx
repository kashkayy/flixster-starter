import { useState, useEffect} from "react";
import "./App.css";
import Header from "./components/Header.jsx";
import MovieList from "./components/movielist";
import Search from "./components/Search.jsx";
import Footer from "./components/Footer.jsx";
import SortDropDown from "./components/Sort.jsx";
import SideBar from "./components/Sidebar.jsx";
export default function App() {
  // I declared all the state variables that handled logic of my app.
  const [sortOption, setSortOption] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page,setPage] = useState(1)
  const [selectedMovie, setSelectedMovie] = useState({})
  const [clearSignal, setClearSignal] = useState(0)
  const [favoriteMovies, setFavoriteMovies] = useState([])
  const [watchedMovies, setWatchedMovies] = useState([])
  const [isHome, setIsHome] = useState(false)
  
  // This is used when fetching data from the TMDb api
  const API_KEY = import.meta.env.VITE_ACCESS_TOKEN_AUTH
  const options = {
      method: 'GET',
      headers: {
        Authorization:`Bearer ${API_KEY}`,
        accept: "application/json",
      },
    }
    async function fetchNowPlaying(pageNum){
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?page=${pageNum}`, options);
      const data = await response.json()
      setMovies((prevMovies) =>[...prevMovies, ...data.results])
    } catch (error) {
      console.error("Now playing movies fetch failed: ",error)
    }
  };
  // This function handles the logic behind search results
  async function handleSearch(input){
    if(input === ""){
      return
    }
    setIsSearching(true)
    setSearchTerm(input)
    setPage(1)
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${input}`,options);
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error("Searching error: ", error);
    }
  }
  //This function is called after a search is displayed and user wants to clear the results which automatically takes them back to the home page(nowplaying)
  function clearSearch(){
    setIsSearching(false)
    setSearchTerm("")
    setPage(1)
    setMovies([])
    fetchNowPlaying(1)
    setClearSignal((prev) => prev + 1)

  }
  //This function handles the logic behind loading more movies that are "nowplaying"
  function loadMore(){
    const nextPage = page + 1;
    setPage(nextPage)
    fetchNowPlaying(nextPage);
  }
  //Sidebar functionality
  function handleFavorite(movie){
    const alreadyFavorited = favoriteMovies.some((fav) => fav.id===movie.id)
    if (alreadyFavorited){
      const updated = favoriteMovies.filter(fav => fav.id !== movie.id)
      setFavoriteMovies(updated)
    }
    else{
      setFavoriteMovies([...favoriteMovies, movie])
    }
  }
  function goHomeFunc(){
    setIsHome(true)
    setMovies([])
    fetchNowPlaying(1)
  }
  function showFavorites(){
    setIsSearching(false)
    setMovies(favoriteMovies)
  }
  function handleWatched(movie){
    const alreadyWatched = watchedMovies.some((seen) => seen.id===movie.id)
    if (alreadyWatched){
      const updated = watchedMovies.filter(seen => seen.id !== movie.id)
      setWatchedMovies(updated)
    }
    else{
      setWatchedMovies([...watchedMovies, movie])
    }
  }
  function showWatched(){
    setIsSearching(false)
    setMovies(watchedMovies)
  }
  // This handles the logic behind sorting movies based on users preference.
  const sortedMovies = [...movies];
  if(sortOption==="title"){
    sortedMovies.sort((a,b) => a.title.localeCompare(b.title))
  }
  else if(sortOption==="release_date"){
    sortedMovies.sort((a,b) => new Date(b.release_date) - new Date(a.release_date))
  }
  else if(sortOption==="vote_average"){
    sortedMovies.sort((a,b) => b.vote_average - a.vote_average)
  }
  // This ensures that our home page is the first page of "nowplaying" movies
  useEffect(() => {
    fetchNowPlaying(1);
  }, [])
  // RENDERING
  return (
    <div className="App">
       <Header />
      {/* I created a div for the form input field, clear button and search button for better styling. */}
      <hr></hr>
      <div id="search-and-sort">
        <div id="search-and-clear">
          <Search searched={handleSearch} clearSignal={clearSignal}/>
          <div>{isSearching && <button onClick={clearSearch} id="clear-btn">Clear</button>}</div>
        </div>
        <div id="sort-bar">
          <SortDropDown onSortDropDownChange={setSortOption}/>
        </div>
      </div>
      <div id="wrapper">
        <SideBar onShowFavorites={showFavorites} goHome={goHomeFunc} onShowWatched={showWatched}/>
        <MovieList results={sortedMovies} sortBy={sortOption} toggleFavorite={handleFavorite} toggleWatched={handleWatched} />
      </div>
      {/* I used conditional rendering to prevent load more button from appearing on the search results page */}
      <div id="load-more-container">{!isSearching && (<button onClick={loadMore} id="load-more">Load More</button>)}</div>
      <Footer />
    </div>
  );
}
