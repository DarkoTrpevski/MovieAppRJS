import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome';
import './SearchBar.css';

class Searchbar extends Component {

    state = {
        value: ''
    }

    timeOut = null;

    search = (event) => {
        const { callback } = this.props;
        this.setState({ value: event.target.value });
        clearTimeout(this.timeOut);
        // Set a timeout for the user to stop writting before starting the search
        this.timeOut = setTimeout(() => {
            callback(false, this.state.value);
        }, 500);
    }

    render() {

        return (
            <div className="rmdb-searchbar">
                <div className="rmdb-searchbar-content">
                <FontAwesome className = "rmdb-fa-search" name = "search" size = "2x"/>
                <input
                type = "text"
                className = "rmdb-searchbar-input"
                placeholder = "Search"
                onChange = {this.search}
                value = {this.state.value}/>
                </div>
            </div>
        )

    }
}
export default Searchbar;