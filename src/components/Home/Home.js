import React, { Component } from 'react'
import FourColGrid from '../elements/FourColGrid/FourColGrid';
import HeroImage from '../elements/HeroImage/HeroImage';
import LoadMoreBtn from '../elements/LoadMoreBtn/LoadMoreBtn';
import MovieThumb from '../elements/MovieThumb/MovieThumb';
import SearchBar from '../elements/SearchBar/Searchbar';
import Spinner from '../elements/Spinner/Spinner';
import './Home.css';
import { API_URL, API_KEY, IMAGE_BASE_URL, BACKDROP_SIZE, POSTER_SIZE } from '../../config';

class Home extends Component {

    state = {
        movies: [],
        heroImage: null,
        loading: false,
        currentPage: 0,
        totalPages: 0,
        searchTerm: ''
    }

    componentDidMount() {
        if(sessionStorage.getItem('HomeState')) {
            const state = JSON.parse(sessionStorage.getItem('HomeState'));
            this.setState({ ...state });
        } else {
            this.setState({ loading: true });
            this.fetchItems(this.popularEndpoint(false)(""));
        }
    }

    //----------------------------------------------------------------------------------------------------------------------

    curriedEndPoint = (type) => (loadMore) => (searchTerm) =>
        `${API_URL}${type}?api_key=${API_KEY}&language=en-US&page=${loadMore && this.state.currentPage + 1}&query=${searchTerm}`;
    
    searchEndpoint = this.curriedEndPoint("search/movie");
    popularEndpoint = this.curriedEndPoint("movie/popular");

    //----------------------------------------------------------------------------------------------------------------------

    updateItems = (loadMore, searchTerm) => {
        this.setState({
            movies: loadMore ? [...this.state.movies] : [],
            loading: true,
            searchTerm: loadMore ? this.state.searchTerm: searchTerm 
        }, () => {
            // Check if we have a searchTerm, and create different endpoints depending on it.
            this.fetchItems(!this.state.searchTerm
                ? this.popularEndpoint(loadMore)("")
                : this.searchEndpoint(loadMore)(this.state.searchTerm)
            );
        });
    }

    //----------------------------------------------------------------------------------------------------------------------

    // Fetch movie data in asynchronous manner depending on the endPoint
    fetchItems = async (endPoint) => {
        const { movies, heroImage, searchTerm } = this.state;
        try {
            const result = await ( await fetch(endPoint) ).json();
            this.setState({
                // When we load more movies, we want the old movies that are loaded to be showing as well.
                // To do that we copy the old movies using the spread operator and appending the new ones.
                movies: [...movies, ...result.results],
                heroImage: heroImage || result.results[0],
                loading: false,
                currentPage: result.page,
                totalPages: result.total_pages
            }, () => {
                if(searchTerm === ""){
                    sessionStorage.setItem('HomeState', JSON.stringify(this.state));
                }
            });
        } catch (err) {
            console.error('Error', err)
        }
    }

    //----------------------------------------------------------------------------------------------------------------------

    render() {
        const { movies, heroImage, loading, currentPage, totalPages, searchTerm } = this.state;
        return (
            <div className = "rmdb-home" >
                {heroImage && !searchTerm ? 
                <div>
                    <HeroImage
                    image = {`${IMAGE_BASE_URL}${BACKDROP_SIZE}${heroImage.backdrop_path}`}
                    title = {heroImage.original_title}
                    text = {heroImage.overview}
                    />
                    
                </div> : null
                }
                <SearchBar callback = {this.updateItems} />
                <div className="rmdb-home-grid">
                    <FourColGrid
                    header = {searchTerm ? 'Search Result' : 'Popular Movies'}
                    loading = {loading}>
                        {movies.map((element, i) => {
                            return <MovieThumb
                            key = {i}
                            clickable = {true}
                            image = {element.poster_path ? `${IMAGE_BASE_URL}${POSTER_SIZE}${element.poster_path}`: './images/no_image.jpg'}
                            movieId = {element.id}
                            movieName = {element.original_title}
                            />
                        })}
                    </FourColGrid>
                    {loading ? <Spinner/> : null}
                    {(currentPage < totalPages && !loading) ?
                    <LoadMoreBtn text = "Load More" onClick = {this.updateItems}/> : null }
                </div>
                
                
            </div>
        )
    }
    //----------------------------------------------------------------------------------------------------------------------
}

export default Home;