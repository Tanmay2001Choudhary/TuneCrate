import React, { useState } from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import '../scss/SearchBar.scss';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    return (
        <div className="search-bar">
            <InputGroup>
                <FormControl
                    placeholder="Search Song, Artist"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <InputGroup.Text>
                    <BsSearch />
                </InputGroup.Text>
            </InputGroup>
        </div>
    );
};

export default SearchBar;
